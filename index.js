const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProfOrTARouter = require('./Routes/ProfOrTARouter');
const StudentRouter = require('./Routes/StudentRouter');
const CourseRouter = require('./Routes/CourseRouter');

require('dotenv').config();
require('./Models/db');

const PORT = process.env.PORT || 8080;

// ✅ Simple ping test
app.get('/ping', (req, res) => {
    res.send('PONG');
});

// ✅ Body parsing
app.use(bodyParser.json());

// ✅ Proper CORS config
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// ✅ Routes
app.use('/auth', AuthRouter);
app.use('/prof-or-TA', ProfOrTARouter);
app.use('/student', StudentRouter);
app.use('/courses', CourseRouter);

// ✅ Start server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
