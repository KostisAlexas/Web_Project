const pool = require('./db');

// Ανάκτηση στοιχείων καθηγητή μέσω ID
const getProfessorById = async (id) => {
    const query = 'SELECT * FROM professors WHERE professor_id = $1';
    const result = await pool.query(query, [id]);

    return result.rows[0];
};

// Ενημέρωση στοιχείων καθηγητή
const updateProfessorDetails = async (id, updates) => {
    const fields = Object.keys(updates).map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = Object.values(updates);

    const query = `UPDATE professors SET ${fields} WHERE professor_id = $${values.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    return result.rows[0];
};

// Δημιουργία καθηγητή
const createProfessorInDb = async (professorDetails) => {
    const query = `
        INSERT INTO professors (
            professor_id, professor_name, professor_surename, password
        ) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = Object.values(professorDetails);
    const result = await pool.query(query, values);

    return result.rows[0];
};

// Ενημέρωση καθηγητή
const updateProfessorInDb = async (id, updates) => {
    const fields = Object.keys(updates).map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = Object.values(updates);

    const query = `UPDATE professors SET ${fields} WHERE professor_id = $${values.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    return result.rows[0];
};

// Διαγραφή καθηγητή
const deleteProfessorInDb = async (id) => {
    const query = 'DELETE FROM professors WHERE professor_id = $1';
    await pool.query(query, [id]);
};

/**
 *  Επιστρέφει ονόματα για επιλεγμένα id's απο το table του καθηγητή
 */
const fetchProfessorNamesByIds = async (professorIds) => {
    const query = `
      SELECT 
        Professor_ID AS id,
        CONCAT(Professor_Name, ' ', Professor_Surename) AS name
      FROM 
        Professors
      WHERE 
        Professor_ID = ANY($1)
    `;
    const { rows } = await pool.query(query, [professorIds]);
    return rows.reduce((acc, row) => {
      acc[row.id] = row.name;
      return acc;
    }, {});
  };

// Πάρε τη φώτο προφιλ του καθηγητή
const fetchProfessorPhotosByIds = async (professorIds) => {
    const query = `
      SELECT 
        Professor_ID AS id,
        Professor_Photo AS photo
      FROM 
        Professors
      WHERE 
        Professor_ID = ANY($1)
    `;
    const { rows } = await pool.query(query, [professorIds]);
    return rows.reduce((acc, row) => {
      acc[row.id] = row.photo || null;
      return acc;
    }, {});
  };

module.exports = {
    createProfessorInDb,
    updateProfessorInDb,
    deleteProfessorInDb,
    getProfessorById,
    updateProfessorDetails,
    fetchProfessorNamesByIds,
    fetchProfessorPhotosByIds,
};
