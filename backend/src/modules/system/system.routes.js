const express = require('express');
const router = express.Router();
const systemController = require('./system.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

// All logged-in users can fetch system dropdown data
router.get('/data', verifyToken, systemController.fetchAllSystemData);

module.exports = router;