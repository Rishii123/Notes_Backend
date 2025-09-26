const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Tenant = require('../models/Tenant');
const auth = require('../middleware/auth');

// List & create notes
router.get('/', auth, async (req,res)=>{
    const notes = await Note.find({ tenantId: req.user.tenantId }).sort({ createdAt:-1 });
    res.json(notes);
});

router.post('/', auth, async (req,res)=>{
    const { title, content } = req.body;
    const NoteModel = new Note({ title, content, tenantId: req.user.tenantId, authorId: req.user._id });

    // Free plan limit
    const tenant = await Tenant.findById(req.user.tenantId);
    const notesCount = await Note.countDocuments({ tenantId: req.user.tenantId });
    if(tenant.plan === 'FREE' && notesCount >= 3) return res.status(403).json({ error: 'Free plan limit reached' });

    await NoteModel.save();
    res.status(201).json(NoteModel);
});

// Get, Update, Delete by ID
router.get('/:id', auth, async (req,res)=>{
    const note = await Note.findById(req.params.id);
    if(!note || note.tenantId.toString()!==req.user.tenantId.toString()) return res.status(404).json({ error:'Not found' });
    res.json(note);
});

router.put('/:id', auth, async (req,res)=>{
    const note = await Note.findById(req.params.id);
    if(!note || note.tenantId.toString()!==req.user.tenantId.toString()) return res.status(404).json({ error:'Not found' });
    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;
    await note.save();
    res.json(note);
});

router.delete('/:id', auth, async (req,res)=>{
    const note = await Note.findById(req.params.id);
    if(!note || note.tenantId.toString()!==req.user.tenantId.toString()) return res.status(404).json({ error:'Not found' });
    await note.remove();
    res.json({ success:true });
});

module.exports = router;
