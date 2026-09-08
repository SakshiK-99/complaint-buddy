const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get('/mentors', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ message: 'Only admins and mentors can view mentor lists' });
    }
    const mentors = await User.find({ role: 'mentor' }).select('-password').sort({ name: 1 });
    res.json({ mentors });
  } catch (err) {
    next(err);
  }
});

router.get('/mentees', protect, authorize('mentor'), async (req, res, next) => {
  try {
    const mentees = await User.find({ mentorId: req.user._id }).select('-password').sort({ name: 1 });
    res.json({ mentees });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/mentor', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { mentorId } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (mentorId && mentorId !== 'null') {
      const mentor = await User.findById(mentorId);
      if (!mentor || mentor.role !== 'mentor') {
        return res.status(400).json({ message: 'Invalid mentor selected' });
      }
      targetUser.mentorId = mentor._id;
    } else {
      targetUser.mentorId = null;
    }

    await targetUser.save();
    res.json({ user: { ...targetUser.toObject(), password: undefined } });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/role', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ['student', 'cr', 'mentor', 'hod', 'principal', 'admin'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = status;
    await user.save();
    res.json({ user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
