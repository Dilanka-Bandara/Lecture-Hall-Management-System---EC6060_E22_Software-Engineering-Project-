const db = require('../../config/db');

const createSwapRequest = async (requestData) => {
  const [newRequestId] = await db('swap_requests').insert(requestData);
  return { id: newRequestId, ...requestData };
};

const getPendingSwapsForLecturer = async (lecturerId) => {
  return await db('swap_requests as sr')
    .join('timetables as t', 'sr.timetable_id', 't.id')
    .join('subjects as s', 't.subject_id', 's.id')
    .join('users as requester', 'sr.requesting_lecturer_id', 'requester.id')
    .where({ target_lecturer_id: lecturerId, target_lecturer_status: 'pending' })
    .select(
      'sr.id as swap_id',
      'requester.name as requesting_lecturer',
      's.subject_name',
      't.date as original_date',
      't.start_time as original_start',
      'sr.proposed_date',
      'sr.proposed_start_time',
      'sr.proposed_end_time'
    );
};

const getPendingSwapsForHOD = async () => {
  // HODs only see requests that the target lecturer has already accepted
  return await db('swap_requests as sr')
    .join('timetables as t', 'sr.timetable_id', 't.id')
    .join('subjects as s', 't.subject_id', 's.id')
    .where({ target_lecturer_status: 'accepted', hod_status: 'pending' })
    .select('sr.id as swap_id', 's.subject_name', 'sr.proposed_date', 'sr.proposed_start_time');
};

const updateSwapStatus = async (swapId, role, status) => {
  const updateData = role === 'hod' ? { hod_status: status } : { target_lecturer_status: status };
  
  await db('swap_requests').where({ id: swapId }).update(updateData);

  // If HOD just approved it, we need to actually move the class in the timetable
  if (role === 'hod' && status === 'accepted') {
    const swapDetails = await db('swap_requests').where({ id: swapId }).first();
    
    // 1. Update the Timetable
    await db('timetables').where({ id: swapDetails.timetable_id }).update({
      date: swapDetails.proposed_date,
      start_time: swapDetails.proposed_start_time,
      end_time: swapDetails.proposed_end_time,
      hall_id: swapDetails.proposed_hall_id,
      lecturer_id: swapDetails.target_lecturer_id
    });

    // 2. Notify the Students (Find students taking this subject and notify them)
    const classInfo = await db('timetables').where({ id: swapDetails.timetable_id }).first();
    const students = await db('student_subjects').where({ subject_id: classInfo.subject_id });
    
    const notifications = students.map(student => ({
      user_id: student.student_id,
      title: 'Class Rescheduled',
      message: `Your class has been moved to ${swapDetails.proposed_date} at ${swapDetails.proposed_start_time}.`,
    }));

    if (notifications.length > 0) {
      await db('notifications').insert(notifications);
    }
  }

  return { success: true, message: `Swap request ${status} successfully.` };
};

module.exports = { createSwapRequest, getPendingSwapsForLecturer, getPendingSwapsForHOD, updateSwapStatus };