const pool = require('./db'); // Σύνδεση με τη βάση δεδομένων

const uploadStudentFile = async (req, res) => {
  try {
    const studentId = req.user.id; // Από το authentication middleware
    const diplomaId = req.params.diplomaId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Αποθήκευση μεταδεδομένων στη βάση
    await pool.query(
      `INSERT INTO student_files (student_id, diploma_id, file_name, file_path) 
       VALUES ($1, $2, $3, $4)`,
      [studentId, diplomaId, fileName, filePath]
    );

    res.json({
      message: 'File uploaded successfully.',
      file: { fileName, filePath },
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file.' });
  }
};


const fetchStudentFiles = async (req, res) => {
    try {
      const studentId = req.user.id; // Από το authentication middleware
  
      const { rows: files } = await pool.query(
        `SELECT id, file_name, file_path, upload_date FROM student_files WHERE student_id = $1`,
        [studentId]
      );
  
      res.json({ files });
    } catch (error) {
      console.error('Fetch files error:', error);
      res.status(500).json({ error: 'Failed to fetch files.' });
    }
  };

  
module.exports = {
  uploadStudentFile,
  fetchStudentFiles,
};
