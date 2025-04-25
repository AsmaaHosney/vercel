const mongoose = require('mongoose');
const UserModel = require('../Models/User');
const CourseModel = require('../Models/Course');

const getAvailableCourses = async (req, res) => {
    try {
        const studentId = req.user._id;
        // console.log(studentId);

        // Get student record to fetch enrolled courses
        const student = await UserModel.findById(studentId).select('courses');
        const enrolledCourseIds = student.courses || [];

        // Fetch courses not already registered by the student
        const availableCourses = await CourseModel.find({
            _id: { $nin: enrolledCourseIds },
        });

        res.status(200).json(availableCourses);
    } catch (err) {
        console.error('Error fetching available courses:', err);
        res.status(500).json({
            message: 'Server error fetching available courses',
        });
    }
};

const postRegisterCourses = async (req, res) => {
    try {
        const studentId = req.user._id;
        const selectedCourses = req.body.courseIds;

        // Check it's a non-empty array
        if (!Array.isArray(selectedCourses) || selectedCourses.length === 0) {
            return res.status(400).json({ error: 'No courses selected.' });
        }

        // Validate max count
        if (selectedCourses.length > 5) {
            return res
                .status(400)
                .json({ error: 'You can register for up to 5 courses only.' });
        }

        // Check all are valid ObjectIds
        const areAllValidObjectIds = selectedCourses.every((id) =>
            mongoose.Types.ObjectId.isValid(id)
        );
        if (!areAllValidObjectIds) {
            return res
                .status(400)
                .json({ error: 'One or more course IDs are invalid.' });
        }

        // Check which courses actually exist in DB
        const existingCourses = await CourseModel.find({
            _id: { $in: selectedCourses },
        });

        if (existingCourses.length !== selectedCourses.length) {
            return res.status(400).json({
                error: 'Some course IDs do not exist.',
                validCourses: existingCourses.map((c) => c._id),
            });
        }

        // Save course references to student's document
        const user = await UserModel.findById(studentId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        user.courses = selectedCourses;
        await user.save();

        // Add student ID to each course's `students` array (if not already included)
        await Promise.all(
            existingCourses.map(async (course) => {
                if (!course.students.includes(studentId)) {
                    course.students.push(studentId);
                    await course.save();
                }
            })
        );

        res.status(200).json({
            message: 'Courses registered successfully.',
            courses: user.courses,
        });
    } catch (error) {
        console.error('Error in course registration:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    getAvailableCourses,
    postRegisterCourses,
};
