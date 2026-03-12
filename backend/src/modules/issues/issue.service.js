const db = require('../../config/db');

const reportIssue = async (issueData) => {
  const [newIssueId] = await db('issues').insert(issueData);
  return { id: newIssueId, ...issueData };
};

const getAllIssues = async () => {
  return await db('issues as i')
    .join('lecture_halls as h', 'i.hall_id', 'h.id')
    .join('users as u', 'i.reported_by', 'u.id')
    .select(
      'i.id as id', 
      'h.name as hall', 
      'u.name as reporter', 
      'i.equipment_type', 
      'i.description', 
      'i.status', 
      'i.created_at'
    )
    .orderBy('i.created_at', 'desc');
};

const updateIssueStatus = async (issueId, status) => {
  // 1. Get the issue details to find out who reported it and where it is
  const issue = await db('issues').where({ id: issueId }).first();
  if (!issue) throw new Error('Issue not found');

  // 2. Update the status in the database
  await db('issues').where({ id: issueId }).update({ status });

  // 3. NEW: Automatically notify the lecturer if the issue is resolved or temporarily fixed
  if (status === 'permanently_fixed' || status === 'temporarily_solved') {
    const hall = await db('lecture_halls').where({ id: issue.hall_id }).first();
    const actionText = status === 'permanently_fixed' ? 'resolved and is ready for use' : 'temporarily fixed (please check before use)';

    await db('notifications').insert({
      user_id: issue.reported_by, // Send it to the exact lecturer who reported it
      title: 'Equipment Issue Update',
      message: `The ${issue.equipment_type} issue you reported in ${hall.name} has been ${actionText}.`
    });
  }

  return { success: true, message: `Issue marked as ${status}.` };
};

module.exports = { reportIssue, getAllIssues, updateIssueStatus };