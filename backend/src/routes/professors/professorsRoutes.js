const express = require('express');
const { getProfessorProfile, updateProfessorProfile } = require('../../controllers/professors/professorsController');
const authentication = require('../../middleware/authentication');

const router = express.Router();

// Routes for professors
router.get('/profile', authentication, getProfessorProfile); // Προβολή προφίλ
router.put('/profile', authentication, updateProfessorProfile); // Ενημέρωση προφίλ

module.exports = router;
