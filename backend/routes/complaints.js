const express = require('express');
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { generateComplaintId } = require('../utils/complaintId');
const { getDepartmentForCategory, getNextRole } = require('../utils/routing');
const { getComplaintRouting } = require('../utils/mentorRouting');

const router = express.Router();

const AUTHORITY_ROLES = ['cr', 'mentor', 'hod', 'principal', 'admin'];

function publicComplaintView(complaint, viewerRole) {
  const obj = complaint.toObject();
  // Students (and the discussion UI) never see the real student identity.
  delete obj.studentReference;
  return obj;
}

// Create complaint (student only)
router.post('/', protect, authorize('student'), upload.array('evidence', 5), async (req, res, next) => {
  try {
    const { title, description, category, priority, department } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description and category are required' });
    }
    const complaintId = await generateComplaintId();
    const resolvedDepartment = department || getDepartmentForCategory(category);
    const studentProfile = await require('../models/User').findById(req.user._id).select('mentorId');
    const routing = getComplaintRouting(studentProfile, priority || 'Low', category);

    const evidence = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      mimeType: f.mimetype,
    }));

    const complaint = await Complaint.create({
      complaintId,
      studentReference: req.user._id,
      title,
      description,
      category,
      priority: priority || 'Low',
      department: resolvedDepartment,
      assignedRole: routing.assignedRole,
      mentorId: routing.mentorId || null,
      anonymous: true,
      evidence,
    });

    res.status(201).json({ complaint: publicComplaintView(complaint) });
  } catch (err) {
    next(err);
  }
});

// Get complaints - students see only their own, authorities see assigned-to-them (or all for admin/principal)
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, priority, category, department, search } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      filter.studentReference = req.user._id;
    } else if (req.user.role === 'mentor') {
      const menteeIds = await require('../models/User').find({ mentorId: req.user._id }).select('_id');
      filter.$or = [
        { assignedRole: 'mentor', mentorId: req.user._id },
        { studentReference: { $in: menteeIds.map((u) => u._id) } },
      ];
    } else if (['cr', 'hod'].includes(req.user.role)) {
      filter.assignedRole = req.user.role;
    } // principal & admin see everything

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    // Urgent first for authority views
    const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
    complaints.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const isAuthority = AUTHORITY_ROLES.includes(req.user.role) && req.user.role !== 'student';
    const result = complaints.map((c) => publicComplaintView(c, req.user.role));
    res.json({ complaints: result });
  } catch (err) {
    next(err);
  }
});

// Track by complaintId (public to logged-in student, no auth requirement for tracking page could be relaxed,
// but we require auth to know which user is tracking / keep it simple & secure)
router.get('/track/:complaintId', protect, async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId });
    if (!complaint) {
      return res.status(404).json({ message: 'No complaint found with this ID' });
    }
    if (req.user.role === 'student' && String(complaint.studentReference) !== String(req.user._id)) {
      return res.status(403).json({ message: 'This complaint does not belong to your account' });
    }
    res.json({ complaint: publicComplaintView(complaint) });
  } catch (err) {
    next(err);
  }
});

// Get single complaint details
router.get('/:id', protect, async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role === 'student' && String(complaint.studentReference) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot view this complaint' });
    }
    res.json({ complaint: publicComplaintView(complaint) });
  } catch (err) {
    next(err);
  }
});

// Update status (authority only)
router.patch('/:id/status', protect, authorize('cr', 'mentor', 'hod', 'principal', 'admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status;
    if (status === 'Resolved') complaint.resolvedAt = new Date();
    await complaint.save();
    res.json({ complaint: publicComplaintView(complaint) });
  } catch (err) {
    next(err);
  }
});

// Escalate complaint
router.post('/:id/escalate', protect, authorize('cr', 'mentor', 'hod', 'principal', 'admin'), async (req, res, next) => {
  try {
    const { reason, toRole } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const nextRole = toRole || getNextRole(complaint.assignedRole);
    if (nextRole === complaint.assignedRole) {
      return res.status(400).json({ message: 'This complaint is already at the highest escalation level' });
    }

    complaint.escalationHistory.push({
      fromRole: complaint.assignedRole,
      toRole: nextRole,
      reason: reason || '',
    });
    complaint.assignedRole = nextRole;
    if (complaint.status === 'Submitted') complaint.status = 'Under Review';
    await complaint.save();
    res.json({ complaint: publicComplaintView(complaint) });
  } catch (err) {
    next(err);
  }
});

// Add message (anonymous discussion)
router.post('/:id/messages', protect, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role === 'student' && String(complaint.studentReference) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot message on this complaint' });
    }

    const senderLabel = req.user.role === 'student' ? 'Anonymous Student' : `Authority (${req.user.role.toUpperCase()})`;

    complaint.messages.push({
      senderRole: req.user.role,
      senderLabel,
      text: text.trim(),
    });
    await complaint.save();
    res.status(201).json({ complaint: publicComplaintView(complaint) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
