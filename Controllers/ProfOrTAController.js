const UserModel = require('../Models/User');
const CourseModel = require('../Models/Course');

const getMyStudents = async (req, res) => {
    try {
        const currentUser = req.user;
        const teachingCourseIds = currentUser.courses.map((id) =>
            id.toString()
        );

        const students = await UserModel.find({
            role: 'student',
            courses: { $in: teachingCourseIds },
        }).select('name courses');

        // Only include the courses taught by the current user
        const filteredStudents = students.map((student) => ({
            name: student.name,
            courses: student.courses
                .map((id) => id.toString())
                .filter((courseId) => teachingCourseIds.includes(courseId)),
        }));

        res.status(200).json({ students: filteredStudents });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAssignedCourses = async (req, res) => {
    try {
        const userId = req.user._id; // From the JWT middleware
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check role and query accordingly
        let coursesQuery = {};
        if (user.role === 'Prof') {
            // Professor is assigned as 'professor' in Course model
            coursesQuery.professor = userId;
        } else if (user.role === 'TA') {
            // TA is assigned as 'TA' in Course model
            coursesQuery.TA = userId;
        } else {
            return res.status(400).json({
                message:
                    'Invalid role. Only professors or TAs can access this data.',
            });
        }

        // Fetch courses where the user is either the professor or the TA
        const courses = await CourseModel.find(coursesQuery)
            .populate('professor', 'name email')
            .populate('TA', 'name email');

        // Map to extract only the course names
        const courseNames = courses.map((course) => course.name);

        return res.json({
            name: user.name,
            email: user.email,
            role: user.role,
            assignedCourses: courseNames, // The courses where the user is assigned as professor or TA
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMyStudents,
    getAssignedCourses,
};
