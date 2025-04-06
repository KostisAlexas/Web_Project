const pool = require('../../models/db');
const path = require('path');
const fs = require('fs');
const { UPLOAD_PATH } = require('./fileUpload');
const { 
  fetchDiplomasByStudentId, 
  fetchDiplomaHistory, 
  fetchGrades, 
  fetchCancelInfo 
} = require('../../models/diplomaModel.js');
const { 
  fetchStudentNamesByIds, 
} = require('../../models/studentModel');
const { 
  fetchProfessorNamesByIds, 
} = require('../../models/professorModel');

const fetchDiplomasForStudent = async (req, res) => {
  try {
    const studentId = req.user.id;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID not found.' });
    }

    // 1. Ανάκτηση διπλωματικών
    const diplomas = await fetchDiplomasByStudentId(studentId);
    const diplomaIds = diplomas.map(d => d.id);

    // 2. Παράλληλη εκτέλεση των queries
    const [history, grades, cancelInfo, professorNames, studentNames] = await Promise.all([
      fetchDiplomaHistory(diplomaIds),
      fetchGrades(diplomaIds),
      fetchCancelInfo(diplomaIds),
      fetchProfessorNamesByIds([
        ...new Set(diplomas.flatMap(d => [d.supervisor, d.m1, d.m2]))
      ]),
      fetchStudentNamesByIds(diplomas.map(d => d.assignee).filter(Boolean))
    ]);

    // 3. Μορφοποίηση δεδομένων
    const formattedDiplomas = diplomas.map(diploma => ({
      ...diploma,
      supervisor_id: diploma.supervisor,
      supervisor: professorNames[diploma.supervisor],
      m1: professorNames[diploma.m1],
      m2: professorNames[diploma.m2],
      assignee: studentNames[diploma.assignee]
    }));

    res.json({
      diplomas: formattedDiplomas,
      history,
      grades,
      cancel_info: cancelInfo,
      loggedIn: studentId,
    });

  } catch (error) {
    console.error('Error fetching diplomas for student:', error);
    res.status(500).json({ message: 'Failed to fetch diploma information' });
  }
};

const uploadStudentFile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const diplomaId = req.params.diplomaId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileName = req.file.filename;
    const filePath = path.relative(process.cwd(), req.file.path);

    const { rows } = await pool.query(
      `INSERT INTO student_files (student_id, diploma_id, file_name, file_path) 
       VALUES ($1, $2, $3, $4)
       RETURNING id, file_name, upload_date`,
      [studentId, diplomaId, fileName, filePath]
    );

    res.json({
      message: 'File uploaded successfully.',
      file: rows[0]
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file.' });
  }
};

// Στο diplomaController.js, το fetchStudentFile πρέπει να αλλάξει:
const fetchStudentFile = async (req, res) => {
  try {
    const fileName = req.params.filename;
    const studentId = req.user.id;

    console.log('Fetching file:', fileName); // Για debugging
    console.log('For student:', studentId);

    // Έλεγχος πρόσβασης χωρίς diploma_id περιορισμό
    const { rows } = await pool.query(
      'SELECT sf.file_path FROM student_files sf WHERE sf.file_name = $1 AND sf.student_id = $2',
      [fileName, studentId]
    );

    console.log('Database result:', rows); // Για debugging

    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found or access denied.' });
    }

    const filePath = path.join(UPLOAD_PATH, fileName);
    console.log('Full file path:', filePath); // Για debugging

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server.' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('File fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch file.' });
  }
};


const fetchStudentFiles = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { rows: files } = await pool.query(
      `SELECT 
        id, 
        file_name, 
        file_path, 
        upload_date,
        diploma_id
       FROM student_files 
       WHERE student_id = $1
       ORDER BY upload_date DESC`,
      [studentId]
    );

    res.json({ 
      files: files.map(file => ({
        ...file,
        download_url: `/api/students/files/${file.file_name}`
      }))
    });
  } catch (error) {
    console.error('Fetch files error:', error);
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
};


const fetchFilesByDiplomaId = async (req, res) => {
  try {
    const studentId = req.user.id;
    const diplomaId = req.params.diplomaId;

    console.log('Fetching files for diploma:', diplomaId); // Για debugging
    console.log('For student:', studentId);

    const { rows: files } = await pool.query(
      `SELECT 
        id, 
        file_name, 
        file_path, 
        upload_date,
        diploma_id
       FROM student_files 
       WHERE student_id = $1 AND diploma_id = $2
       ORDER BY upload_date DESC`,
      [studentId, diplomaId]
    );

    console.log('Found files:', files); // Για debugging

    res.json({ 
      files: files.map(file => ({
        ...file,
        download_url: `/api/students/diplomas/files/${file.file_name}`
      }))
    });
  } catch (error) {
    console.error('Fetch files error:', error);
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
};


module.exports = {
  fetchDiplomasForStudent,
  uploadStudentFile,
  fetchStudentFile,
  fetchStudentFiles,
  fetchFilesByDiplomaId
};