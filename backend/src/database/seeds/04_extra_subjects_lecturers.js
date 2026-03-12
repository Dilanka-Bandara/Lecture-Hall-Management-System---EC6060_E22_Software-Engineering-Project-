const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  console.log("Generating Extra Lecturers and Subjects...");

  // Setup default password for all new accounts
  const defaultPassword = await bcrypt.hash('password123', 10);

  // --- 1. GENERATE NEW LECTURERS ---
  const newLecturers = [
    { name: 'Dr. Emily Chen', email: 'emily.chen@lectro.edu', university_id: 'LEC-003', role: 'lecturer', password_hash: defaultPassword },
    { name: 'Prof. Michael Brown', email: 'michael.b@lectro.edu', university_id: 'LEC-004', role: 'lecturer', password_hash: defaultPassword },
    { name: 'Dr. Sarah Connor', email: 'sarah.c@lectro.edu', university_id: 'LEC-005', role: 'lecturer', password_hash: defaultPassword },
    { name: 'Prof. David Kim', email: 'david.k@lectro.edu', university_id: 'LEC-006', role: 'lecturer', password_hash: defaultPassword },
    { name: 'Dr. Robert Silva', email: 'robert.s@lectro.edu', university_id: 'LEC-007', role: 'lecturer', password_hash: defaultPassword }
  ];

  // Insert safely (skipping any that already exist)
  const existingLecturers = await knex('users').where('role', 'lecturer').select('university_id');
  const existingLecturerIds = existingLecturers.map(u => u.university_id);
  const lecturersToInsert = newLecturers.filter(l => !existingLecturerIds.includes(l.university_id));

  if (lecturersToInsert.length > 0) {
    await knex('users').insert(lecturersToInsert);
    console.log(`Added ${lecturersToInsert.length} new academic staff members.`);
  }

  // --- 2. GENERATE NEW SUBJECTS ---
  const newSubjects = [
    { subject_code: 'PHY101', subject_name: 'Physics for Engineers (Year 1)' },
    { subject_code: 'CS105', subject_name: 'Programming Fundamentals (Year 1)' },
    { subject_code: 'CS210', subject_name: 'Database Management Systems (Year 2)' },
    { subject_code: 'EE205', subject_name: 'Computer Architecture (Year 2)' },
    { subject_code: 'SE301', subject_name: 'Software Engineering Methods (Year 3)' },
    { subject_code: 'CS315', subject_name: 'Artificial Intelligence (Year 3)' },
    { subject_code: 'CS410', subject_name: 'Cloud Computing (Year 4)' },
    { subject_code: 'SE405', subject_name: 'Cyber Security (Year 4)' },
  ];

  // Insert safely (skipping any that already exist)
  const existingSubjects = await knex('subjects').select('subject_code');
  const existingSubCodes = existingSubjects.map(s => s.subject_code);
  const subjectsToInsert = newSubjects.filter(s => !existingSubCodes.includes(s.subject_code));

  if (subjectsToInsert.length > 0) {
    await knex('subjects').insert(subjectsToInsert);
    console.log(`Added ${subjectsToInsert.length} new course modules.`);
  }

  // --- 3. AUTO-ENROLL STUDENTS IN THE NEW SUBJECTS ---
  console.log("Enrolling students into their respective new subjects...");
  const allStudents = await knex('users').where('role', 'student').select('id', 'batch');
  const allSubjects = await knex('subjects').select('id', 'subject_name');

  const enrollmentsToInsert = [];

  for (const student of allStudents) {
    // Dynamically match students to subjects based on the "Year X" tag
    const matchingSubjects = allSubjects.filter(sub => sub.subject_name.includes(student.batch));

    for (const subject of matchingSubjects) {
      enrollmentsToInsert.push({
        student_id: student.id,
        subject_id: subject.id
      });
    }
  }

  if (enrollmentsToInsert.length > 0) {
    await knex('student_subjects')
      .insert(enrollmentsToInsert)
      .onConflict(['student_id', 'subject_id']) // Ignore duplicates if already enrolled
      .ignore();
    console.log("Student enrollments successfully updated!");
  }
};