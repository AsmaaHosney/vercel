const nodemailer = require('nodemailer');

const sendResetEmail = async (recipientEmail, resetToken) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const resetLink = `http://localhost:8080/auth/reset/${resetToken}`;

    const mailOptions = {
        from: '"College-System" <no-reply@yourapp.com>',
        to: recipientEmail,
        subject: 'Password Reset Link - College-System Account',
        html: `
            <p>You requested a password reset.</p>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 1 hour.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendResetEmail;
