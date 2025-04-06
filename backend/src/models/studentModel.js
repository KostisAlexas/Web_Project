const pool = require('./db');

// Ανάκτηση στοιχείων φοιτητή μέσω ID
const getStudentById = async (id) => {
    const query = 'SELECT * FROM students WHERE student_id = $1';
    const result = await pool.query(query, [id]);

    return result.rows[0];
};

// Ενημέρωση στοιχείων φοιτητή
const updateStudentDetails = async (id, updates) => {
    const fields = Object.keys(updates).map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = Object.values(updates);

    const query = `UPDATE students SET ${fields} WHERE student_id = $${values.length + 1} RETURNING student_id, student_name, student_surname`;
    const result = await pool.query(query, [...values, id]);

    return result.rows[0];
};

// Δημιουργία φοιτητή
const createStudentInDb = async (studentDetails) => {
    const query = `
        INSERT INTO students (
            student_id, student_name, student_surname, student_password
        ) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = Object.values(studentDetails);
    const result = await pool.query(query, values);

    return result.rows[0];
};

// Ενημέρωση φοιτητή
const updateStudentInDb = async (id, updates) => {
    const fields = Object.keys(updates).map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = Object.values(updates);

    const query = `UPDATE students SET ${fields} WHERE student_id = $${values.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    return result.rows[0];
};

// Διαγραφή φοιτητή
const deleteStudentInDb = async (id) => {
    const query = 'DELETE FROM students WHERE student_id = $1';
    await pool.query(query, [id]);
};

/**
 *  Επιστρέφει ονόματα για επιλεγμένα id's απο το table του φοιτητή.
 */
const fetchStudentNamesByIds = async (studentIds) => {
    const query = `
      SELECT 
        Student_ID AS id,
        CONCAT(Student_Name, ' ', Student_Surname) AS name
      FROM 
        Students
      WHERE 
        Student_ID = ANY($1)
    `;
    const { rows } = await pool.query(query, [studentIds]);
    return rows.reduce((acc, row) => {
      acc[row.id] = row.name;
      return acc;
    }, {});
  };

//Πάρε τη φωτογραφία προφίλ του φοιτητή.
const fetchStudentPhotosByIds = async (studentIds) => {
    const query = `
      SELECT 
        Student_ID AS id,
        Student_Photo AS photo
      FROM 
        Students
      WHERE 
        Student_ID = ANY($1)
    `;
    const { rows } = await pool.query(query, [studentIds]);
    return rows.reduce((acc, row) => {
      acc[row.id] = row.photo || null;
      return acc;
    }, {});
  };


module.exports = {
    createStudentInDb,
    updateStudentInDb,
    deleteStudentInDb,
    getStudentById,
    updateStudentDetails,
    fetchStudentNamesByIds,
    fetchStudentPhotosByIds,
};
