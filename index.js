const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const AuthRouter = require('./Routes/AuthRouter');
const ProfOrTARouter = require('./Routes/ProfOrTARouter');
const StudentRouter = require('./Routes/StudentRouter');
const CourseRouter = require('./Routes/CourseRouter');

// Load environment variables
require('dotenv').config();

// Connect to the database
require('./Models/db');

const PORT = process.env.PORT || 8080;

// ✅ Simple ping test
app.get('/ping', (req, res) => {
    res.send('PONG');
});

// ✅ Body parsing middleware
app.use(bodyParser.json());

// ✅ Enable compression for all responses
app.use(compression());  // Compresses all responses automatically

// ✅ CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173', // Development environment
    'https://yourfrontenddomain.com', // Replace with your deployed frontend URL
    // Add any additional allowed domains here
  ],
  credentials: true, // Allow cookies or credentials to be sent with requests
}));

// ✅ Routes
app.use('/auth', AuthRouter);
app.use('/prof-or-TA', ProfOrTARouter);
app.use('/student', StudentRouter);
app.use('/courses', CourseRouter);

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
