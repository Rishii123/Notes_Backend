const Tenant = require('../models/Tenant');

const tenantAdmin = async (req, res, next) => {
    const tenant = await Tenant.findById(req.user.tenantId);
    if(!tenant) return res.status(400).json({ error: 'Tenant not found' });
    req.tenant = tenant;
    if(req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    next();
}

module.exports = { tenantAdmin };
