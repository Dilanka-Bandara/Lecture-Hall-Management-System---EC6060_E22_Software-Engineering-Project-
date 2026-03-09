const db = require('../../config/db');
const Notify = require('../../utils/notificationManager'); 

const getTimetableForStudent = async (studentId) => {
  return await db('timetables as t')
    .join('subjects as s', 't.subject_id', 's.id')
    .join('lecture_halls as h', 't.hall_id', 'h.id')
    .join('users as l', 't.lecturer_id', 'l.id')
    .whereIn('t.subject_id', function() {
      this.select('subject_id').from('student_subjects').where('student_id', studentId);
    })
    .select(
      't.id as timetable_id', 't.date', 't.start_time', 't.end_time',
      's.subject_code', 's.subject_name', 'h.name as hall_name', 'l.name as lecturer_name'
    )
    .orderBy('t.date', 'asc').orderBy('t.start_time', 'asc');
};

const getTimetableForLecturer = async (lecturerId) => {
  return await db('timetables as t')
    .join('subjects as s', 't.subject_id', 's.id')
    .join('lecture_halls as h', 't.hall_id', 'h.id')
    .where('t.lecturer_id', lecturerId)
    .select(
      't.id as timetable_id', 't.date', 't.start_time', 't.end_time',
      's.subject_code', 's.subject_name', 'h.name as hall_name'
    )
    .orderBy('t.date', 'asc');
};

const getStudentsForAttendance = async (timetableId) => {
  const classInfo = await db('timetables').where('id', timetableId).first();
  if (!classInfo) throw new Error('Class schedule not found');

  return await db('student_subjects as ss')
    .join('users as u', 'ss.student_id', 'u.id')
    .where('ss.subject_id', classInfo.subject_id)
    .select('u.id as student_id', 'u.name', 'u.university_id');
};

const submitAttendance = async (timetableId, attendanceData) => {
  const recordsToInsert = attendanceData.map(record => ({
    timetable_id: timetableId, student_id: record.student_id, is_present: record.is_present
  }));

  await db('attendance').insert(recordsToInsert).onConflict(['timetable_id', 'student_id']).merge();
  
  const classInfo = await db('timetables as t')
    .join('subjects as s', 't.subject_id', 's.id')
    .where('t.id', timetableId)
    .select('s.subject_code', 't.date').first();
    
  const formattedDate = new Date(classInfo.date).toLocaleDateString('en-US');

  attendanceData.forEach(async (record) => {
    if (record.is_present) {
      await Notify.sendToUser(record.student_id, 'Attendance Marked', `You were marked PRESENT for ${classInfo.subject_code} on ${formattedDate}.`);
    } else {
      await Notify.sendToUser(record.student_id, 'Absence Warning', `WARNING: You were marked ABSENT for ${classInfo.subject_code} on ${formattedDate}.`);
    }
  });

  return { success: true, message: 'Attendance successfully recorded' };
};

const getAllSchedules = async () => {
  return await db('timetables as t')
    .join('subjects as s', 't.subject_id', 's.id')
    .join('lecture_halls as h', 't.hall_id', 'h.id')
    .join('users as l', 't.lecturer_id', 'l.id')
    .select(
      't.id', 't.date', 't.start_time', 't.end_time',
      's.subject_code', 's.subject_name', 'h.name as hall_name', 'l.name as lecturer_name'
    )
    .orderBy('t.date', 'asc').orderBy('t.start_time', 'asc');
};

const createSchedule = async (scheduleData) => {
  const [newId] = await db('timetables').insert(scheduleData);
  const subject = await db('subjects').where({ id: scheduleData.subject_id }).first();
  
  await Notify.sendToUser(
    scheduleData.lecturer_id,
    'New Class Assigned',
    `You have been assigned to teach ${subject.subject_code} on ${scheduleData.date} at ${scheduleData.start_time.slice(0, 5)}.`
  );

  return { id: newId, ...scheduleData };
};

const deleteSchedule = async (id) => {
  const schedule = await db('timetables as t')
    .join('subjects as s', 't.subject_id', 's.id')
    .where('t.id', id)
    .select('t.*', 's.subject_code', 's.subject_name').first();

  if (!schedule) throw new Error('Schedule not found');

  await db('timetables').where({ id }).del();

  const formattedDate = new Date(schedule.date).toISOString().split('T')[0];
  const msg = `The lecture for ${schedule.subject_code} on ${formattedDate} at ${schedule.start_time.slice(0, 5)} has been cancelled.`;
  
  await Notify.sendToUser(schedule.lecturer_id, 'Class Cancelled', msg);
  await Notify.sendToEnrolledStudents(schedule.subject_id, 'Class Cancelled', msg);

  return { success: true, message: 'Schedule deleted successfully' };
};

const getStudentAttendanceMetrics = async (studentId) => {
  const records = await db('attendance as a')
    .join('timetables as t', 'a.timetable_id', 't.id')
    .join('subjects as s', 't.subject_id', 's.id')
    .where('a.student_id', studentId)
    .select('s.subject_code', 's.subject_name', 'a.is_present');

  const metrics = {};
  records.forEach(record => {
    if (!metrics[record.subject_code]) {
      metrics[record.subject_code] = { subject_name: record.subject_name, total_classes: 0, attended_classes: 0 };
    }
    metrics[record.subject_code].total_classes += 1;
    if (record.is_present) metrics[record.subject_code].attended_classes += 1;
  });

  return Object.keys(metrics).map(code => {
    const data = metrics[code];
    return {
      subject_code: code, subject_name: data.subject_name, total_classes: data.total_classes,
      attended_classes: data.attended_classes, percentage: data.total_classes === 0 ? 0 : Math.round((data.attended_classes / data.total_classes) * 100)
    };
  });
};

const createRecurringSchedule = async (scheduleData) => {
  const { subject_id, lecturer_id, hall_id, start_time, end_time, day_of_week, start_date, end_date, target_batch } = scheduleData;
  let currentDate = new Date(start_date);
  const endDateObj = new Date(end_date);
  const recordsToInsert = [];

  while (currentDate <= endDateObj) {
    if (currentDate.getDay() === parseInt(day_of_week)) {
      recordsToInsert.push({ date: currentDate.toISOString().split('T')[0], start_time, end_time, subject_id, hall_id, lecturer_id });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (recordsToInsert.length === 0) throw new Error("No dates match.");

  await db('timetables').insert(recordsToInsert);

  let enrolledCount = 0;
  const subject = await db('subjects').where({ id: subject_id }).first();

  if (target_batch) {
    const students = await db('users').where({ role: 'student', batch: target_batch }).select('id');
    if (students.length > 0) {
      const enrollmentRecords = students.map(student => ({ student_id: student.id, subject_id: subject_id }));
      await db('student_subjects').insert(enrollmentRecords).onConflict(['student_id', 'subject_id']).ignore();
      enrolledCount = students.length;

      await Notify.sendToEnrolledStudents(
        subject_id, 'New Semester Schedule', `Your batch has been enrolled in ${subject.subject_code}.`
      );
    }
  }
  
  await Notify.sendToUser(
    lecturer_id, 'New Recurring Schedule Assigned', `You have been assigned to teach ${subject.subject_code} for the ${target_batch || 'selected'} batch.`
  );

  return { success: true, message: `Generated ${recordsToInsert.length} classes.` };
};

module.exports = {
  getTimetableForStudent, getTimetableForLecturer, getStudentsForAttendance, submitAttendance,
  getAllSchedules, createSchedule, deleteSchedule, getStudentAttendanceMetrics, createRecurringSchedule
};