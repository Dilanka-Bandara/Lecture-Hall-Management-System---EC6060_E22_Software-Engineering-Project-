const express = require('express');
const router = express.Router();
const issueController = require('./issue.controller');
const { verifyToken, authorizeRoles } = require('../../middlewares/auth.middleware');

// Lecturers report issues
router.post('/', verifyToken, authorizeRoles('lecturer'), issueController.reportNewIssue);

// TOs and HODs can view all issues
router.get('/', verifyToken, authorizeRoles('technical_officer', 'hod'), issueController.viewIssues);

// TOs update the status of the issue
router.patch('/:issueId/status', verifyToken, authorizeRoles('technical_officer'), issueController.changeStatus);

module.exports = router;