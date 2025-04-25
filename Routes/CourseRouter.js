const isAuth = require('../Middlewares/isAuth');
const CourseController = require('../Controllers/CourseController');

const router = require('express').Router();

router.get('/:courseId', isAuth, CourseController.getCourseById);

// Yousseff is testing if isAuth Middleware is working or not
// router.get('/isUserAuthorized', isAuth);

module.exports = router;
