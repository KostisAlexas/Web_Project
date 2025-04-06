const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const publicRoutes = require('./src/routes/public/publicRoutes');
const authRoutes = require('./src/routes/auth/authRoutes');
const professorsRoutes = require('./src/routes/professors/professorsRoutes');
const professorDiplomaRoutes = require('./src/routes/professors/diplomaRoutes');
const professorInvitationsRoutes = require('./src/routes/professors/invitationRoutes');
const studentsRoutes = require('./src/routes/students/studentsRoutes');
const studentsDiplomaRoutes = require('./src/routes/students/diplomaRoutes');
const secretariatDiplomaRoutes = require('./src/routes/secretariat/diplomaRoutes');
const errorHandler = require('./src/middleware/errorHandler');
require('dotenv').config();
const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Static files for uploaded diplomas
app.use('/DiplomaSubjectDescription', express.static(path.join(__dirname, '../backend/data/DiplomaSubjectDescription')));

// Routes
app.use('/api', publicRoutes);
app.use('/api/professors', professorsRoutes);
app.use('/api/professors/diplomas', professorDiplomaRoutes);
app.use('/api/professors/invitations', professorInvitationsRoutes);
app.use('/api/students/diplomas', studentsDiplomaRoutes);
app.use('/api/secretariat/diplomas', secretariatDiplomaRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
