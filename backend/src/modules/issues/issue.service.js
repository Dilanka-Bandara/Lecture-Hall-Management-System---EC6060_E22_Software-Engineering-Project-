const db = require('../../config/db');
const Notify = require('../../utils/notificationManager');

const reportIssue = async (issueData) => {
  const [newIssueId] = await db('issues').insert(issueData);
  
  const hall = await db('lecture_halls').where({ id: issueData.hall_id }).first();

  await Notify.sendToRole(
    'technical_officer',
    'New Hardware Issue',
    `A new issue regarding ${issueData.equipment_type} has been reported in ${hall.name}.`
  );

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
  const issue = await db('issues').where({ id: issueId }).first();
  if (!issue) throw new Error('Issue not found');

  await db('issues').where({ id: issueId }).update({ status });

  if (status === 'permanently_fixed' || status === 'temporarily_solved') {
    const hall = await db('lecture_halls').where({ id: issue.hall_id }).first();
    const actionText = status === 'permanently_fixed' ? 'resolved and is ready for use' : 'temporarily fixed (please check before use)';
    
    await Notify.sendToUser(
      issue.reported_by,
      'Equipment Issue Update',
      `The ${issue.equipment_type} issue you reported in ${hall.name} has been ${actionText}.`
    );
  }

  return { success: true, message: `Issue marked as ${status}.` };
};

module.exports = { reportIssue, getAllIssues, updateIssueStatus };