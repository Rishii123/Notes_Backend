const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Signup
router.post('/signup', async (req, res) => {
    const { email, password, tenant, plan } = req.body;
    try {
        // Check if tenant exists
        let existingTenant = await Tenant.findOne({ name: tenant });
        if (!existingTenant) {
            // Create slug from name
            const slug = tenant.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            existingTenant = new Tenant({ name: tenant, slug, plan: plan || 'FREE' });
            await existingTenant.save();
        }
        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Create user
        const user = new User({ email, password, tenantId: existingTenant._id });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error
            res.status(400).json({ error: 'Email or tenant name already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});

// Login
router.post('/login', async (req,res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if(!user) return res.status(401).json({ error: 'User not found' });
    const valid = bcrypt.compareSync(password, user.password);
    if(!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user._id, tenantId: user.tenantId, role: user.role }, process.env.JWT_SECRET, { expiresIn:'7d' });
    const tenant = await Tenant.findById(user.tenantId);
    res.json({ token, user:{ email:user.email, role:user.role, tenant:{ slug:tenant.slug, plan:tenant.plan } } });
});

module.exports = router;

	// Get current user
	router.get('/me', verifyToken, async (req, res) => {
	  try {
	    const user = await User.findById(req.user.userId);
	    const tenant = await Tenant.findById(req.user.tenantId);
	    res.json({ email: user.email, role: user.role, tenant: { slug: tenant.slug, plan: tenant.plan } });
	  } catch (err) {
	    res.status(500).json({ error: 'Server error' });
	  }
	});
