const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const verifyToken = require('../utils/auth');

router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({});
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post("/", verifyToken, async (req, res) => {
    try {
        const { title, author, paragraphs, published } = req.body;

        if (!title || !author || !paragraphs ) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const newBlog = new Blog({ title, author, paragraphs, published });
        const savedBlog = await newBlog.save();

        res.status(201).json(savedBlog);
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { title, author, paragraphs, published } = req.body;

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, author, paragraphs, published },
            { new: true }
        );

        if (!updatedBlog) {
            return res.status(404).json({ error: "Blog not found." });
        }

        res.status(200).json({ message: "Blog updated.", blog: updatedBlog });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Failed to update blog." });
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete blog" });
    }
});

module.exports = router;