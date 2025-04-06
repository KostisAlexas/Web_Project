const express = require('express');
const { getStudentProfile, updateStudentProfile } = require('../../controllers/students/studentsController');
const authentication = require('../../middleware/authentication');

const router = express.Router();

// Routes for students
router.get('/profile', authentication, getStudentProfile); // Προβολή προφίλ φοιτητή
router.put('/profile', authentication, updateStudentProfile); // Ενημέρωση προφίλ φοιτητή

module.exports = router;
