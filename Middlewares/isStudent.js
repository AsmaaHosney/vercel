const isStudent = (req, res, next) => {
    if (req.user.role === 'student') {
        // User is a student then jump into the next middleware!
        return next();
    }
    return res
        .status(403)
        .json({ message: 'Access restricted to Professors or TAs' });
};

module.exports = isStudent;
