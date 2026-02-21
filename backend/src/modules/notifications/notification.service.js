const db = require('../../config/db');

const getUserNotifications = async (userId) => {
  return await db('notifications')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc')
    .limit(20); // Only fetch the 20 most recent to keep the app fast
};

const markAsRead = async (notificationId, userId) => {
  // Ensure the user actually owns this notification before updating it
  await db('notifications')
    .where({ id: notificationId, user_id: userId })
    .update({ is_read: true });
  return { success: true };
};

const markAllAsRead = async (userId) => {
  await db('notifications')
    .where({ user_id: userId, is_read: false })
    .update({ is_read: true });
  return { success: true };
};

module.exports = { getUserNotifications, markAsRead, markAllAsRead };