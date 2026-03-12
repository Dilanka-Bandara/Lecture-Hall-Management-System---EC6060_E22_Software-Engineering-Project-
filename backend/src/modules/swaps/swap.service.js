const db = require('../../config/db');

const createSwapRequest = async (requestData) => {
  const [newRequestId] = await db('swap_requests').insert(requestData);

  // NEW: Get the requester's name to personalize the notification
  const requester = await db('users').where({ id: requestData.requesting_lecturer_id }).first();

  // NEW: Notify the Target Lecturer immediately
  await db('notifications').insert({
    user_id: requestData.target_lecturer_id,
    title: 'New Swap Request',
    message: `${requester.name} has requested to swap a lecture with you on ${requestData.proposed_date}. Please review in your pending requests.`
  });

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
  return await db('swap_requests as sr')
    .join('timetables as t', 'sr.timetable_id', 't.id')
    .join('subjects as s', 't.subject_id', 's.id')
    .where({ target_lecturer_status: 'accepted', hod_status: 'pending' })
    .select('sr.id as swap_id', 's.subject_name', 'sr.proposed_date', 'sr.proposed_start_time');
};

const updateSwapStatus = async (swapId, role, status) => {
  const updateData = role === 'hod' ? { hod_status: status } : { target_lecturer_status: status };
  await db('swap_requests').where({ id: swapId }).update(updateData);

  // NEW: Fetch full swap details needed for the notification text
  const swapDetails = await db('swap_requests as sr')
    .join('timetables as t', 'sr.timetable_id', 't.id')
    .join('subjects as s', 't.subject_id', 's.id')
    .where('sr.id', swapId)
    .select('sr.*', 's.subject_code')
    .first(); 

  // --- NEW NOTIFICATION LOGIC ---

  // 1. If Target Lecturer Responds: Notify the Original Requester
  if (role === 'lecturer') {
    const action = status === 'accepted' ? 'accepted' : 'rejected';
    const nextStep = status === 'accepted' ? ' It is now awaiting final HOD approval.' : '';

    await db('notifications').insert({
      user_id: swapDetails.requesting_lecturer_id,
      title: `Swap Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
      message: `Your swap request for ${swapDetails.subject_code} on ${swapDetails.proposed_date} was ${action} by the target lecturer.${nextStep}`
    });
  }

  // 2. If HOD Responds: Notify BOTH Lecturers
  if (role === 'hod') {
    const isApproved = status === 'accepted';
    const title = isApproved ? 'Swap Approved by HOD' : 'Swap Rejected by HOD';
    const message = isApproved
      ? `The HOD has APPROVED the swap for ${swapDetails.subject_code} on ${swapDetails.proposed_date}. The timetable is now updated.`
      : `The HOD has REJECTED the swap for ${swapDetails.subject_code} on ${swapDetails.proposed_date}.`;

    // Notify both the requesting and target lecturers simultaneously
    await db('notifications').insert([
      { user_id: swapDetails.requesting_lecturer_id, title, message },
      { user_id: swapDetails.target_lecturer_id, title, message }
    ]);

    // Original logic: Update Timetable and Notify Students if approved
    if (isApproved) {
      await db('timetables').where({ id: swapDetails.timetable_id }).update({
        date: swapDetails.proposed_date,
        start_time: swapDetails.proposed_start_time,
        end_time: swapDetails.proposed_end_time,
        hall_id: swapDetails.proposed_hall_id,
        lecturer_id: swapDetails.target_lecturer_id
      });

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
  }

  return { success: true, message: `Swap request ${status} successfully.` };
};

module.exports = { createSwapRequest, getPendingSwapsForLecturer, getPendingSwapsForHOD, updateSwapStatus };