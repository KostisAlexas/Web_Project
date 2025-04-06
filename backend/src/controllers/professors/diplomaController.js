const fs = require('fs');
const path = require('path');
const { createDiplomaInDb, createDiplomaStatusHistory } = require('../../models/diplomaModel');
const { fetchDiplomasByProfessorId, fetchDiplomaHistory, fetchGrades, fetchCancelInfo } = require('../../models/diplomaModel');
const { getStudentsBySearch, assignStudentToDiploma, unassignStudentToDiploma } = require('../../models/diplomaModel');
const { fetchStudentNamesByIds } = require('../../models/studentModel');
const { fetchProfessorNamesByIds } = require('../../models/professorModel');


//Δημιουργία νέας διπλωματικής
const createDiploma = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const filePath = req.file ? req.file.filename : null;

    // Δημιουργία διπλωματικής
    const diploma = await createDiplomaInDb({
      title,
      description,
      supervisor_id: req.user.id,
      file_path: filePath,
    });

    // Ενημέρωση στο ιστορικό κατάστασης
    await createDiplomaStatusHistory({
      diploma_id: diploma.id,
      changed_by: req.user.id,
    });

    res.status(201).json({ success: true, diploma });
  } catch (error) {
    next(error);
  }
};

/**
 * Χειριστής για επιστροφή διπλωματικών εργασιών καθηγητή μέσω streaming
 * @param {Object} req - Το αίτημα HTTP
 * @param {Object} res - Η απάντηση HTTP
 */

const STATUS_MAP = {
  1: 'Πρόχειρη',
  2: 'Υπό Ανάθεση',
  3: 'Ενεργή', 
  4: 'Υπό Εξέταση',
  5: 'Περατωμένη',
  6: 'Ακυρωμένη'
};

const STATUS_TO_FIELD_MAP = {
  'Υπό Ανάθεση': 'Under_Assignment',
  'Ενεργή': 'Active',
  'Υπό Εξέταση': 'Under_Examination',
  'Περατωμένη': 'Completed',
  'Ακυρωμένη': 'Canceled'
};

const formatStatusHistory = (history) => {
  return history.map(({ id: diploma_id, hist }) => {
    // Sort history entries by date to ensure correct ordering
    const sortedHist = hist.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Map status IDs to their string representations
    const statuses = sortedHist.map(entry => STATUS_MAP[entry.status] || `Άγνωστη Κατάσταση (${entry.status})`);
    const dates = sortedHist.map(entry => entry.date);

    // Create an object to store the latest date for each status
    const statusDates = {};
    sortedHist.forEach(entry => {
      const statusStr = STATUS_MAP[entry.status];
      const fieldName = STATUS_TO_FIELD_MAP[statusStr];
      if (fieldName && !statusDates[fieldName]) {
        statusDates[fieldName] = entry.date;
      }
    });

    return {
      diploma_id,
      history: statuses,
      history_dates: dates,
      current_status: statuses[0],
      ...statusDates
    };
  });
};

const fetchDiplomasForProfessor = async (req, res) => {
  try {
    const professorId = req.user?.id;
    if (!professorId) {
      return res.status(400).json({ error: 'User ID not found.' });
    }

    const diplomas = await fetchDiplomasByProfessorId(professorId);
    const diplomaIds = diplomas.map(d => d.id);
    
    const [history, grades, cancelInfo, professorNames, studentNames] = await Promise.all([
      fetchDiplomaHistory(diplomaIds),
      fetchGrades(diplomaIds),
      fetchCancelInfo(diplomaIds),
      fetchProfessorNamesByIds([
        ...new Set(diplomas.flatMap(d => [d.supervisor, d.m1, d.m2]))
      ]),
      fetchStudentNamesByIds(diplomas.map(d => d.assignee).filter(Boolean))
    ]);

    const formattedHistory = formatStatusHistory(history);
    const formattedDiplomas = diplomas.map(diploma => ({
      ...diploma,
      supervisor_id: diploma.supervisor,
      supervisor: professorNames[diploma.supervisor],
      m1: professorNames[diploma.m1],
      m2: professorNames[diploma.m2],
      assignee: studentNames[diploma.assignee]
    }));

    res.json({
      diplomas: formattedDiplomas,
      history: formattedHistory,
      grades,
      cancel_info: cancelInfo,
      loggedIn: professorId,
    });
  } catch (error) {
    console.error('Error fetching diplomas for professor:', error);
    res.status(500).json({ message: 'Failed to fetch diploma information' });
  }
};

const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Search query is required.' 
      });
    }

    if (query.length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long.' 
      });
    }

    const students = await getStudentsBySearch(query);
    res.status(200).json({ students });
  } catch (error) {
    console.error('Error searching students:', error);
    
    if (error.type === 'SEARCH_ERROR') {
      return res.status(500).json({ 
        error: error.message 
      });
    }

    res.status(500).json({ 
      error: 'Server error while searching students.' 
    });
  }
};


const assignStudent = async (req, res) => {
  const { diplomaId, studentId } = req.body;
  const professorId = req.user.id;

  try {
    const supervisor = await getDiplomaSupervisor(diplomaId);
    if (supervisor !== professorId) {
      return res.status(403).json({ error: 'Δεν έχετε δικαίωμα να αλλάξετε τον φοιτητή αυτής της διπλωματικής.' });
    }

    await assignStudentToDiploma(diplomaId, studentId, professorId);
    res.status(200).json({ message: 'Ο φοιτητής ανατέθηκε επιτυχώς!' });
  } catch (error) {
    console.error('Error in assignStudent:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const unassignStudent = async (req, res) => {
  const { diplomaId } = req.body;
  const professorId = req.user.id;

  try {
    const supervisor = await getDiplomaSupervisor(diplomaId);
    if (supervisor !== professorId) {
      return res.status(403).json({ error: 'Δεν έχετε δικαίωμα να αφαιρέσετε τον φοιτητή από αυτή τη διπλωματική.' });
    }

    await unassignStudentToDiploma(diplomaId, professorId);
    res.status(200).json({ message: 'Η ανάθεση αναιρέθηκε επιτυχώς!' });
  } catch (error) {
    console.error('Error in unassignStudent:', error.message);
    res.status(400).json({ error: error.message });
  }
};


const changeDiplomaStatus = async (req, res) => {
  const { diplomaId } = req.body;
  const professorId = req.user.id;

  try {
    const query = `
      INSERT INTO Diploma_Status_History 
      (Diploma_ID, Previous_Status_ID, New_Status_ID, Changed_By_User_ID)
      VALUES ($1, 3, 4, $2)
      RETURNING *;
    `;
    const values = [diplomaId, professorId];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Diploma status updated successfully.',
      statusHistory: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating diploma status:', error);
    res.status(500).json({ error: 'Error updating diploma status.' });
  }
};



module.exports = {
    fetchDiplomasForProfessor,
    createDiploma,
    searchStudents,
    assignStudent,
    unassignStudent,
    changeDiplomaStatus,
};
