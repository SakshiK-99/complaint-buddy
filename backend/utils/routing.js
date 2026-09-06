// Simple category -> department routing config. Easy to change.
const CATEGORY_TO_DEPARTMENT = {
  Academic: 'Academic Department',
  Faculty: 'Academic Department',
  Infrastructure: 'Maintenance',
  Hostel: 'Hostel Department',
  Transport: 'Transport Department',
  Canteen: 'Canteen Department',
  Examination: 'Examination Cell',
  Harassment: 'Student Welfare',
  Other: 'Administration',
};

function getDepartmentForCategory(category) {
  return CATEGORY_TO_DEPARTMENT[category] || 'Administration';
}

// Priority determines the initial authority a complaint is routed to.
function getInitialAssignedRole(priority, category) {
  if (category === 'Harassment') return 'principal';
  switch (priority) {
    case 'Urgent':
      return 'hod'; // urgent can skip straight to HOD
    case 'High':
      return 'mentor';
    case 'Medium':
      return 'mentor';
    case 'Low':
    default:
      return 'cr';
  }
}

const ESCALATION_CHAIN = ['cr', 'mentor', 'hod', 'principal'];

function getNextRole(currentRole) {
  const idx = ESCALATION_CHAIN.indexOf(currentRole);
  if (idx === -1 || idx === ESCALATION_CHAIN.length - 1) return currentRole;
  return ESCALATION_CHAIN[idx + 1];
}

module.exports = { getDepartmentForCategory, getInitialAssignedRole, getNextRole, ESCALATION_CHAIN };
