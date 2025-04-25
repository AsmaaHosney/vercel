const jwt = require('jsonwebtoken');
const BlacklistModel = require('../Models/BlacklistModel');
const UserModel = require('../Models/User'); // Import your user model

const ensureAuthenticated = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
            .status(403)
            .json({ message: 'Unauthorized, JWT token is required' });
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    const blacklisted = await BlacklistModel.findOne({ token });
    if (blacklisted) {
        return res.status(403).json({
            message:
                'Token has been invalidated because you logged out. Please login again.',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔥 Fetch the full user from DB
        const fullUser = await UserModel.findById(decoded._id);

        if (!fullUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = fullUser; // this now includes courses, etc.
        next();
    } catch (err) {
        return res
            .status(403)
            .json({ message: 'Unauthorized, JWT token wrong or expired' });
    }
};

module.exports = ensureAuthenticated;
