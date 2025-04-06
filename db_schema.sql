CREATE TABLE Professors (
    Professor_ID INT PRIMARY KEY UNIQUE,
    Professor_Name TEXT NOT NULL CHECK (LENGTH(Professor_Name) <= 255),
    Professor_Surename TEXT NOT NULL CHECK (LENGTH(Professor_Surename) <= 255),
    Professor_Email TEXT NOT NULL UNIQUE,
    CHECK (Professor_Email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    Professor_Public_Phone_Number VARCHAR(15) NOT NULL UNIQUE,
    CHECK (Professor_Public_Phone_Number ~ '^\+?[0-9\s\-]{10,15}$'),
    Professor_Photo BYTEA, -- Δυαδικά δεδομένα για τη φωτογραφία
    CHECK (octet_length(Professor_Photo) <= 2000000), -- Μέγιστο μέγεθος φωτογραφίας: 2 MB
    Professor_Signature BYTEA, -- Δυαδικά δεδομένα για την υπογραφή, μπορει να κρυπτογραφείται στην είσοδο.
    CHECK (octet_length(Professor_Signature) <= 500000), -- Μέγιστο μέγεθος υπογραφής: 500 KB
    Professor_Department TEXT NOT NULL CHECK (LENGTH(Professor_Department) <= 255),
    Professor_sector TEXT NOT NULL CHECK (LENGTH(Professor_Sector) <= 255),
    Professor_AboutMe TEXT CHECK (LENGTH(Professor_AboutMe) <= 300),
    Professor_CV BYTEA, -- Προαιρετικά, το CV μπορεί να αποθηκευτεί ως BYTEA
    CHECK (octet_length(Professor_CV) <= 5000000), -- Μέγιστο μέγεθος CV: 5 MB
    Professor_Website TEXT CHECK (LENGTH(Professor_Website) <= 2048),
    Professor_Password TEXT CHECK (LENGTH(Professor_Password) <=255)
);


CREATE TABLE Students (
    Student_ID INT PRIMARY KEY UNIQUE,
	Student_Name TEXT NOT NULL CHECK (LENGTH(Student_Name) <= 255),
    Student_Surname TEXT NOT NULL CHECK (LENGTH(Student_Surname) <= 255),
    Student_Email TEXT NOT NULL UNIQUE,
    Student_Phone_Number VARCHAR(15) UNIQUE,
    CHECK (Student_Email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CHECK (Student_Phone_Number ~ '^\+?[0-9\s\-]{10,15}$'),
    Student_Photo BYTEA, -- Δυαδικά δεδομένα για τη φωτογραφία
    CHECK (octet_length(Student_Photo) <= 2000000), -- Μέγιστο μέγεθος φωτογραφίας: 2 MB
    Student_Signature BYTEA, -- Δυαδικά δεδομένα για την υπογραφή
    CHECK (octet_length(Student_Signature) <= 500000), -- Μέγιστο μέγεθος υπογραφής: 500 KB
    Student_Password TEXT CHECK (LENGTH(Student_Password) <=255),

    Member_Since TIMESTAMP,
    Student_AboutMe TEXT CHECK (LENGTH(Student_AboutMe) <= 301),
    Ects INT NOT NULL,
    Year_Of_Entrance INT CHECK (Year_Of_Entrance > 0)
);


CREATE TABLE Secretariat (
    Secretariat_ID INT PRIMARY KEY UNIQUE,
    Secretariat_Public_Phone_Number VARCHAR(15) NOT NULL UNIQUE,
    CHECK (Secretariat_Public_Phone_Number ~ '^\+?[0-9\s\-]{10,15}$'),
    Secretariat_Email TEXT NOT NULL UNIQUE,
    CHECK (Secretariat_Email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
    Secretariat_Password TEXT CHECK (LENGTH(Secretariat_Password) <=255)
);


CREATE TABLE Diploma (
    Diploma_ID SERIAL PRIMARY KEY,
    Title TEXT CHECK (LENGTH(Title) <= 1500),
    Diploma_Subject_Description TEXT CHECK (LENGTH(Diploma_Subject_Description) <= 5000),
    Assigned_To INT,
    Supervisor_ID INT NOT NULL,
    Member1_ID INT,
    Member2_ID INT,
    Library_link TEXT CHECK (LENGTH(Library_link) <= 2048),
    Date_Created_Diploma TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Examination_Date TIMESTAMP WITH TIME ZONE, --Trigger checks status is 4 before insert
    
    CONSTRAINT fk_diploma_can_only_be_assigned_to_student_id
        FOREIGN KEY (Assigned_To) REFERENCES Students(Student_ID),
    CONSTRAINT fk_supervisor_can_only_be_professor
        FOREIGN KEY (Supervisor_ID) REFERENCES Professors (Professor_ID),
    CONSTRAINT fk_member1_can_only_be_professor
        FOREIGN KEY (Member1_ID) REFERENCES Professors (Professor_ID),
    CONSTRAINT fk_member2_can_only_be_professor
        FOREIGN KEY (Member2_ID) REFERENCES Professors (Professor_ID)
);


-- 'Temporary', 'Under_Assignement', 'Active', 'Under_Examination', 'Completed', 'Canceled'
CREATE TABLE Diploma_States (
    Diploma_State_ID SERIAL PRIMARY KEY,
    Diploma_State_Name VARCHAR(40) NOT NULL UNIQUE,
    State_Description TEXT --Describe the purpose of each state
);


CREATE TABLE Diploma_Status_History (
    Status_History_ID SERIAL PRIMARY KEY,
    Diploma_ID INT,
    Previous_Status_ID INT NOT NULL DEFAULT 1,
    New_Status_ID INT NOT NULL DEFAULT 1,
    Changed_By_User_ID INT NOT NULL,
    Change_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_status_history_diploma FOREIGN KEY (Diploma_ID)
        REFERENCES Diploma(Diploma_ID),
	CONSTRAINT fk_status_before_transition FOREIGN KEY (Previous_Status_ID)
	    REFERENCES Diploma_States(Diploma_State_ID),
	CONSTRAINT fk_status_after_transition FOREIGN KEY (New_Status_ID)
	    REFERENCES Diploma_States(Diploma_State_ID)
);


CREATE TABLE Cancel_Information (
    Canceled_Diploma_ID INT NOT NULL,
    Cancel_Reason TEXT NOT NULL,
    Cancel_Meeting_Number INT NOT NULL,
    Cancel_Meeting_Year INT NOT NULL,

    CONSTRAINT fk_canceled_diploma FOREIGN KEY (Canceled_Diploma_ID)
        REFERENCES Diploma(Diploma_ID)
    --Φτιάξε λογική τέτοια ώστε όταν στο cancelation_request είναι όλα true ΚΑΙ
    --οταν στο cancel_information όλα έχουν συμπληρωθεί,
    --Τότε στέλνεται μύνημα που επιτρέπει την αλλαγή κατάστασης απο 3->6 στο Diploma_Status_History
);


CREATE TABLE Cancelation_Request (
    Cancelation_Request_ID SERIAL PRIMARY KEY,
    Diploma_ID_To_Cancel INT,
    Cancel_Prompt TEXT, --Make trigger presenting the following default text
    -- "Ο επιβλέπον καθηγητής (Professors.Professor_Full_Name WHERE professor is supervisor) επιθυμεί να διακόψει την ανάθεση της διπλωματικής εργασίας (Diploma.Title WHERE diplomaid is current id) στον φοιτητή (Diploma.Assigned_To WHERE Diploma_ID=curent_Diploma_ID) Να διακοπεί η εκπόνηση της διπλωματικής εργασίας?",
 --Yes/no
    Supervisor_Agreed_To_Cancel BOOLEAN,
    Member1_Agreed_To_Cancel BOOLEAN,
    Member2_Agreed_To_Cancel BOOLEAN,
 --If all three agree then return message ready to cancel

    CONSTRAINT fk_cancelation_reffers_to_diploma FOREIGN KEY (Diploma_ID_To_Cancel)
        REFERENCES Diploma(Diploma_ID)
);


CREATE TABLE Grades (
    Diploma_ID INT PRIMARY KEY,  -- Ensures each Diploma_ID appears only once in this table
    Supervisor_Grade NUMERIC CHECK (Supervisor_Grade BETWEEN 0 AND 10),
    Member1_Grade NUMERIC CHECK (Member1_Grade BETWEEN 0 AND 10),
    Member2_Grade NUMERIC CHECK (Member2_Grade BETWEEN 0 AND 10),
    Final_Grade NUMERIC CHECK (Final_Grade BETWEEN 0 AND 10),

    CONSTRAINT fk_grade_can_only_match_a_diploma
        FOREIGN KEY (Diploma_ID) REFERENCES Diploma(Diploma_ID)
);


CREATE TABLE Invitation (
    Invitation_ID SERIAL PRIMARY KEY,
    Sent_From INT REFERENCES Students(Student_ID),
    Sent_To INT REFERENCES Professors(Professor_ID),
    Sent_For INT REFERENCES Diploma(Diploma_ID), /*προσθέθηκε αργότερα */
    Answer VARCHAR(10) NOT NULL CHECK (Answer IN ('Accepted', 'Rejected', 'Depricated', 'Pending')) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
    updated_at TIMESTAMP WITH TIME ZONE;
);

/* Με το τέλος της συγγραφής της Δ.Ε. και μετά από έγκριση του ΕΚ, ο/η φοιτητής/φοιτήτρια.
  υποβάλλει τη ΔΕ στην ΤΣΕ, η οποία την εγκρίνει ή την απορρίπτει αφού μεσολαβήσει διάστημα
  τουλάχιστον τριών εβδομάδων αλλά όχι περισσότερο από δύο μήνες. Στο χρονικό διάστημα
  που δίνεται στην ΤΣΕ, ορίζεται μετά από σύμφωνη γνώμη της, ημερομηνία δημόσιας
  παρουσίασης και εξέτασης της ΔΕ.
*/

CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    author INT NOT NULL,
    content TEXT CHECK (LENGTH(content) <= 2048),
    published TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_files (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    diploma_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



--TRIGGERS

CREATE OR REPLACE FUNCTION validate_diploma_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Ελέγχουμε την έγκυρη μετάβαση
    IF NOT (
        (NEW.Previous_Status_ID = 1 AND NEW.New_Status_ID IN (2)) OR
        (NEW.Previous_Status_ID = 2 AND NEW.New_Status_ID IN (1, 3)) OR
        (NEW.Previous_Status_ID = 3 AND NEW.New_Status_ID IN (4, 6)) OR
        (NEW.Previous_Status_ID = 4 AND NEW.New_Status_ID IN (3, 5)) OR
        (NEW.Previous_Status_ID = 6 AND NEW.New_Status_ID IN (2))
    ) THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', 
            NEW.Previous_Status_ID, NEW.New_Status_ID;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_diploma_status_transition
BEFORE INSERT OR UPDATE ON Diploma_Status_History
FOR EACH ROW
EXECUTE FUNCTION validate_diploma_status_transition();




-- Function to ensure grading rules
CREATE OR REPLACE FUNCTION ensure_grading_allowed()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the diploma's Examination_Date is valid and in the past
    IF (
        NEW.Examination_Date IS NULL OR
        NEW.Examination_Date > CURRENT_DATE
    ) THEN
        RAISE EXCEPTION 'Grades can only be recorded after the examination date has passed.';
    END IF;

    -- Check if the diploma is in 'under examination' status (status 4)
    IF NOT EXISTS (
        SELECT 1
        FROM Diploma_Status_History dsh
        WHERE dsh.Diploma_ID = NEW.Diploma_ID
          AND dsh.New_Status_ID = 4
    ) THEN
        RAISE EXCEPTION 'Grades can only be recorded for diplomas under examination.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for grades
CREATE TRIGGER trg_check_grading_rules
BEFORE INSERT OR UPDATE ON Grades
FOR EACH ROW
EXECUTE FUNCTION ensure_grading_allowed();



-- Δεν μπορει να εισαχθεί ημερομηνία εξέτασης αν η διπλωματική δεν βρίσκεται σε κατάσταση υποεξέταση.
CREATE OR REPLACE FUNCTION ensure_exam_date_rules()
RETURNS TRIGGER AS $$
BEGIN
    -- Λογική για INSERT
    IF TG_OP = 'INSERT' THEN
        -- Έλεγχος: Μπορούμε να εισάγουμε ημερομηνία μόνο αν η διπλωματική είναι στη κατάσταση 4
        IF NEW.Examination_Date IS NOT NULL AND NOT EXISTS (
            SELECT 1
            FROM Diploma_Status_History dsh
            WHERE dsh.Diploma_ID = NEW.Diploma_ID
              AND dsh.New_Status_ID = 4
              AND dsh.Change_Date = (
                  SELECT MAX(dsh_inner.Change_Date)
                  FROM Diploma_Status_History dsh_inner
                  WHERE dsh_inner.Diploma_ID = NEW.Diploma_ID
              )
        ) THEN
            RAISE EXCEPTION 'Ημερομηνία εξέτασης μπορεί να οριστεί μόνο εφόσον η διπλωματική είναι σε κατάσταση υποεξέταση.';
        END IF;
    END IF;

    -- Λογική για UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Έλεγχος: Αν αλλάζει το Examination_Date
        IF NEW.Examination_Date IS DISTINCT FROM OLD.Examination_Date THEN
            -- Έλεγχος: Μπορούμε να αλλάξουμε ημερομηνία μόνο αν η διπλωματική είναι στη κατάσταση 4
            IF NEW.Examination_Date IS NOT NULL AND NOT EXISTS (
                SELECT 1
                FROM Diploma_Status_History dsh
                WHERE dsh.Diploma_ID = NEW.Diploma_ID
                  AND dsh.New_Status_ID = 4
                  AND dsh.Change_Date = (
                      SELECT MAX(dsh_inner.Change_Date)
                      FROM Diploma_Status_History dsh_inner
                      WHERE dsh_inner.Diploma_ID = NEW.Diploma_ID
                  )
            ) THEN
                RAISE EXCEPTION 'Ημερομηνία εξέτασης μπορεί να τροποποιηθεί μόνο εφόσον η διπλωματική είναι σε κατάσταση υποεξέταση.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_exam_date_rules
BEFORE INSERT OR UPDATE ON Diploma
FOR EACH ROW
EXECUTE FUNCTION ensure_exam_date_rules();




-- Επιτρέπεται να εισάγεις στοιχεία στο πίνακα Cancel_Information μόνο εφόσον η διπλωματική είναι στη κατάσταση 3
CREATE OR REPLACE FUNCTION validate_cancel_information_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Έλεγχος αν η διπλωματική είναι σε κατάσταση Active (ID 3)
    IF NOT EXISTS (
        SELECT 1
        FROM Diploma_Status_History dsh
        WHERE dsh.Diploma_ID = NEW.Canceled_Diploma_ID
          AND dsh.New_Status_ID = 3
    ) THEN
        RAISE EXCEPTION 'Cannot add cancellation details unless the diploma is Active (status ID 3).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_active_status_for_cancellation
BEFORE INSERT ON Cancel_Information
FOR EACH ROW
EXECUTE FUNCTION validate_cancel_information_insert();


--Κατα την εισαγωγή νέας διπλωματικής στο πίνακα Diploma εισάγουμε μια γραμμή και στο πίνακα DSH
CREATE OR REPLACE FUNCTION insert_diploma_status_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Δημιουργία εγγραφής στο Diploma_Status_History με προκαθορισμένα πεδία
    INSERT INTO Diploma_Status_History (Diploma_ID, Previous_Status_ID, New_Status_ID, Change_Date)
    VALUES (NEW.Diploma_ID, 1, 1, CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_insert_diploma_status_history
AFTER INSERT ON Diploma
FOR EACH ROW
EXECUTE FUNCTION insert_diploma_status_history();

--Διαγραφή Διπλωματικής στο πίνακα Diploma διαγράφει κάθε σχετική εγγραφή στο πίνακα DSH
CREATE OR REPLACE FUNCTION delete_diploma_status_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Διαγραφή όλων των εγγραφών από το Diploma_Status_History που συνδέονται με το διαγραφόμενο Diploma
    DELETE FROM Diploma_Status_History WHERE Diploma_ID = OLD.Diploma_ID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_diploma_status_history
AFTER DELETE ON Diploma
FOR EACH ROW
EXECUTE FUNCTION delete_diploma_status_history();