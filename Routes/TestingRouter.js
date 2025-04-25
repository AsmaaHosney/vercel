const ensureAuthenticated = require('../Middlewares/isAuth');

const router = require('express').Router();

router.get('/', ensureAuthenticated, (req, res) => {
    // console.log('------------');
});

module.exports = router;
