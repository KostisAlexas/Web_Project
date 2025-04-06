const publicModel = require('../../models/publicModel');
const professorModel = require('../../models/professorModel');
const studentModel = require('../../models/studentModel');

const fetchAnnouncements = async (req, res) => {
    try {
        const announcements = await publicModel.getAnnouncements();

        // Συγκέντρωση μοναδικών author IDs
        const authorIds = [...new Set(announcements.map(a => a.author))];

        // Απόκτηση στοιχείων από τις συναρτήσεις των καθηγητών
        const professorNames = await professorModel.fetchProfessorNamesByIds(authorIds);
        const professorPhotos = await professorModel.fetchProfessorPhotosByIds(authorIds);

        // Απόκτηση στοιχείων από τις συναρτήσεις των φοιτητών
        const studentNames = await studentModel.fetchStudentNamesByIds(authorIds);
        const studentPhotos = await studentModel.fetchStudentPhotosByIds(authorIds);

        // Δημιουργία JSON response
        const response = announcements.map(announcement => {
            const authorId = announcement.author;
            let name = professorNames[authorId] || studentNames[authorId] || null;
            let photo = professorPhotos[authorId] || studentPhotos[authorId] || null;

            if (!name) {
                throw new Error(`Author with ID ${authorId} not found.`);
            }

            return {
                id: announcement.id,
                who: name,
                photo,
                what: announcement.what,
                when: announcement.when,
            };
        });

        res.json(response);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
};

module.exports = {
    fetchAnnouncements,
};
