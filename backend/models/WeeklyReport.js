const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema(
  {
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    week: { type: String, required: true },
    department: { type: String, required: true },
    commonConcerns: { type: String, default: '' },
    academicConcerns: { type: String, default: '' },
    infrastructureConcerns: { type: String, default: '' },
    otherConcerns: { type: String, default: '' },
    recurringIssues: { type: String, default: '' },
    mentorRemarks: { type: String, default: '' },
    status: { type: String, enum: ['Draft', 'Submitted'], default: 'Draft' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
