const nodemailer = require('nodemailer');

const sendVerificationEmail = async (userEmail, verificationToken) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const verificationLink = `http://localhost:8080/auth/verify-email/${verificationToken}`;

    const mailOptions = {
        from: '"College-System" <no-reply@yourapp.com>',
        to: userEmail,
        subject: 'Verify Your Email - College-System Account',
        html: `
            <p>Thank you for registering!</p>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationLink}">${verificationLink}</a>
            <p>This link will expire in 1 hour.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
