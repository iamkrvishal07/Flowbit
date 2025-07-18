const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
router.post('/register', async (req, res) => {
  const { email, password, tenant, role } = req.body;

  console.log('Incoming register data:', { email, tenant, role });

  try {
    const existingUser = await User.findOne({ email, tenantId: tenant });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists for this tenant.' });
    }

    const user = new User({
      email,
      password,         // raw password — pre('save') will hash it
      tenantId: tenant,
      role,
    });

    await user.save();

    console.log('User registered:', user.email);
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(' Registration error:', err.message);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password, tenant } = req.body;

  console.log('Login attempt:', { email, tenant });

  try {
    const user = await User.findOne({ email, tenantId: tenant });
    console.log('🔍 Fetched user:', user?.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = password === user.password;
    console.log(' Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // FIXED — added email to token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,        // ADDED THIS
        tenant: user.tenantId,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      token,
      user: {
        email: user.email,
        role: user.role,
        tenant: user.tenantId,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
