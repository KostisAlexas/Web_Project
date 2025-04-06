const { getProfessorById, updateProfessorDetails } = require('../../models/professorModel');
const jwt = require('jsonwebtoken');

// Προβολή προφίλ καθηγητή
const getProfessorProfile = async (req, res, next) => {
    try {
        const professorId = req.user.id; // Ανακτούμε το ID από το JWT token
        const professor = await getProfessorById(professorId);

        if (!professor) {
            return res.status(404).json({ error: 'Ο καθηγητής δεν βρέθηκε.' });
        }

        res.status(200).json(professor);
    } catch (error) {
        next(error);
    }
};

// Ενημέρωση προφίλ καθηγητή
const updateProfessorProfile = async (req, res, next) => {
    try {
        const professorId = req.user.id;
        const updates = req.body;

        // Επιτρέπουμε την αλλαγή κωδικού χωρίς hash
        const updatedProfessor = await updateProfessorDetails(professorId, updates);

        res.status(200).json(updatedProfessor);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getProfessorProfile,
    updateProfessorProfile,
};
