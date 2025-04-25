const crypto = require('crypto');
const bcrypt = require('bcrypt');
const sendResetEmail = require('../utils/email/sendResetEmail');
const sendVerificationEmail = require('../utils/email/sendVerificationEmail');
const jwt = require('jsonwebtoken');
const UserModel = require('../Models/User');
const BlacklistModel = require('../Models/BlacklistModel');
require('dotenv').config();

const signupController = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const lowerEmail = email.toLowerCase();

        const existingUser = await UserModel.findOne({ email: lowerEmail });

        if (existingUser) {
            if (
                !existingUser.isEmailVerified &&
                existingUser.emailVerificationTokenExpires < Date.now()
            ) {
                await UserModel.deleteOne({ email: lowerEmail });
            } else {
                if (existingUser.isEmailVerified) {
                    return res.status(409).json({
                        message: 'User already exists. Try logging in.',
                        isEmailVerified: existingUser.isEmailVerified,
                    });
                } else {
                    return res.status(409).json({
                        message:
                            'User already exists. Please verify your email.',
                        isEmailVerified: existingUser.isEmailVerified,
                    });
                }
            }
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            name,
            email: lowerEmail,
            password: hashedPassword,
            isEmailVerified: false,
            role: role,
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpires: Date.now() + 3600000, // 1 hour
        });

        newUser.save();
        sendVerificationEmail(lowerEmail, verificationToken);

        res.status(201).json({
            message: 'Signup successful. Please verify your email.',
            isEmailVerified: newUser.isEmailVerified,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await UserModel.findOne({ email: normalizedEmail });
        const errorMsg = 'Auth failed: email or password is wrong';

        if (!user) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        // Restrict login if email is not verified
        if (!user.isEmailVerified) {
            return res.status(401).json({
                message: 'Please verify your email before logging in.',
                success: false,
            });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        // Generate Access Token (short-lived)
        const jwtToken = jwt.sign(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Generate Refresh Token (long-lived)
        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: 'Login successful',
            success: true,
            jwtToken,
            refreshToken, // or omit if using cookie
            isEmailVerified: user.isEmailVerified,
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res
                .status(400)
                .json({ message: 'Refresh token required', success: false });
        }

        // Verify the refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        // Optional: Check if the user still exists
        const user = await UserModel.findById(decoded._id);
        if (!user) {
            return res
                .status(401)
                .json({ message: 'User not found', success: false });
        }

        // Issue a new access token
        const newAccessToken = jwt.sign(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: 'New access token issued',
            success: true,
            jwtToken: newAccessToken,
        });
    } catch (err) {
        console.error('Refresh token error:', err.message);
        return res.status(401).json({
            message: 'Invalid or expired refresh token',
            success: false,
        });
    }
};

const postReset = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await UserModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                message: 'No account with that email found.',
                success: false,
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message:
                    'Please verify your email before requesting a password reset.',
                success: false,
            });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save();

        sendResetEmail(user.email, token);

        res.status(200).json({
            message: 'Password reset email sent.',
            success: true,
        });
    } catch (err) {
        console.error('Reset Error:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

const getResetPassword = async (req, res) => {
    try {
        const token = req.params.token;

        const user = await UserModel.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired token.',
                success: false,
            });
        }

        res.status(200).json({
            message: 'Token is valid. Proceed to reset password.',
            userId: user._id.toString(),
            token: token,
            success: true,
        });

        // Frontend (You have to forward the users to the reset password page)
    } catch (err) {
        console.error('Token validation error:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

const postNewPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await UserModel.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ message: 'Invalid or expired token', success: false });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();

        res.status(200).json({
            message: 'Password updated successfully',
            success: true,
        });
    } catch (err) {
        console.error('Error in postNewPassword:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

const getUserName = async (req, res) => {
    try {
        const userName = req.user.name;
        res.status(200).json({ name: userName, success: true });
    } catch (err) {
        console.error('Error fetching user name:', err);
        res.status(500).json({ message: 'Server error', success: false });
    }
};

const logoutController = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res
            .status(400)
            .json({ message: 'No token provided', success: false });
    }

    // Example: Save to DB or Redis blacklist
    await BlacklistModel.create({ token });

    res.status(200).json({
        message: 'Logout successful. Token has been invalidated.',
        success: true,
    });
};

module.exports = {
    signupController,
    loginController,
    postReset,
    getResetPassword,
    postNewPassword,
    refreshToken,
    getUserName,
    logoutController,
};
