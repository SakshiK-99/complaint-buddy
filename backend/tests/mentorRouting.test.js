const test = require('node:test');
const assert = require('node:assert/strict');
const { getComplaintRouting } = require('../utils/mentorRouting');

test('students with a mentor are routed to mentor first', () => {
  const result = getComplaintRouting({ _id: 'student-1', mentorId: 'mentor-9' }, 'High', 'Academic');

  assert.equal(result.assignedRole, 'mentor');
  assert.equal(result.mentorId, 'mentor-9');
});

test('students without a mentor keep the normal authority routing', () => {
  const result = getComplaintRouting({ _id: 'student-2' }, 'Low', 'Infrastructure');

  assert.equal(result.assignedRole, 'cr');
  assert.equal(result.mentorId, undefined);
});
