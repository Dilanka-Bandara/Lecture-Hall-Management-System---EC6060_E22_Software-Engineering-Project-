const db = require('../config/db');

// Safe import for socket utility to prevent crashes
let socketUtil;
try {
  socketUtil = require('../config/socket');
} catch (error) {
  console.log('Socket utility not found. Real-time features will be bypassed.');
}

const NotificationManager = {
  // Send to a single specific user
  async sendToUser(userId, title, message) {
    try {
      const [notifId] = await db('notifications').insert({ user_id: userId, title, message });
      
      if (socketUtil && socketUtil.notifyUser) {
        socketUtil.notifyUser(userId, { id: notifId, title, message, is_read: 0, created_at: new Date() });
      }
    } catch (error) {
      console.error(`Failed to notify user ${userId}:`, error);
    }
  },

  // Send to all users with a specific role (e.g., 'hod', 'to')
  async sendToRole(role, title, message) {
    try {
      const users = await db('users').where({ role }).select('id');
      if (!users.length) return;

      const notifications = users.map(u => ({ user_id: u.id, title, message }));
      // Safe standard bulk insert
      await db('notifications').insert(notifications);

      if (socketUtil && socketUtil.notifyUser) {
        users.forEach(u => {
          socketUtil.notifyUser(u.id, { title, message, is_read: 0, created_at: new Date() });
        });
      }
    } catch (error) {
      console.error(`Failed to notify role ${role}:`, error);
    }
  },

  // Send to all students currently enrolled in a specific subject
  async sendToEnrolledStudents(subjectId, title, message) {
    try {
      const students = await db('student_subjects').where({ subject_id: subjectId }).select('student_id');
      if (!students.length) return;

      const notifications = students.map(s => ({ user_id: s.student_id, title, message }));
      // Safe standard bulk insert
      await db('notifications').insert(notifications);

      if (socketUtil && socketUtil.notifyUser) {
        students.forEach(s => {
          socketUtil.notifyUser(s.student_id, { title, message, is_read: 0, created_at: new Date() });
        });
      }
    } catch (error) {
      console.error(`Failed to notify students of subject ${subjectId}:`, error);
    }
  }
};

module.exports = NotificationManager;