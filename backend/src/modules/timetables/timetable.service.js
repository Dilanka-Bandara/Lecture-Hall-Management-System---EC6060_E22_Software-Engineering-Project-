const db = require('../../config/db');

// Fetch upcoming classes specifically for a student
const getTimetableForStudent = async (studentId) => {
  return await db('timetables as t')
    .join('subjects as s', 't.subject_id', 's.id')
    .join('lecture_halls as h', 't.hall_id', 'h.id')
    .join('users as l', 't.lecturer_id', 'l.id')
    // Find subjects this specific student is enrolled in
    .whereIn('t.subject_id', function() {
      this.select('subject_id').from('student_subjects').where('student_id', studentId);
    })
    .select(
      't.id as timetable_id',
      't.date',
      't.start_time',
      't.end_time',
      's.subject_code',
      's.subject_name',
      'h.name as hall_name',
      'l.name as lecturer_name'
    )
    .orderBy('t.date', 'asc')
    .orderBy('t.start_time', 'asc');
};

// Fetch upcoming classes specifically for a lecturer
const getTimetableForLecturer = async (lecturerId) => {
  return await db('timetables as t')
    .join('subjects as s', 't.subject_id', 's.id')
    .join('lecture_halls as h', 't.hall_id', 'h.id')
    .where('t.lecturer_id', lecturerId)
    .select(
      't.id as timetable_id',
      't.date',
      't.start_time',
      't.end_time',
      's.subject_code',
      's.subject_name',
      'h.name as hall_name'
    )
    .orderBy('t.date', 'asc');
};

// For the HOD: Get all students registered for a specific timetable class
const getStudentsForAttendance = async (timetableId) => {
  // First, find which subject this timetable entry is for
  const classInfo = await db('timetables').where('id', timetableId).first();
  if (!classInfo) throw new Error('Class schedule not found');

  // Then, get all students enrolled in that subject
  return await db('student_subjects as ss')
    .join('users as u', 'ss.student_id', 'u.id')
    .where('ss.subject_id', classInfo.subject_id)
    .select('u.id as student_id', 'u.name', 'u.university_id');
};

// For the HOD: Submit attendance records
const submitAttendance = async (timetableId, attendanceData) => {
  // attendanceData should be an array like: [{ student_id: 2, is_present: true }, ...]
  
  // Format the data for a bulk insert
  const recordsToInsert = attendanceData.map(record => ({
    timetable_id: timetableId,
    student_id: record.student_id,
    is_present: record.is_present
  }));

  // Insert records. If a record already exists, we ignore it (or you could use .onConflict().merge() to update it)
  await db('attendance').insert(recordsToInsert).onConflict(['timetable_id', 'student_id']).merge();
  
  return { success: true, message: 'Attendance successfully recorded' };
};

module.exports = {
  getTimetableForStudent,
  getTimetableForLecturer,
  getStudentsForAttendance,
  submitAttendance
};