const express = require('express');
process.env.TZ = 'Asia/Kolkata';
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS === '*'
    ? '*'
    : process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || ['*'];

app.use(cors({
    origin: allowedOrigins === '*' ? true : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const periodSlotsRoutes = require('./routes/periodSlotsRoutes');
const subjectsRoutes = require('./routes/subjectsRoutes');
const hourlyAttendanceRoutes = require('./routes/hourlyAttendanceRoutes');
const academicContentRoutes = require('./routes/academicContentRoutes');
const internalMarksRoutes = require('./routes/internalMarksRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const chatRoutes = require('./routes/chatRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const institutionRoutes = require('./routes/institutionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/period-slots', periodSlotsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/attendance', hourlyAttendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/academic-content', academicContentRoutes);
app.use('/api/internal-marks', internalMarksRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'Pydah V2 Academic Portal',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Root API
app.get('/api', (req, res) => {
    res.json({
        message: 'Pydah Academic Portal V2 API',
        version: '2.0.0',
        status: 'running'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const startServer = async () => {
    try {
        const { testConnection } = require('./config/database');
        const isConnected = await testConnection();

        if (isConnected) {
            console.log('✅ Database connected successfully');
        } else {
            console.warn('⚠️ Database connection failed - Starting in standalone mode (API may not work fully)');
        }

        app.listen(PORT, () => {
            console.log(`\n✅ Pydah V2 Academic Portal Backend`);
            console.log(`🌐 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (error) {
        console.error('❌ Server start failed:', error);
        // process.exit(1); // Don't exit for now
    }
};

startServer();

module.exports = app;
