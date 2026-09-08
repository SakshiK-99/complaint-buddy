const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderRole: { type: String, required: true },
    senderLabel: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const escalationSchema = new mongoose.Schema(
  {
    fromRole: { type: String, required: true },
    toRole: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    studentReference: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Academic', 'Infrastructure', 'Faculty', 'Hostel', 'Transport', 'Canteen', 'Examination', 'Harassment', 'Other'],
      required: true,
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Low' },
    department: { type: String, required: true },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved'],
      default: 'Submitted',
    },
    assignedRole: { type: String, enum: ['cr', 'mentor', 'hod', 'principal', 'admin'], default: 'cr' },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    anonymous: { type: Boolean, default: true },
    evidence: [{ filename: String, originalName: String, mimeType: String }],
    messages: [messageSchema],
    escalationHistory: [escalationSchema],
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
