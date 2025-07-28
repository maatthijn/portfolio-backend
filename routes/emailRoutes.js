require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();
router.post('/', async (req, res) => {
    const {name, email, message} = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({error: "All fields are required."});
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({error: "Invalid email format."});
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        await transporter.sendMail({
            from: `${name}" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email,
            subject: `New Contact Submission - ${name}`,
            text: `From: ${name}\nEmail: ${email}\n\n${message}\n\nSincerely,\n${name}`
        });

        res.status(200).json({sucess: true});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Something went wrong."});
    }
});

module.exports = router;