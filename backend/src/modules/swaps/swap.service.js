const db = require('../../config/db');
const Notify = require('../../utils/notificationManager');

const createSwapRequest = async (requestData) => {
  const [newRequestId] = await db('swap_requests').insert(requestData);

  const requester = await db('users').where({ id: requestData.requesting_lecturer_id }).first();

  await Notify.sendToUser(
    requestData.target_lecturer_id,
    'New Swap Request',
    `${requester.name} has requested to swap a lecture with you on ${requestData.proposed_date}. Please review in your pending requests.`
  );

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

  // BUG FIX: Added t.subject_id to the select array so the student notification doesn't crash later
  const swapDetails = await db('swap_requests as sr')
    .join('timetables as t', 'sr.timetable_id', 't.id')
    .join('subjects as s', 't.subject_id', 's.id')
    .where('sr.id', swapId)
    .select('sr.*', 's.subject_code', 't.subject_id') 
    .first(); 

  // 1. If Target Lecturer Responds
  if (role === 'lecturer') {
    const action = status === 'accepted' ? 'accepted' : 'rejected';
    const nextStep = status === 'accepted' ? ' It is now awaiting final HOD approval.' : '';

    await Notify.sendToUser(
      swapDetails.requesting_lecturer_id,
      `Swap Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
      `Your swap request for ${swapDetails.subject_code} on ${swapDetails.proposed_date} was ${action} by the target lecturer.${nextStep}`
    );

    if (status === 'accepted') {
      await Notify.sendToRole('hod', 'Pending Swap Approval', `A new swap request for ${swapDetails.subject_code} requires your approval.`);
    }
  }

  // 2. If HOD Responds
  if (role === 'hod') {
    const isApproved = status === 'accepted';
    const title = isApproved ? 'Swap Approved by HOD' : 'Swap Rejected by HOD';
    const message = isApproved
      ? `The HOD has APPROVED the swap for ${swapDetails.subject_code} on ${swapDetails.proposed_date}. The timetable is now updated.`
      : `The HOD has REJECTED the swap for ${swapDetails.subject_code} on ${swapDetails.proposed_date}.`;

    await Notify.sendToUser(swapDetails.requesting_lecturer_id, title, message);
    await Notify.sendToUser(swapDetails.target_lecturer_id, title, message);

    if (isApproved) {
      await db('timetables').where({ id: swapDetails.timetable_id }).update({
        date: swapDetails.proposed_date,
        start_time: swapDetails.proposed_start_time,
        end_time: swapDetails.proposed_end_time,
        hall_id: swapDetails.proposed_hall_id,
        lecturer_id: swapDetails.target_lecturer_id
      });

      // BUG FIX: swapDetails.subject_id is now correctly defined
      await Notify.sendToEnrolledStudents(
        swapDetails.subject_id,
        'Class Rescheduled',
        `Your class for ${swapDetails.subject_code} has been moved to ${swapDetails.proposed_date} at ${swapDetails.proposed_start_time.slice(0,5)}.`
      );
    }
  }

  return { success: true, message: `Swap request ${status} successfully.` };
};

module.exports = { createSwapRequest, getPendingSwapsForLecturer, getPendingSwapsForHOD, updateSwapStatus };