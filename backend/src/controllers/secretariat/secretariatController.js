const { createProfessorInDb, updateProfessorInDb, deleteProfessorInDb, getProfessorById } = require('../../models/professorModel');
const { createStudentInDb, updateStudentInDb, deleteStudentInDb, getStudentById } = require('../../models/studentModel');


// Δημιουργία καθηγητή
const createProfessor = async (req, res, next) => {
    try {
        const { password, ...professorDetails } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Απαιτείται κωδικός πρόσβασης.' });
        }

        // Αποθήκευση plain text κωδικού
        const newProfessor = await createProfessorInDb({ ...professorDetails, password });

        res.status(201).json(newProfessor);
    } catch (error) {
        next(error);
    }
};

module.exports = { createProfessor };


// Ενημέρωση καθηγητή
const updateProfessor = async (req, res, next) => {
    try {
        const professorId = req.params.id;
        const updates = req.body;

        if (updates.Professor_ID) {
            return res.status(400).json({ error: 'Δεν μπορείτε να αλλάξετε το ID ενός καθηγητή.' });
        }

        const updatedProfessor = await updateProfessorInDb(professorId, updates);

        res.status(200).json(updatedProfessor);
    } catch (error) {
        next(error);
    }
};

// Διαγραφή καθηγητή
const deleteProfessor = async (req, res, next) => {
    try {
        const professorId = req.params.id;
        await deleteProfessorInDb(professorId);

        res.status(200).json({ message: 'Ο καθηγητής διαγράφηκε με επιτυχία.' });
    } catch (error) {
        next(error);
    }
};

// Ανάκτηση στοιχείων καθηγητή
const getProfessor = async (req, res, next) => {
    try {
        const professorId = req.params.id;
        const professor = await getProfessorById(professorId);

        if (!professor) {
            return res.status(404).json({ error: 'Ο καθηγητής δεν βρέθηκε.' });
        }

        res.status(200).json(professor);
    } catch (error) {
        next(error);
    }
};

// Δημιουργία φοιτητή
const createStudent = async (req, res, next) => {
    try {
        const { password, ...studentDetails } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Απαιτείται κωδικός πρόσβασης.' });
        }

        // Αποθήκευση plain text κωδικού
        const newStudent = await createStudentInDb({ ...studentDetails, password });

        res.status(201).json(newStudent);
    } catch (error) {
        next(error);
    }
};

module.exports = { createStudent };

// Ενημέρωση φοιτητή
const updateStudent = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const updates = req.body;

        if (updates.Student_ID) {
            return res.status(400).json({ error: 'Δεν μπορείτε να αλλάξετε το ID ενός φοιτητή.' });
        }

        const updatedStudent = await updateStudentInDb(studentId, updates);

        res.status(200).json(updatedStudent);
    } catch (error) {
        next(error);
    }
};

// Διαγραφή φοιτητή
const deleteStudent = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        await deleteStudentInDb(studentId);

        res.status(200).json({ message: 'Ο φοιτητής διαγράφηκε με επιτυχία.' });
    } catch (error) {
        next(error);
    }
};

// Ανάκτηση στοιχείων φοιτητή
const getStudent = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const student = await getStudentById(studentId);

        if (!student) {
            return res.status(404).json({ error: 'Ο φοιτητής δεν βρέθηκε.' });
        }

        res.status(200).json(student);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProfessor,
    updateProfessor,
    deleteProfessor,
    getProfessor,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudent,
};
