function getComplaintRouting(student, priority = 'Low', category = 'Other') {
  const assignedRole = student && student.mentorId ? 'mentor' : getInitialAssignedRole(priority, category);

  return {
    assignedRole,
    mentorId: student && student.mentorId ? student.mentorId : undefined,
  };
}

function getInitialAssignedRole(priority, category) {
  if (category === 'Harassment') return 'principal';
  switch (priority) {
    case 'Urgent':
      return 'hod';
    case 'High':
    case 'Medium':
      return 'mentor';
    case 'Low':
    default:
      return 'cr';
  }
}

module.exports = { getComplaintRouting, getInitialAssignedRole };
