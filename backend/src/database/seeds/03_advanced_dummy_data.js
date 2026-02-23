const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  console.log("Generating Advanced Dummy Data for ALL Years...");

  const defaultPassword = await bcrypt.hash('password123', 10);
  
  // 1. Generate Students (10 per year)
  const batches = [
    { year: 'Year 4', prefix: '2022E' },
    { year: 'Year 3', prefix: '2023E' },
    { year: 'Year 2', prefix: '2024E' },
    { year: 'Year 1', prefix: '2025E' },
  ];

  const newStudents = [];
  let globalCounter = 1;
  
  for (const batch of batches) {
    for (let i = 1; i <= 10; i++) {
      const regNumber = `${batch.prefix}${i.toString().padStart(3, '0')}`;
      newStudents.push({
        name: `${batch.year} Student ${i}`,
        email: `student${globalCounter}@lectro.com`,
        password_hash: defaultPassword,
        role: 'student',
        university_id: regNumber,
        batch: batch.year
      });
      globalCounter++;
    }
  }

  // Insert students safely
  const existingStudents = await knex('users').where('role', 'student').select('university_id');
  const existingIds = existingStudents.map(s => s.university_id);
  const studentsToInsert = newStudents.filter(s => !existingIds.includes(s.university_id));

  if (studentsToInsert.length > 0) {
    await knex('users').insert(studentsToInsert);
    console.log(`Added ${studentsToInsert.length} new students across 1st, 2nd, 3rd, and 4th years.`);
  }

  // 2. Create Specific Subjects for Each Year
  const newSubjects = [
    { subject_code: 'ENG101', subject_name: 'Basic Electronics (Year 1)' },
    { subject_code: 'MAT102', subject_name: 'Engineering Math I (Year 1)' },
    { subject_code: 'CS203', subject_name: 'Object Oriented Programming (Year 2)' },
    { subject_code: 'EE204', subject_name: 'Digital Design (Year 2)' },
    { subject_code: 'CS306', subject_name: 'Operating Systems (Year 3)' },
    { subject_code: 'CS307', subject_name: 'Computer Networks (Year 3)' },
    { subject_code: 'CS401', subject_name: 'Machine Learning (Year 4)' },
    { subject_code: 'CS402', subject_name: 'Software Project (Year 4)' },
  ];

  const existingSubjects = await knex('subjects').select('subject_code');
  const existingSubjectCodes = existingSubjects.map(s => s.subject_code);
  
  const subjectsToInsert = newSubjects.filter(s => !existingSubjectCodes.includes(s.subject_code));

  if (subjectsToInsert.length > 0) {
    await knex('subjects').insert(subjectsToInsert);
    console.log(`Added ${subjectsToInsert.length} new Year-specific subjects.`);
  }

  // 3. Enroll Students correctly by their Year
  console.log("Enrolling 1st, 2nd, 3rd, and 4th year students into their matching subjects...");
  const allDBStudents = await knex('users').where('role', 'student').select('id', 'batch');
  const allDBSubjects = await knex('subjects').select('id', 'subject_name');

  const enrollmentsToInsert = [];

  for (const student of allDBStudents) {
    // Find subjects that match this student's exact year string (e.g. "Year 1")
    const matchingSubjects = allDBSubjects.filter(sub => sub.subject_name.includes(student.batch));
    
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
      .onConflict(['student_id', 'subject_id'])
      .ignore();
    console.log(`Successfully mapped all students to their corresponding subjects!`);
  }
  
  // 4. Create Active Timetables so the dashboards aren't empty!
  const today = new Date();
  const lecturers = await knex('users').where('role', 'lecturer').select('id');
  const halls = await knex('lecture_halls').select('id');
  
  if (lecturers.length > 0 && halls.length > 0) {
    let dayOffset = 0;
    let timeOffset = 8; // Start at 8 AM

    for (const subject of allDBSubjects) {
      if (subject.subject_name.includes('Year')) {
        const lectureDate = new Date(today);
        lectureDate.setDate(today.getDate() + dayOffset);
        
        const startTime = `${timeOffset.toString().padStart(2, '0')}:00:00`;
        const endTime = `${(timeOffset + 2).toString().padStart(2, '0')}:00:00`;

        const tRecord = {
          date: lectureDate.toISOString().split('T')[0],
          start_time: startTime,
          end_time: endTime,
          subject_id: subject.id,
          hall_id: halls[dayOffset % halls.length].id,
          lecturer_id: lecturers[dayOffset % lecturers.length].id
        };
        
        // Ensure we don't accidentally insert the exact same class twice
        const exists = await knex('timetables').where({ date: tRecord.date, subject_id: tRecord.subject_id }).first();
        if (!exists) {
           await knex('timetables').insert(tRecord);
        }
        
        // Stagger the times and days so they look realistic on the schedule
        timeOffset += 2;
        if (timeOffset > 16) {
          timeOffset = 8;
          dayOffset++;
        }
      }
    }
    console.log("Successfully generated active classes for all Years!");
  }
};