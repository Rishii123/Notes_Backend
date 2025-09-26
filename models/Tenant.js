const mongoose = require('mongoose');
const TenantSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    plan: { type: String, enum: ['FREE','PRO'], default: 'FREE' },
    planExpiry: { type: Date },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Tenant', TenantSchema);
