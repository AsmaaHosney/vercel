const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const genderTypes = { male: 'male', female: 'female' };
const roleTypes = { user: 'student', TA: 'TA', Prof: 'Prof' };

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        emailVerificationToken: String,
        emailVerificationTokenExpires: Date,
        resetToken: String,
        resetTokenExpiration: Date,
        phone: String,
        address: String,
        DOB: Date,
        image: String,
        code: String,
        coverImage: [String],
        role: {
            type: String,
            enum: Object.values(roleTypes),
            default: roleTypes.user,
        },
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        changeCridentialsTime: Date,
    },

    {
        timestamps: true,
    }
);

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
