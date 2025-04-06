const pool = require('./db');

const getAnnouncements = async () => {
    const query = `
        SELECT 
            id, 
            author, 
            content AS what, 
            published AS when 
        FROM announcements
        ORDER BY published DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

module.exports = {
    getAnnouncements,
};
