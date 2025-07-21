const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');

router.get('/', async (req, res) => {
    try {
        const images = await Gallery.find().sort({ dateCreated: -1 }); // newest first
        res.json(images);
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;