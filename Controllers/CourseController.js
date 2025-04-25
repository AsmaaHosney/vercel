const mongoose = require('mongoose');
const CourseModel = require('../Models/Course');

const getCourseById = async (req, res) => {
    const { courseId } = req.params;

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID format' });
    }

    try {
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCourseById,
};
