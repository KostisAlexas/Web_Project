const pool = require('./db');

// Εύρεση ρόλου και στοιχείων χρήστη βάσει ID
const getRoleAndUserById = async (id) => {
    const tables = [
        { tableName: 'professors', idColumn: 'professor_id', role: 'professor' },
        { tableName: 'students', idColumn: 'student_id', role: 'student' },
        { tableName: 'secretariat', idColumn: 'secretariat_id', role: 'secretariat' },
    ];

    for (const { tableName, idColumn, role } of tables) {
        const query = `SELECT * FROM "${tableName}" WHERE "${idColumn}" = $1`;
        console.log('Executing query:', query); // Logging
        const result = await pool.query(query, [id]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            return { role, userId: user[idColumn], user }; // Επιστρέφουμε το userId
        }
    }

    return { role: null, userId: null, user: null }; // Αν δεν βρεθεί, επιστρέφουμε null
};

module.exports = { getRoleAndUserById };
