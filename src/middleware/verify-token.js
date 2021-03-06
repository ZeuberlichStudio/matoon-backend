const jwt = require('jsonwebtoken');
require('dotenv').config;

module.exports = function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    // if ( !token ) return res.status(401).send('Access denied.');

    if ( !token ) {
        req.user = { role: 'guest' };
        next();
    } else {
        try {
            const secret = process.env.SECRET;
            const decoded = jwt.verify(token.replace('Bearer ', ''), secret);
    
            req.user = decoded;
    
            next();
        } catch (error) {
            res.status(400).send('Access denied.');
        }
    }
}