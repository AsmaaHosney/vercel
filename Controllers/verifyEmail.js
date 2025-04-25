const UserModel = require('../Models/User');

const verifyEmail = async (req, res) => {
    try {
        const token = req.params.token;

        const user = await UserModel.findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ message: 'Invalid or expired token', success: false });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({
            message: 'Email successfully verified',
            success: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};

module.exports = {
    verifyEmail,
};
