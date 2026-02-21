const issueService = require('./issue.service');

const reportNewIssue = async (req, res) => {
  try {
    const issueData = { ...req.body, reported_by: req.user.id };
    const result = await issueService.reportIssue(issueData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const viewIssues = async (req, res) => {
  try {
    const issues = await issueService.getAllIssues();
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;
    const result = await issueService.updateIssueStatus(issueId, status);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { reportNewIssue, viewIssues, changeStatus };