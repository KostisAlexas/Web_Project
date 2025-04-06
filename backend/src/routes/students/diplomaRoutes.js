const express = require('express');
const { fetchDiplomasForStudent, uploadStudentFile, fetchStudentFile, fetchFilesByDiplomaId } = require('../../controllers/students/diplomaController');
const { upload } = require('../../controllers/students/fileUpload');
const authentication = require('../../middleware/authentication');

const router = express.Router();

// Routes
router.get('/', authentication, fetchDiplomasForStudent);

router.post('/upload/:diplomaId', authentication, upload.single('file'), uploadStudentFile);

router.get('/files/:diplomaId', authentication, fetchFilesByDiplomaId);

router.get('/files/:filename', authentication, fetchStudentFile);


module.exports = router;
