const jwt = require('jsonwebtoken');
const Cred = require('../model/cred');

const SECRET_KEY = process.env.JWT_SECRET || "8261ba19898d0dcdfe6c0c411df74b587b2e54538f5f451633b71e39f957cf01";

const authenticateToken = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, SECRET_KEY);


            req.user = await Cred.findById(decoded.id);

            if (!req.user) {
                return res.status(401).send('Not authorized, user not found');
            }

            next();
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