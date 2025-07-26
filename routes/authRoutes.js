const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Dummy admin credentials (replace with .env or database later)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // hashed password

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (username !== ADMIN_USERNAME) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "3h" });
    res.json({ token });
});

module.exports = router;