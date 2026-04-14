import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import TokenBlacklist from '../models/tokenBlacklist.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Check if token is blacklisted
            const blacklistedToken = await TokenBlacklist.findOne({ token });
            if (blacklistedToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Token has been invalidated. Please log in again.'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            // Check if user exists and is not blocked
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (req.user.status === 'blocked') {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been blocked. Please contact support.'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role ${req.user.role} is not authorized`
            });
        }
        next();
    };
};