require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admissions', require('./src/routes/admissionRoutes'));
app.use('/api/fees', require('./src/routes/feeRoutes'));
app.use('/api/academic', require('./src/routes/academicRoutes'));
app.use('/api/teacher', require('./src/routes/teacherRoutes'));
app.use('/api/exams', require('./src/routes/examRoutes'));
app.use('/api/parent', require('./src/routes/parentRoutes'));
app.use('/api/library', require('./src/routes/libraryRoutes'));
app.use('/api/ai-tutor', require('./src/routes/aiTutorRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'School Management API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));