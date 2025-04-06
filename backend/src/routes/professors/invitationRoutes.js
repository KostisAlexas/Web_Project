const express = require('express');
const router = express.Router();
const { getProfessorInvitations, professorAcceptedInvitation, professorRejectedInvitation } = require('../../controllers/professors/invitationController');
const authenticateProfessor = require('../../middleware/authentication'); // Middleware για auth

// Route: GET /api/professors/invitations
router.get('/', authenticateProfessor, getProfessorInvitations);

// Καθηγητής αποδέχεται πρόσκληση
router.post('/accept', authenticateProfessor, professorAcceptedInvitation);

// Καθηγητής απορρίπτει πρόσκληση
router.post('/reject', authenticateProfessor, professorRejectedInvitation);


module.exports = router;
