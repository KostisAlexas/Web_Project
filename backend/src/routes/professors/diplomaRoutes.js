const express = require('express');
const { fetchDiplomasForProfessor, createDiploma, changeDiplomaStatus } = require('../../controllers/professors/diplomaController');
const { searchStudents, assignStudent, unassignStudent } = require('../../controllers/professors/diplomaController');
const authentication = require('../../middleware/authentication');
const multer = require('multer');
const path = require('path');


// Ρύθμιση του multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../backend/data/DiplomaSubjectDescription'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB όριο μεγέθους αρχείου
});

const router = express.Router();

// Route για δημιουργία διπλωματικής
router.post('/', authentication, upload.single('file'), createDiploma);

router.get('/', authentication, fetchDiplomasForProfessor);

router.get('/searchStudents', authentication, searchStudents);

router.post('/assignStudent', authentication, assignStudent);

router.post('/unassignStudent', authentication, unassignStudent);

router.post('/changeStatus', authentication, changeDiplomaStatus);


module.exports = router;




