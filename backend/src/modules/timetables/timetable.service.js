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

// --- NEW HOD FUNCTIONS ---

// Fetch all timetables across the whole department
const getAllSchedules = async () => {
  return await db('timetables as t')
    .join('subjects as s', 't.subject_id', 's.id')
    .join('lecture_halls as h', 't.hall_id', 'h.id')
    .join('users as l', 't.lecturer_id', 'l.id')
    .select(
      't.id', 't.date', 't.start_time', 't.end_time',
      's.subject_code', 's.subject_name',
      'h.name as hall_name', 'l.name as lecturer_name'
    )
    .orderBy('t.date', 'asc').orderBy('t.start_time', 'asc');
};

// Create a brand new timetable record
const createSchedule = async (scheduleData) => {
  const [newId] = await db('timetables').insert(scheduleData);
  return { id: newId, ...scheduleData };
};

// Delete a timetable record (e.g., class cancelled)
const deleteSchedule = async (id) => {
  await db('timetables').where({ id }).del();
  return { success: true, message: 'Schedule deleted successfully' };
};

// --- NEW STUDENT ATTENDANCE METRICS ---
const getStudentAttendanceMetrics = async (studentId) => {
  // Fetch all attendance records for the student, linked to subject names
  const records = await db('attendance as a')
    .join('timetables as t', 'a.timetable_id', 't.id')
    .join('subjects as s', 't.subject_id', 's.id')
    .where('a.student_id', studentId)
    .select('s.subject_code', 's.subject_name', 'a.is_present');

  // Group the records by subject and calculate the percentages
  const metrics = {};
  records.forEach(record => {
    if (!metrics[record.subject_code]) {
      metrics[record.subject_code] = {
        subject_name: record.subject_name,
        total_classes: 0,
        attended_classes: 0
      };
    }
    metrics[record.subject_code].total_classes += 1;
    if (record.is_present) {
      metrics[record.subject_code].attended_classes += 1;
    }
  });

  // Convert to a clean array for the frontend
  return Object.keys(metrics).map(code => {
    const data = metrics[code];
    const percentage = data.total_classes === 0 ? 0 : Math.round((data.attended_classes / data.total_classes) * 100);
    return {
      subject_code: code,
      subject_name: data.subject_name,
      total_classes: data.total_classes,
      attended_classes: data.attended_classes,
      percentage: percentage
    };
  });
};

module.exports = {
  getTimetableForStudent,
  getTimetableForLecturer,
  getStudentsForAttendance,
  submitAttendance,
  getAllSchedules,
  createSchedule,
  deleteSchedule,
  getStudentAttendanceMetrics
};