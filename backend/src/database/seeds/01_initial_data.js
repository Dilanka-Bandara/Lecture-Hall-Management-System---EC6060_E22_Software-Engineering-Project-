const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // 1. Delete all existing entries to prevent duplicates if you run this twice
  await knex('notifications').del();
  await knex('issues').del();
  await knex('swap_requests').del();
  await knex('attendance').del();
  await knex('timetables').del();
  await knex('student_subjects').del();
  await knex('subjects').del();
  await knex('lecture_halls').del();
  await knex('users').del();

  // Generate a standard password hash for all test accounts ("password123")
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('password123', salt);

  // 2. Insert Users
  await knex('users').insert([
    { id: 1, name: 'System Admin', email: 'admin@lectro.edu', university_id: 'ADM-001', role: 'admin', password_hash },
    { id: 2, name: 'Dr. Sarani', email: 'sarani@hod.edu', university_id: 'HOD-001', role: 'hod', password_hash },
    { id: 3, name: 'Dr. Alan G.', email: 'alan.g@university.edu', university_id: 'LEC-001', role: 'lecturer', password_hash },
    { id: 4, name: 'Dr. Perera', email: 'perera@university.edu', university_id: 'LEC-002', role: 'lecturer', password_hash },
    { id: 5, name: 'Priya S.', email: 'priya@student.edu', university_id: 'STU-001', role: 'student', batch: 'Year 3', password_hash },
    { id: 6, name: 'Kasun T.', email: 'kasun@to.edu', university_id: 'TO-001', role: 'technical_officer', password_hash }
  ]);

  // 3. Insert Lecture Halls
  await knex('lecture_halls').insert([
    { id: 1, name: 'Hall 01 (Main)', capacity: 150, has_projector: true },
    { id: 2, name: 'Hall 03 (Annex)', capacity: 80, has_projector: true },
    { id: 3, name: 'Lab 02', capacity: 40, has_projector: false }
  ]);

  // 4. Insert Subjects
  await knex('subjects').insert([
    { id: 1, subject_code: 'CS201', subject_name: 'Data Structures' },
    { id: 2, subject_code: 'CS202', subject_name: 'Algorithms' },
    { id: 3, subject_code: 'CS305', subject_name: 'Advanced Databases' }
  ]);

  // 5. Enroll Student in Subjects
  await knex('student_subjects').insert([
    { student_id: 5, subject_id: 1 },
    { student_id: 5, subject_id: 2 }
  ]);

  // 6. Create some initial Timetable Schedules for today
  const today = new Date().toISOString().split('T')[0]; // Gets YYYY-MM-DD
  
  await knex('timetables').insert([
    { id: 1, date: today, start_time: '08:00:00', end_time: '10:00:00', subject_id: 1, hall_id: 1, lecturer_id: 3 },
    { id: 2, date: today, start_time: '10:30:00', end_time: '12:30:00', subject_id: 2, hall_id: 2, lecturer_id: 4 }
  ]);
};