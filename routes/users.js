const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/invite', auth, async (req, res) => {
  const { email, role, name } = req.body;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can invite users' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const tempPassword = 'password'; // In production, generate random or send email

    const user = new User({
      email,
      password: tempPassword,
      role: role || 'MEMBER',
      tenantId: req.user.tenantId
    });

    await user.save();

    res.status(201).json({ message: 'User invited successfully', tempPassword });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect old password' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;