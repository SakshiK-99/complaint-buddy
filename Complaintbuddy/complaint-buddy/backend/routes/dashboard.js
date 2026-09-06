const express = require('express');
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');
const { findRecurringIssues } = require('../utils/similarity');

const router = express.Router();

// Stats for the logged-in user's dashboard (student or authority)
router.get('/stats', protect, async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      filter.studentReference = req.user._id;
    } else if (['cr', 'mentor', 'hod'].includes(req.user.role)) {
      filter.assignedRole = req.user.role;
    }
    const complaints = await Complaint.find(filter);

    const stats = {
      total: complaints.length,
      submitted: complaints.filter((c) => c.status === 'Submitted').length,
      underReview: complaints.filter((c) => c.status === 'Under Review').length,
      inProgress: complaints.filter((c) => c.status === 'In Progress').length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length,
      urgent: complaints.filter((c) => c.priority === 'Urgent').length,
      pending: complaints.filter((c) => c.status !== 'Resolved').length,
    };
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

// Full analytics for admin/principal
router.get('/analytics', protect, authorize('admin', 'principal', 'hod'), async (req, res, next) => {
  try {
    const complaints = await Complaint.find();

    const byCategory = {};
    const byPriority = {};
    const byStatus = {};
    const byDepartment = {};
    const byMonth = {};

    let resolvedCount = 0;
    let totalResolutionMs = 0;

    complaints.forEach((c) => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byDepartment[c.department] = (byDepartment[c.department] || 0) + 1;

      const month = new Date(c.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      byMonth[month] = (byMonth[month] || 0) + 1;

      if (c.status === 'Resolved' && c.resolvedAt) {
        resolvedCount += 1;
        totalResolutionMs += new Date(c.resolvedAt) - new Date(c.createdAt);
      }
    });

    const avgResolutionDays = resolvedCount > 0 ? (totalResolutionMs / resolvedCount / (1000 * 60 * 60 * 24)).toFixed(1) : null;

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const topDepartment = Object.entries(byDepartment).sort((a, b) => b[1] - a[1])[0];

    const recurring = findRecurringIssues(complaints);

    res.json({
      totals: {
        total: complaints.length,
        resolved: byStatus['Resolved'] || 0,
        pending: complaints.length - (byStatus['Resolved'] || 0),
        urgent: byPriority['Urgent'] || 0,
        avgResolutionDays,
      },
      byCategory,
      byPriority,
      byStatus,
      byMonth,
      mostCommonCategory: topCategory ? topCategory[0] : null,
      mostAffectedDepartment: topDepartment ? topDepartment[0] : null,
      repeatedIssueCount: recurring.length,
      recurringIssues: recurring,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
