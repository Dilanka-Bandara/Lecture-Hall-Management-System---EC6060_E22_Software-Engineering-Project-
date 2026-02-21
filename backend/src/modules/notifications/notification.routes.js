const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

// All users can access their own notifications, so we just need verifyToken
router.use(verifyToken);

router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.readAllNotifications);
router.patch('/:id/read', notificationController.readNotification);

module.exports = router;