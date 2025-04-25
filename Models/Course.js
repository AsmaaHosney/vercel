const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        professor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
        TA: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const CourseModel = mongoose.model('courses', CourseSchema);
module.exports = CourseModel;
