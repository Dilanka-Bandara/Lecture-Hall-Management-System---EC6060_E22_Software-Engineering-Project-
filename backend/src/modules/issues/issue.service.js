const db = require('../../config/db');

const reportIssue = async (issueData) => {
  const [newIssueId] = await db('issues').insert(issueData);
  return { id: newIssueId, ...issueData };
};

const getAllIssues = async () => {
  return await db('issues as i')
    .join('lecture_halls as h', 'i.hall_id', 'h.id')
    .join('users as u', 'i.reported_by', 'u.id')
    .select('i.id', 'h.name as hall', 'u.name as reporter', 'i.equipment_type', 'i.description', 'i.status', 'i.created_at')
    .orderBy('i.created_at', 'desc');
};

const updateIssueStatus = async (issueId, status) => {
  await db('issues').where({ id: issueId }).update({ status });
  return { success: true, message: `Issue marked as ${status}.` };
};

module.exports = { reportIssue, getAllIssues, updateIssueStatus };