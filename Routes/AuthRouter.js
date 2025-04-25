const authController = require('../Controllers/AuthController');
const authValidation = require('../Middlewares/AuthValidation');
const authverifyEmail = require('../Controllers/verifyEmail');
const isAuth = require('../Middlewares/isAuth');
// The isAuth middleware will be used before passing on any controller to ensure that the Authorization header contains a valid JWT, to prevent any unauthenticated access.

const router = require('express').Router();

router.post(
    '/signup',
    authValidation.signupValidation,
    authController.signupController
);
router.get('/verify-email/:token', authverifyEmail.verifyEmail);

router.post(
    '/login',
    authValidation.loginValidation,
    authController.loginController
);
router.post('/refresh-token', authController.refreshToken);

router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getResetPassword);
router.post(
    '/new-password',
    authValidation.newPasswordValidation,
    authController.postNewPassword
);

router.get('/get-username', isAuth, authController.getUserName);

router.get('/logout', isAuth, authController.logoutController);

// Yousseff is testing if isAuth Middleware is working or not
// router.get('/isUserAuthorized', isAuth);

module.exports = router;
