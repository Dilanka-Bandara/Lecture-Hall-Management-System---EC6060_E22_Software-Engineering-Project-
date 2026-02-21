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

module.exports = { getMyTimetable, getStudentsForClass, markAttendance };