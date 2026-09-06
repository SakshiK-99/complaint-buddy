const express = require('express');
const WeeklyReport = require('../models/WeeklyReport');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Mentor creates/saves a weekly report
router.post('/weekly', protect, authorize('mentor'), async (req, res, next) => {
  try {
    const { week, department, commonConcerns, academicConcerns, infrastructureConcerns, otherConcerns, recurringIssues, mentorRemarks, status } = req.body;
    if (!week || !department) {
      return res.status(400).json({ message: 'Week and department are required' });
    }
    const report = await WeeklyReport.create({
      mentor: req.user._id,
      week,
      department,
      commonConcerns,
      academicConcerns,
      infrastructureConcerns,
      otherConcerns,
      recurringIssues,
      mentorRemarks,
      status: status === 'Submitted' ? 'Submitted' : 'Draft',
    });
    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
});

// Update an existing report (e.g. draft -> submitted)
router.patch('/weekly/:id', protect, authorize('mentor'), async (req, res, next) => {
  try {
    const report = await WeeklyReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (String(report.mentor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own reports' });
    }
    Object.assign(report, req.body);
    await report.save();
    res.json({ report });
  } catch (err) {
    next(err);
  }
});

// List reports - mentor sees own, admin/hod/principal see all
router.get('/weekly', protect, async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'mentor') filter.mentor = req.user._id;
    const reports = await WeeklyReport.find(filter).populate('mentor', 'name department').sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

router.get('/weekly/:id', protect, async (req, res, next) => {
  try {
    const report = await WeeklyReport.findById(req.params.id).populate('mentor', 'name department');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (req.user.role === 'mentor' && String(report.mentor._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot view this report' });
    }
    res.json({ report });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
