const { fetchInvitationsForProfessor, acceptInvitationAndAssignProfessor, rejectInvitation } = require('../../models/invitationModel');

/**
 * Επιστρέφει τις προσκλήσεις για τον συνδεδεμένο καθηγητή.
 */
const getProfessorInvitations = async (req, res) => {
    const professorId = req.user.id; // Από το JWT

    try {
        const invitations = await fetchInvitationsForProfessor(professorId);
        res.status(200).json(invitations);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const professorAcceptedInvitation = async (req, res) => {
    const { invitationId, diplomaId, studentId } = req.body;
    const professorId = req.user.id;
  
    if (!invitationId || !diplomaId || !studentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Δεν έχετε στείλει όλες τις απαραίτητες παραμέτρους" 
      });
    }
  
    try {
      await acceptInvitationAndAssignProfessor(invitationId, diplomaId, studentId, professorId);
      res.status(200).json({ success: true, message: "Invitation accepted." });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };


const professorRejectedInvitation = async (req, res) => {
    const { invitationId } = req.body;
    const professorId = req.user.id; // Από το JWT

    try {
        await rejectInvitation(invitationId, professorId);
        res.status(200).json({ success: true, message: "Invitation rejected." });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


module.exports = {
    getProfessorInvitations,
    professorAcceptedInvitation,
    professorRejectedInvitation
};

