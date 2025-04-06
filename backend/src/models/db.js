/*
* Αυτό το αρχείο διαχειρίζεται τη σύνδεση με τη βάση δεδομένων.
*/

const { Pool } = require('pg');
require('dotenv').config();

// Δημιουργία pool σύνδεσης
const pool = new Pool({

    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,

});


// Δοκιμή εκτέλεσης query κατά την εκκίνηση
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error executing test query:', err.message);
    } else {
        console.log('Test query executed successfully. Current time:', res.rows[0].now);
    }
});


module.exports = pool;
