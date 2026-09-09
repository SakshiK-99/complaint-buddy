const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'cr', 'mentor', 'hod', 'principal', 'admin'],
      default: 'student',
    },
    studentId: { type: String },
    department: { type: String, default: 'General' },
    year: { type: String },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
