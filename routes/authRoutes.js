const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = express.Router();

// Configs
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const PEPPER = process.env.PEPPER_SECRET;
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

// Store attempts by IP
const loginAttempts = new Map();

// Send alert if brute-force happens
async function sendBruteForceAlert(ip, userAgent) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const attemptedAt = new Date().toLocaleString();

    await transporter.sendMail({
        from: `"Security Alert" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: "⚠️ Brute-force Attempt Detected",
        text: `Brute-force login attempt detected:
    
    IP Address: ${ip}
    Time: ${attemptedAt}
    User-Agent: ${userAgent}`,
    });
}

router.post("/", async (req, res) => {
    const ip = req.ip;
    const now = Date.now();

    const attempt = loginAttempts.get(ip) || {
        count: 0,
        lastAttempt: null,
        lockedUntil: null,
    };

    // Case: Still locked
    if (attempt.lockedUntil && attempt.lockedUntil > now) {
        return res.status(429).json({
            error: "Too many attempts. Please try again later.",
            locked: true,
            lockedUntil: attempt.lockedUntil,
        });
    }

    const { username, password } = req.body;

    // Check username
    if (username !== ADMIN_USERNAME) {
        attempt.count += 1;
        attempt.lastAttempt = now;

        if (attempt.count >= MAX_ATTEMPTS) {
            attempt.lockedUntil = now + LOCK_TIME;
            await sendBruteForceAlert(ip, req.headers["user-agent"]);
            loginAttempts.set(ip, attempt);
            return res.status(429).json({
                error: "Too many attempts. Locked.",
                locked: true,
                lockedUntil: attempt.lockedUntil,
            });
        }

        loginAttempts.set(ip, attempt);
        return res.status(401).json({
            error: "Invalid credentials",
            attemptsLeft: MAX_ATTEMPTS - attempt.count,
        });
    }

    // Check password with pepper
    const match = await bcrypt.compare(password + PEPPER, ADMIN_PASSWORD_HASH);
    if (!match) {
        attempt.count += 1;
        attempt.lastAttempt = now;

        if (attempt.count >= MAX_ATTEMPTS) {
            attempt.lockedUntil = now + LOCK_TIME;
            await sendBruteForceAlert(ip, req.headers["user-agent"]);
            loginAttempts.set(ip, attempt);
            return res.status(429).json({ error: "Too many attempts. Locked." });
        }

        loginAttempts.set(ip, attempt);
        return res.status(401).json({
            error: "Invalid credentials",
            attemptsLeft: MAX_ATTEMPTS - attempt.count,
        });
    }

    // Success: clear attempt
    loginAttempts.delete(ip);
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "3h" });

    return res.json({ token });
});

module.exports = router;