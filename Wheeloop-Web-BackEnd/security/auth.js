// src/security/auth.js (Example - verify this matches your actual file)

const jwt = require('jsonwebtoken');
const Cred = require('../model/cred'); // Path to your Cred model

const SECRET_KEY = process.env.JWT_SECRET || "8261ba19898d0dcdfe6c0c411df74b587b2e54538f5f451633b71e39f957cf01"; // Must match your controller

const authenticateToken = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Get token from "Bearer <token>"

            const decoded = jwt.verify(token, SECRET_KEY);

            // Find the user's cred document and attach it to the request
            // `select('+password')` is NOT needed here as we don't need password for auth checks
            req.user = await Cred.findById(decoded.id);

            if (!req.user) {
                return res.status(401).send('Not authorized, user not found');
            }

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('Authentication Error:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).send('Not authorized, token expired');
            }
            res.status(401).send('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401).send('Not authorized, no token provided');
    }
};

const authorizeRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).send(`Forbidden: Requires ${role} role`);
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRole };