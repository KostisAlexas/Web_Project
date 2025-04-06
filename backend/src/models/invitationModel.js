const pool = require('./db');

/*fetch των προσκλήσεων που αφορούν τον καθηγητή */
const fetchInvitationsForProfessor = async (professorId) => {
    const query = `
        WITH ActiveDiplomas AS (
            SELECT 
                d.Diploma_ID,
                d.Title,
                d.Supervisor_ID,
                d.Member1_ID,
                d.Member2_ID
            FROM 
                Diploma d
            WHERE 
                d.Assigned_To IN (
                    SELECT DISTINCT i.Sent_From
                    FROM Invitation i
                    WHERE i.Sent_To = $1
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM Cancel_Information ci
                    WHERE ci.Canceled_Diploma_ID = d.Diploma_ID
                )
        )
        SELECT 
            i.Invitation_ID AS id,
            i.Sent_From AS student_id,
            s.Student_Name || ' ' || s.Student_Surname AS student_name,
            i.Answer AS status,
            ad.Diploma_ID AS diploma_id,
            ad.Title AS diploma_title,
            p1.Professor_ID AS supervisor_id,
            CONCAT(p1.Professor_Name, ' ', p1.Professor_Surename) AS supervisor_name,
            p2.Professor_ID AS first_member_id,
            CASE WHEN p2.Professor_ID IS NOT NULL THEN CONCAT(p2.Professor_Name, ' ', p2.Professor_Surename) ELSE NULL END AS first_member_name,
            p3.Professor_ID AS second_member_id,
            CASE WHEN p3.Professor_ID IS NOT NULL THEN CONCAT(p3.Professor_Name, ' ', p3.Professor_Surename) ELSE NULL END AS second_member_name,
            i.created_at AS created_at
        FROM 
            Invitation i
        JOIN 
            Students s ON s.Student_ID = i.Sent_From
        JOIN 
            ActiveDiplomas ad ON ad.Diploma_ID = i.Sent_For
        LEFT JOIN 
            Professors p1 ON p1.Professor_ID = ad.Supervisor_ID
        LEFT JOIN 
            Professors p2 ON p2.Professor_ID = ad.Member1_ID
        LEFT JOIN 
            Professors p3 ON p3.Professor_ID = ad.Member2_ID
        WHERE 
            i.Sent_To = $1
        ORDER BY 
            i.created_at DESC;
    `;
    const { rows } = await pool.query(query, [professorId]);
    return rows;
};


/* 
*Buisiness logic για αποδοχή πρόσκλησης απο καθηγητή
*/
const acceptInvitationAndAssignProfessor = async (invitationId, diplomaId, studentId, professorId) => {
    const client = await pool.connect(); // Χρησιμοποιούμε transaction για να διασφαλίσουμε ακεραιότητα
    try {
        await client.query('BEGIN');

        // 1. Έλεγχος αν το invitation είναι ακόμα 'Pending'
        const checkInvitationQuery = `
            SELECT Answer 
            FROM Invitation 
            WHERE Invitation_ID = $1 AND Sent_from = $2 FOR UPDATE;
        `;
        const { rows: invitationRows } = await client.query(checkInvitationQuery, [invitationId, studentId]);

        if (!invitationRows.length || invitationRows[0].answer !== 'Pending') {
            throw new Error('Η πρόσκληση δεν είναι έγκυρη ή έχει λήξει.');
        }

        // 2. Αποδοχή της πρόσκλησης
        const acceptInvitationQuery = `
            UPDATE Invitation
            SET Answer = 'Accepted', updated_at = CURRENT_TIMESTAMP
            WHERE Invitation_ID = $1;
        `;
        await client.query(acceptInvitationQuery, [invitationId]);

        // 3. Έλεγχος και καταχώρηση του καθηγητή ως μέλος τριμελούς επιτροπής
        const checkDiplomaQuery = `
            SELECT Member1_ID, Member2_ID, Supervisor_ID
            FROM Diploma 
            WHERE Diploma_ID = $1 FOR UPDATE;
        `;
        const { rows: diplomaRows } = await client.query(checkDiplomaQuery, [diplomaId]);

        if (!diplomaRows.length) {
            throw new Error('Η διπλωματική δεν βρέθηκε.');
        }

        const { member1_id: member1Id, member2_id: member2Id, supervisor_id: supervisorId } = diplomaRows[0];

        let assignQuery;
        if (!member1Id) {
            assignQuery = `
                UPDATE Diploma
                SET Member1_ID = $1
                WHERE Diploma_ID = $2;
            `;
            await client.query(assignQuery, [professorId, diplomaId]);
        } else if (!member2Id) {
            assignQuery = `
                UPDATE Diploma
                SET Member2_ID = $1
                WHERE Diploma_ID = $2;
            `;
            await client.query(assignQuery, [professorId, diplomaId]);

            // Σήμανση ότι η τριμελής επιτροπή έχει συμπληρωθεί
            const deprecateInvitationsQuery = `
                UPDATE Invitation
                SET Answer = 'Depricated', updated_at = CURRENT_TIMESTAMP
                WHERE Sent_From = $1 AND Answer = 'Pending';
            `;
            await client.query(deprecateInvitationsQuery, [studentId]);

            // Καταγραφή αλλαγής κατάστασης στον πίνακα diploma_status_history
            const logStatusChangeQuery = `
                INSERT INTO diploma_status_history (diploma_id, previous_status_id, new_status_id, changed_by_user_id)
                VALUES ($1, $2, $3, $4);
            `;
            await client.query(logStatusChangeQuery, [diplomaId, 2, 3, studentId]);
        } else {
            throw new Error('Η τριμελής επιτροπή εχει συμπληρωθεί.');
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};


const rejectInvitation = async (invitationId, professorId) => {
    const query = `
        UPDATE invitation
        SET answer = 'Rejected', updated_at = CURRENT_TIMESTAMP
        WHERE invitation_id = $1 AND sent_to = $2 AND answer = 'Pending';
    `;
    const { rowCount } = await pool.query(query, [invitationId, professorId]);
    if (rowCount === 0) throw new Error('Εχετε ήδη απαντήσει.');
};


module.exports = {
    fetchInvitationsForProfessor,
    acceptInvitationAndAssignProfessor,
    rejectInvitation
};
