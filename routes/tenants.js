const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const auth = require('../middleware/auth');
const { tenantAdmin } = require('../middleware/tenant');

router.post('/:slug/upgrade', auth, tenantAdmin, async (req,res)=>{
    const { plan } = req.body; // 'monthly' or 'annual'
    req.tenant.plan = 'PRO';
    if (plan === 'monthly') {
        req.tenant.planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    } else if (plan === 'annual') {
        req.tenant.planExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days
    }
    await req.tenant.save();
    res.json({ success:true, plan:'PRO', expiry: req.tenant.planExpiry });
});

router.post('/signup', async (req, res) => {
    try {
        const { email, password, tenantId } = req.body;
        const newUser = new User({ email, password, tenantId });
        await newUser.save(); // auto-hashes
        res.json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
