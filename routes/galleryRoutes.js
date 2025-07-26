require("dotenv").config();

const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const upload = require("../utils/multer");
const verifyToken = require('../utils/auth');
const cloudinary = require('cloudinary').v2;

cloudinary.config();

router.get('/', async (req, res) => {
    try {
        const images = await Gallery.find().sort({ dateCreated: -1 }); // newest first
        res.json(images);
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post("/", verifyToken, upload.single("image"), async (req, res) => {
    try {
        const { name, description, published } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded." });
        }

        const newImage = new Gallery({
            name,
            description,
            url: req.file.path,
            public_id: req.file.filename,
            published
        });

        await newImage.save();
        res.status(201).json({ message: "Image uploaded.", image: newImage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed." });
    }
});

router.put("/:id", verifyToken, upload.none(), async (req, res) => {
    try {
        const { name, description, published } = req.body;

        const updatedImage = await Gallery.findByIdAndUpdate(
            req.params.id,
            { name, description, published },
            { new: true }
        );

        if (!updatedImage) {
            return res.status(404).json({ error: "Image not found." });
        }

        res.status(200).json({ message: "Image updated.", image: updatedImage });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Failed to update blog." });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { public_id } = req.query;

    console.log("DELETE req.query:", req.query); // 👈 helpful for debugging

    if (!public_id) {
        return res.status(400).json({ message: "Missing public_id in query" });
    }

    try {
        await cloudinary.uploader.destroy(public_id);
        await Gallery.findByIdAndDelete(id);
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (err) {
        console.error("Error deleting image:", err);
        res.status(500).json({ message: "Server error during deletion" });
    }
});

module.exports = router;