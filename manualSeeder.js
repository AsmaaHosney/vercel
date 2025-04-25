const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcrypt');

const mongo_url = process.env.MONGO_CONN;

const UserModel = require('./Models/User'); // adjust the path
const CourseModel = require('./Models/Course'); // adjust the path

mongoose
    .connect(mongo_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected...'))
    .catch((err) => console.error('MongoDB connection error:', err));

const seed = async () => {
    try {
        // Clear previous data
        await UserModel.deleteMany({ role: 'Prof' });
        await CourseModel.deleteMany({});

        // Professors' PII
        const professorsData = [
            {
                name: 'Dr. John Smith',
                email: 'john@example.com',
                password: 'John1337!',
            },
            {
                name: 'Dr. Sarah Johnson',
                email: 'sarah@example.com',
                password: 'Sarah1337!',
            },
            {
                name: 'Dr. Alan Brown',
                email: 'alan@example.com',
                password: 'Alan1337!',
            },
            {
                name: 'Dr. Emily Davis',
                email: 'emily@example.com',
                password: 'Emily1337!',
            },
            {
                name: 'Dr. Michael Wilson',
                email: 'michael@example.com',
                password: 'Michael1337!',
            },
            {
                name: 'Dr. Lisa Taylor',
                email: 'lisa@example.com',
                password: 'Lisa1337!',
            },
            {
                name: 'Dr. Robert Clark',
                email: 'robert@example.com',
                password: 'Robert1337!',
            },
            {
                name: 'Dr. Nancy Lewis',
                email: 'nancy@example.com',
                password: 'Nancy1337!',
            },
            {
                name: 'Dr. James Lee',
                email: 'james@example.com',
                password: 'James1337!',
            },
            {
                name: 'Dr. Karen White',
                email: 'karen@example.com',
                password: 'Karen1337!',
            },
        ];

        // TAs' PII
        const TAsData = [
            {
                name: 'TA1 Johnson',
                email: 'ta1@example.com',
                password: 'Johnson1337!',
            },
            {
                name: 'TA2 Brown',
                email: 'ta2@example.com',
                password: 'Brown1337!',
            },
            {
                name: 'TA3 Davis',
                email: 'ta3@example.com',
                password: 'Davis1337!',
            },
            {
                name: 'TA4 Wilson',
                email: 'ta4@example.com',
                password: 'Wilson1337!',
            },
            {
                name: 'TA5 Taylor',
                email: 'ta5@example.com',
                password: 'Taylor1337!',
            },
            {
                name: 'TA6 Clark',
                email: 'ta6@example.com',
                password: 'Clark1337!',
            },
            {
                name: 'TA7 Lewis',
                email: 'ta7@example.com',
                password: 'Lewis1337!',
            },
            {
                name: 'TA8 Lee',
                email: 'ta8@example.com',
                password: 'Lee1337!',
            },
            {
                name: 'TA9 White',
                email: 'ta9@example.com',
                password: 'White1337!',
            },
            {
                name: 'TA10 Morgan',
                email: 'ta10@example.com',
                password: 'Morgan1337!',
            },
        ];

        // Saving Professors' PII to the database
        const professorDocs = [];
        for (const prof of professorsData) {
            const hashedPassword = await bcrypt.hash(prof.password, 10);
            const newProf = new UserModel({
                name: prof.name,
                email: prof.email,
                password: hashedPassword,
                role: 'Prof',
                isEmailVerified: true,
            });
            await newProf.save();
            professorDocs.push(newProf);
        }

        // Saving TAs' PII to the database
        const TADocs = [];
        for (const ta of TAsData) {
            const hashedPassword = await bcrypt.hash(ta.password, 10);
            const newTA = new UserModel({
                name: ta.name,
                email: ta.email,
                password: hashedPassword,
                role: 'TA',
                isEmailVerified: true,
            });
            await newTA.save();
            TADocs.push(newTA);
        }

        // Step 3: Add Courses (assign 2 courses to each professor)
        const courseData = [
            { name: 'Computer Science I', code: 'CS101' },
            { name: 'Computer Science II', code: 'CS102' },
            { name: 'Data Structures', code: 'CS103' },
            { name: 'Algorithms', code: 'CS104' },
            { name: 'Web Development', code: 'CS105' },
            { name: 'Operating Systems', code: 'CS106' },
            { name: 'Database Systems', code: 'CS107' },
            { name: 'Mobile Computing', code: 'CS108' },
            { name: 'Networks', code: 'CS109' },
            { name: 'Machine Learning', code: 'CS110' },
            { name: 'IT Fundamentals', code: 'IT101' },
            { name: 'Systems Analysis', code: 'IT102' },
            { name: 'Security Basics', code: 'IT103' },
            { name: 'Cloud Computing', code: 'IT104' },
            { name: 'DevOps', code: 'IT105' },
            { name: 'Digital Forensics', code: 'IT106' },
            { name: 'AI for IT', code: 'IT107' },
            { name: 'Ethical Hacking', code: 'IT108' },
            { name: 'Big Data', code: 'IT109' },
            { name: 'Quantum Computing', code: 'IT110' },
        ];

        for (let i = 0; i < courseData.length; i++) {
            const professor = professorDocs[Math.floor(i / 2)];
            const TA = TADocs[Math.floor(i / 2)];

            // Create the course
            const course = new CourseModel({
                name: courseData[i].name,
                code: courseData[i].code,
                professor: professor._id,
                TA: TA._id,
            });
            await course.save();

            // Add course to professor and TA
            await UserModel.findByIdAndUpdate(professor._id, {
                $push: { courses: course._id },
            });
            await UserModel.findByIdAndUpdate(TA._id, {
                $push: { courses: course._id },
            });
        }

        console.log('Professors, TAs, and courses seeded successfully!');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        mongoose.connection.close();
    }
};

seed();
