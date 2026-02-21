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

// --- NEW HOD ROUTES ---

// HOD views all schedules
router.get('/department/all', verifyToken, authorizeRoles('hod', 'admin'), timetableController.getDepartmentSchedules);

// HOD creates a new schedule
router.post('/department/new', verifyToken, authorizeRoles('hod', 'admin'), timetableController.addSchedule);

// HOD deletes a schedule
router.delete('/department/:id', verifyToken, authorizeRoles('hod', 'admin'), timetableController.removeSchedule);

// GET /api/timetables/my-attendance
router.get(
  '/my-attendance', 
  verifyToken, 
  authorizeRoles('student'), 
  timetableController.getMyAttendance
);



module.exports = router;