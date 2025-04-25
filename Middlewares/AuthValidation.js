const joi = require('joi');

const signupValidation = (req, res, next) => {
    const schema = joi.object({
        name: joi.string().min(2).max(50).required(),
        email: joi.string().email().required(),
        password: joi
            .string()
            .pattern(
                new RegExp(
                    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
                )
            )
            .required(),
        confirmationPassword: joi
            .string()
            .valid(joi.ref('password'))
            .required(),
        role: joi.string().valid('student', 'TA', 'Prof').required(), // add allowed roles
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Bad request', error });
    }
    next();
};

const loginValidation = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(4).max(100).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Bad request', error });
    }
    next();
};

const newPasswordValidation = (req, res, next) => {
    const schema = joi.object({
        token: joi.string().length(64).hex().required(), // 64-char hex token
        newPassword: joi
            .string()
            .pattern(
                new RegExp(
                    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
                )
            )
            .required()
            .messages({
                'string.pattern.base':
                    'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.',
            }),
        confirmationNewPassword: joi
            .string()
            .valid(joi.ref('newPassword'))
            .required()
            .messages({
                'any.only': 'Passwords do not match.',
            }),
        code: joi
            .string()
            .pattern(/^\d{4}$/)
            .optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Bad request',
            error: error.details[0].message,
            success: false,
        });
    }

    next();
};

module.exports = {
    signupValidation,
    loginValidation,
    newPasswordValidation,
};
