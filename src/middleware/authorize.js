import verifyToken from './verify-token';

export default function authorize(roles = []) {
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