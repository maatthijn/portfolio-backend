const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: "Access token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // attach user info if needed
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

module.exports = verifyToken;