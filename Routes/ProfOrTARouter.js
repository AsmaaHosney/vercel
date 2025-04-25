const isAuth = require('../Middlewares/isAuth');
const isProfOrTA = require('../Middlewares/isProfOrTA');
const ProfOrTAController = require('../Controllers/ProfOrTAController');
// The isAuth middleware will be used before passing on any controller to ensure that the Authorization header contains a valid JWT, to prevent any unauthenticated access.

const router = require('express').Router();

router.get(
    '/registered-students',
    isAuth,
    isProfOrTA,
    ProfOrTAController.getMyStudents
);

router.get(
    '/assigned-courses',
    isAuth,
    isProfOrTA,
    ProfOrTAController.getAssignedCourses
);

// Yousseff is testing if isAuth Middleware is working or not
// router.get('/isUserAuthorized', isAuth);

module.exports = router;
