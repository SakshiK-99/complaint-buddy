const Complaint = require('../models/Complaint');

// Generates IDs like CC-2026-000123
async function generateComplaintId() {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments({
    complaintId: { $regex: `^CC-${year}-` },
  });
  const seq = String(count + 1).padStart(6, '0');
  return `CC-${year}-${seq}`;
}

module.exports = { generateComplaintId };
