const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { verifyToken, authorizeRoles } = require('../../middlewares/auth.middleware');

// All routes require Admin privileges
router.use(verifyToken, authorizeRoles('admin'));

router.get('/users', adminController.getUsers);
router.post('/users', adminController.addUser);

router.get('/halls', adminController.getHalls);
router.post('/halls', adminController.addHall);

module.exports = router;