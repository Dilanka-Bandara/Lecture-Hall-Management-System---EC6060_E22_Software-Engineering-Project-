const timetableService = require('./timetable.service');

const getMyTimetable = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let timetable;

    // Dynamically fetch the right data based on who is logged in
    if (userRole === 'student') {
      timetable = await timetableService.getTimetableForStudent(userId);
    } else if (userRole === 'lecturer') {
      timetable = await timetableService.getTimetableForLecturer(userId);
    } else {
      return res.status(403).json({ message: 'Role not authorized to view personal timetables' });
    }

    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
};

const getStudentsForClass = async (req, res) => {
  try {
    const { timetableId } = req.params;
    const students = await timetableService.getStudentsForAttendance(timetableId);
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { timetableId } = req.params;
    const { attendanceRecords } = req.body; 

    const result = await timetableService.submitAttendance(timetableId, attendanceRecords);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting attendance', error: error.message });
  }
};

// --- NEW HOD CONTROLLERS ---

const getDepartmentSchedules = async (req, res) => {
  try {
    const schedules = await timetableService.getAllSchedules();
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addSchedule = async (req, res) => {
  try {
    const newSchedule = await timetableService.createSchedule(req.body);
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create schedule. Check if IDs exist.' });
  }
};

const removeSchedule = async (req, res) => {
  try {
    const result = await timetableService.deleteSchedule(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const metrics = await timetableService.getStudentAttendanceMetrics(req.user.id);
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this near your other HOD controllers

const addRecurringSchedule = async (req, res) => {
  try {
    const result = await timetableService.createRecurringSchedule(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to generate recurring schedule. Check inputs.' });
  }
};

// Update your module.exports to include getMyAttendance!

// Update exports
module.exports = { 
  getMyTimetable, 
  getStudentsForClass, 
  markAttendance,
  getDepartmentSchedules,
  addSchedule,
  removeSchedule,
  getMyAttendance,
  addRecurringSchedule

};

