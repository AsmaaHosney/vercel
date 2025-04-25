const isProfOrTA = (req, res, next) => {
    if (req.user.role === 'Prof' || req.user.role === 'TA') {
        // User is Prof or TA then jump into the next middleware!
        return next();
    }
    return res
        .status(403)
        .json({ message: 'Access restricted to Professors or TAs' });
};

module.exports = isProfOrTA;
