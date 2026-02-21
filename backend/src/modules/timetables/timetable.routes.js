const express = require('express');
const router = express.Router();
const timetableController = require('./timetable.controller');
const { verifyToken, authorizeRoles } = require('../../middlewares/auth.middleware');

// GET /api/timetables/my-schedule 
// Accessible by both students and lecturers (the controller figures out which one)
router.get(
  '/my-schedule', 
  verifyToken, 
  authorizeRoles('student', 'lecturer'), 
  timetableController.getMyTimetable
);

// GET /api/timetables/:timetableId/students
// ONLY accessible by the HOD to get the roster before marking attendance
router.get(
  '/:timetableId/students',
  verifyToken,
  authorizeRoles('hod'),
  timetableController.getStudentsForClass
);

// POST /api/timetables/:timetableId/attendance
// ONLY accessible by the HOD to submit the attendance
router.post(
  '/:timetableId/attendance',
  verifyToken,
  authorizeRoles('hod'),
  timetableController.markAttendance
);

module.exports = router;