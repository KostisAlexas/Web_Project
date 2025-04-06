const pool = require('./db');


// Δημιουργία νέας διπλωματικής εργασίας στη βάση δεδομένων
const createDiplomaInDb = async ({ title, description, supervisor_id }) => {
  const query = `
      INSERT INTO diploma (
          title, 
          diploma_subject_description, 
          supervisor_id
      ) VALUES ($1, $2, $3)
      RETURNING diploma_id, title, diploma_subject_description, supervisor_id;
  `;

  const values = [title, description, supervisor_id];
  const result = await pool.query(query, values);

  return result.rows[0];
};

const createDiplomaStatusHistory = async ({ diploma_id, changed_by_user_id }) => {
  const query = `
      INSERT INTO diploma_status_history (
          diploma_id, 
          changed_by_user_id
      ) VALUES ($1, $2)
      RETURNING status_history_id, diploma_id, change_date;
  `;

  const values = [diploma_id, changed_by_user_id];
  const result = await pool.query(query, values);

  return result.rows[0];
};

/**
 * Επιστρέφει τις διπλωματικές εργασίες όπου ο καθηγητής είναι supervisor ή μέλος.
 */
const fetchDiplomasByProfessorId = async (professorId) => {
  const query = `
    SELECT 
      Diploma_ID AS id,
      Title AS t,
      Diploma_Subject_Description AS d,
      Assigned_To AS assignee,
      Supervisor_ID AS supervisor,
      Member1_ID AS m1,
      Member2_ID AS m2,
      Library_link AS link,
      Date_Created_Diploma AS created,
      Examination_Date AS exam_date
    FROM 
      Diploma
    WHERE 
      Supervisor_ID = $1 OR Member1_ID = $1 OR Member2_ID = $1
  `;
  const { rows } = await pool.query(query, [professorId]);
  return rows;
};

//Αναζητούμε φοιτητές για ανάθεση
const getStudentsBySearch = async (searchQuery) => {
  const client = await pool.connect();
  try {
    // Σύνθετο query που επιστρέφει μόνο φοιτητές χωρίς ενεργή διπλωματική
    const query = `
      WITH ActiveDiplomas AS (
        SELECT DISTINCT assigned_to
        FROM diploma d
        WHERE assigned_to IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM cancel_information ci
          WHERE ci.canceled_diploma_id = d.diploma_id
        )
      )
      SELECT 
        s.student_id, 
        s.student_name, 
        s.student_surname
      FROM students s
      WHERE 
        (s.student_name ILIKE $1 OR s.student_surname ILIKE $1 OR s.student_id::TEXT ILIKE $1)
        AND NOT EXISTS (
          SELECT 1 
          FROM ActiveDiplomas ad 
          WHERE ad.assigned_to = s.student_id
        )
    `;

    const values = [`%${searchQuery}%`];
    const result = await client.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("Error in getStudentsBySearch:", error);
    throw {
      type: 'SEARCH_ERROR',
      message: 'Error occurred while searching for students.',
      originalError: error
    };
  } finally {
    client.release();
  }
};

//Καταχώρηση ανάθεσης (με διαχείριση συναλλαγής)
const assignStudentToDiploma = async (diplomaId, studentId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Έλεγχος αν ο φοιτητής έχει ήδη ανατεθεί σε άλλη διπλωματική
    const checkExistingDiplomaQuery = `
      SELECT diploma_id 
      FROM diploma 
      WHERE assigned_to = $1 AND diploma_id != $2`;
    const existingDiploma = await client.query(checkExistingDiplomaQuery, [studentId, diplomaId]);

    if (existingDiploma.rows.length > 0) {
      // Βρέθηκε διπλωματική - έλεγχος αν είναι ακυρωμένη
      const existingDiplomaId = existingDiploma.rows[0].diploma_id;
      
      const checkCancelledQuery = `
        SELECT canceled_diploma_id 
        FROM cancel_information 
        WHERE canceled_diploma_id = $1`;
      const cancelledDiploma = await client.query(checkCancelledQuery, [existingDiplomaId]);

      // Αν δεν είναι ακυρωμένη, δεν επιτρέπουμε νέα ανάθεση
      if (cancelledDiploma.rows.length === 0) {
        throw new Error('Ο φοιτητής εχει ήδη ενεργή διπλωματική');
      }
      // Αν είναι ακυρωμένη, συνεχίζουμε κανονικά με την ανάθεση
    }

    // Προχωράμε με την ανάθεση
    const updateDiplomaQuery = `
      UPDATE diploma
      SET assigned_to = $1
      WHERE diploma_id = $2
    `;
    await client.query(updateDiplomaQuery, [studentId, diplomaId]);

    const insertHistoryQuery = `
      INSERT INTO Diploma_Status_History (Diploma_ID, New_Status_ID, Changed_By_User_ID)
      VALUES ($1, 2, $2)
    `;
    await client.query(insertHistoryQuery, [diplomaId, userId]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error in assignStudentToDiploma:", error);
    throw error;
  } finally {
    client.release();
  }
};

