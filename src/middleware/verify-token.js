import jwt from 'jsonwebtoken';
require('dotenv').config;

export default function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if ( !token ) return res.status(401).send('Access denied.');

    try {
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token.replace('Bearer ', ''), secret);

        req.user = decoded;

        next();
    } catch (error) {
        res.status(400).send('Access denied.');
    }
}