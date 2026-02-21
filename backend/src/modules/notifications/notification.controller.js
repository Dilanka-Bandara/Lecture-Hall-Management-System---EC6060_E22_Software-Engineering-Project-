const notificationService = require('./notification.service');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const readNotification = async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMyNotifications, readNotification, readAllNotifications };