const unassignStudentToDiploma = async (diplomaId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Έλεγχος αν υπάρχει ήδη ανάθεση
    const checkAssignedQuery = `
      SELECT assigned_to
      FROM diploma
      WHERE diploma_id = $1
    `;
    const assigned = await client.query(checkAssignedQuery, [diplomaId]);

    if (assigned.rows.length === 0 || !assigned.rows[0].assigned_to) {
      throw new Error('Δεν υπάρχει φοιτητής ανατεθειμένος σε αυτή τη διπλωματική.');
    }

    // Έλεγχος status history
    const checkStatusQuery = `
      SELECT new_status_id
      FROM diploma_status_history
      WHERE diploma_id = $1
      ORDER BY change_date DESC
      LIMIT 1
    `;
    const status = await client.query(checkStatusQuery, [diplomaId]);

    if (status.rows.length === 0 || status.rows[0].new_status > 2) {
      throw new Error('Δεν επιτρέπεται η αναιρέση ανάθεσης σε αυτό το στάδιο.');
    }

    // Ενημέρωση πίνακα diploma
    const unassignQuery = `
      UPDATE diploma
      SET assigned_to = NULL
      WHERE diploma_id = $1
    `;
    await client.query(unassignQuery, [diplomaId]);

    // Ενημέρωση ιστορικού status
    const insertHistoryQuery = `
      INSERT INTO diploma_status_history (diploma_id, previous_status_id, new_status_id, changed_by_user_id)
      VALUES ($1, 2, 1, $2)
    `;
    await client.query(insertHistoryQuery, [diplomaId, userId]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in unassignStudentToDiploma:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

const getDiplomaSupervisor = async (diplomaId) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT supervisor_id
      FROM diploma
      WHERE diploma_id = $1
    `;
    const result = await client.query(query, [diplomaId]);
    if (result.rows.length === 0) {
      throw new Error('Η διπλωματική δεν βρέθηκε.');
    }
    return result.rows[0].supervisor_id;
  } catch (error) {
    console.error('Error in getDiplomaSupervisor:', error.message);
    throw error;
  } finally {
    client.release();
  }
};


/**
 * Επιστρέφει τις διπλωματικές εργασίες όπου ο φοιτητής είναι ο "Assigned_To".
 */
const fetchDiplomasByStudentId = async (studentId) => {
    const query = `
      SELECT 
        Diploma_ID AS id,
        Title AS t,
        Diploma_Subject_Description AS d,
        Assigned_To AS assignee,
        Supervisor_ID AS supervisor,
        Member1_ID AS m1,
        Member2_ID AS m2,
        Library_link AS link,
        Date_Created_Diploma AS created,
        Examination_Date AS exam_date
      FROM 
        Diploma
      WHERE 
        Assigned_To = $1
    `;
    const { rows } = await pool.query(query, [studentId]);
    return rows;
  };

/**
 * Επιστρέφει το ιστορικό καταστάσεων για συγκεκριμένες διπλωματικές.
 */
const fetchDiplomaHistory = async (diplomaIds) => {
  const query = `
    SELECT 
      Diploma_ID AS id,
      ARRAY_AGG(
        JSON_BUILD_OBJECT('status', New_Status_ID, 'date', Change_Date)
      ) AS hist
    FROM 
      Diploma_Status_History
    WHERE 
      Diploma_ID = ANY($1)
    GROUP BY 
      Diploma_ID
  `;
  const { rows } = await pool.query(query, [diplomaIds]);
  return rows;
};

/**
 * Επιστρέφει βαθμολογίες για συγκεκριμένες διπλωματικές (επιλεκτική ανάκτηση).
 */
const fetchGrades = async (diplomaIds) => {
  const query = `
    SELECT 
      Diploma_ID AS id,
      JSON_BUILD_OBJECT(
        'sup', Supervisor_Grade,
        'm1', Member1_Grade,
        'm2', Member2_Grade,
        'final', Final_Grade
      ) AS grades
    FROM 
      Grades
    WHERE 
      Diploma_ID = ANY($1)
  `;
  const { rows } = await pool.query(query, [diplomaIds]);
  return rows;
};

/**
 * Επιστρέφει πληροφορίες ακύρωσης για συγκεκριμένες διπλωματικές (επιλεκτική ανάκτηση).
 */
const fetchCancelInfo = async (diplomaIds) => {
  const query = `
    SELECT 
      Canceled_Diploma_ID AS id,
      JSON_BUILD_OBJECT(
        'reason', Cancel_Reason,
        'meeting_no', Cancel_Meeting_Number,
        'year', Cancel_Meeting_Year
      ) AS cancel_info
    FROM 
      Cancel_Information
    WHERE 
      Canceled_Diploma_ID = ANY($1)
  `;
  const { rows } = await pool.query(query, [diplomaIds]);
  return rows;
};

module.exports = {
  createDiplomaInDb,
  createDiplomaStatusHistory,
  fetchDiplomasByProfessorId,
  getStudentsBySearch,
  assignStudentToDiploma,
  unassignStudentToDiploma,
  getDiplomaSupervisor,
  fetchDiplomasByStudentId,
  fetchDiplomaHistory,
  fetchGrades,
  fetchCancelInfo,
};