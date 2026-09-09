const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function sanitize(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    department: user.department,
    year: user.year,
    mentorId: user.mentorId,
    status: user.status,
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, studentId, department, year } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      studentId,
      department: department || 'General',
      year,
      role: 'student',
    });
    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ user: sanitize(req.user) });
});

module.exports = router;
