const verifyToken = require('./verify-token');

module.exports = function authorize(roles = []) {
    return [
        verifyToken,
        (req, res, next) => {
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            next();
        }
    ];
}