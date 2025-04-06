const { getStudentById, updateStudentDetails } = require('../../models/studentModel');
const bcrypt = require('bcrypt');

// Προβολή προφίλ φοιτητή
const getStudentProfile = async (req, res, next) => {
    try {
        const studentId = req.user.id; // Ανακτούμε το ID από το JWT token
        const student = await getStudentById(studentId);

        if (!student) {
            return res.status(404).json({ error: 'Ο φοιτητής δεν βρέθηκε.' });
        }

        res.status(200).json(student);
    } catch (error) {
        next(error);
    }
};

// Ενημέρωση προφίλ φοιτητή
const updateStudentProfile = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const updates = req.body;

        // Επιτρέπουμε την αλλαγή κωδικού χωρίς hash
        const updatedStudent = await updateStudentDetails(studentId, updates);

        res.status(200).json(updatedStudent);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getStudentProfile,
    updateStudentProfile,
};
