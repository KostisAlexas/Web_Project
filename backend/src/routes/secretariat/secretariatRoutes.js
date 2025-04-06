const express = require('express');
const {
    createProfessor,
    updateProfessor,
    deleteProfessor,
    getProfessor,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudent,
} = require('../../controllers/secretariat/secretariatController');
const authentication = require('../../middleware/authentication');
const authorization = require('../../middleware/authorization');

const router = express.Router();

// Routes for managing professors
router.post('/professors', authentication, authorization('secretariat'), createProfessor);
router.put('/professors/:id', authentication, authorization('secretariat'), updateProfessor);
router.delete('/professors/:id', authentication, authorization('secretariat'), deleteProfessor);
router.get('/professors/:id', authentication, authorization('secretariat'), getProfessor);

// Routes for managing students
router.post('/students', authentication, authorization('secretariat'), createStudent);
router.put('/students/:id', authentication, authorization('secretariat'), updateStudent);
router.delete('/students/:id', authentication, authorization('secretariat'), deleteStudent);
router.get('/students/:id', authentication, authorization('secretariat'), getStudent);

module.exports = router;
