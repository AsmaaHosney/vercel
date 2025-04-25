const isAuth = require('../Middlewares/isAuth');
const isStudent = require('../Middlewares/isStudent');
const StudentController = require('../Controllers/StudentController');

const router = require('express').Router();

router.get(
    '/available-courses',
    isAuth,
    isStudent,
    StudentController.getAvailableCourses
);

router.post(
    '/register-courses',
    isAuth,
    isStudent,
    StudentController.postRegisterCourses
);

// Yousseff is testing if isAuth Middleware is working or not
// router.get('/isUserAuthorized', isAuth);

module.exports = router;
