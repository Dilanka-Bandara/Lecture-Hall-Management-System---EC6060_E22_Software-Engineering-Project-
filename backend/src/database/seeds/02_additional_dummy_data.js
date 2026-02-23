const bcrypt = require('bcryptjs'); 

exports.seed = async function(knex) {
  console.log("Generating additional dummy students...");

  // 1. Setup the Batches and Password
  const defaultPassword = await bcrypt.hash('password123', 10);
  const newStudents = [];
  const batches = [
    { year: 'Year 4', prefix: '2022E' },
    { year: 'Year 3', prefix: '2023E' },
    { year: 'Year 2', prefix: '2024E' },
    { year: 'Year 1', prefix: '2025E' },
  ];

  // 2. Generate 10 students per batch (40 total new students)
  let globalCounter = 1;
  for (const batch of batches) {
    for (let i = 1; i <= 10; i++) {
      // Formats as 2022E001, 2022E002, etc.
      const regNumber = `${batch.prefix}${i.toString().padStart(3, '0')}`;
      
      newStudents.push({
        name: `Test Student ${globalCounter}`,
        email: `student${globalCounter}@lectro.com`,
        password_hash: defaultPassword, // <--- CHANGED THIS FROM 'password' TO 'password_hash'
        role: 'student',
        university_id: regNumber,
        batch: batch.year
      });
      globalCounter++;
    }
  }

  // 3. Insert Students safely
  const existingStudents = await knex('users').where('role', 'student').select('university_id');
  const existingIds = existingStudents.map(s => s.university_id);
  const studentsToInsert = newStudents.filter(s => !existingIds.includes(s.university_id));

  if (studentsToInsert.length > 0) {
    await knex('users').insert(studentsToInsert);
    console.log(`Successfully added ${studentsToInsert.length} new students.`);
  } else {
    console.log("Dummy students already exist. Skipping creation.");
  }

  // 4. Create balanced, shuffled enrollments for EVERY subject
  console.log("Shuffling and balancing subject enrollments...");
  
  const allStudents = await knex('users').where('role', 'student').select('id');
  const allSubjects = await knex('subjects').select('id');
  const enrollmentsToInsert = [];

  for (const subject of allSubjects) {
    // Randomly shuffle the entire student array
    const shuffledStudents = [...allStudents].sort(() => 0.5 - Math.random());
    
    // Pick 5 random students for this specific subject
    const selectedStudents = shuffledStudents.slice(0, 5);

    for (const student of selectedStudents) {
      enrollmentsToInsert.push({
        student_id: student.id,
        subject_id: subject.id
      });
    }
  }

  // 5. Insert enrollments ignoring conflicts
  if (enrollmentsToInsert.length > 0) {
    await knex('student_subjects')
      .insert(enrollmentsToInsert)
      .onConflict(['student_id', 'subject_id'])
      .ignore();
      
    console.log("Subject enrollments successfully balanced! Every subject now has random students.");
  }
};