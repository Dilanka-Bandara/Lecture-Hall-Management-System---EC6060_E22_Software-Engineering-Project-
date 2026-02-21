const express = require('express');
const router = express.Router();
const swapController = require('./swap.controller');
const { verifyToken, authorizeRoles } = require('../../middlewares/auth.middleware');

// Lecturers request a swap
router.post('/', verifyToken, authorizeRoles('lecturer'), swapController.requestSwap);

// Lecturers and HODs view pending swaps requiring their attention
router.get('/pending', verifyToken, authorizeRoles('lecturer', 'hod'), swapController.getMyPendingSwaps);

// Lecturers and HODs approve/reject swaps
router.patch('/:swapId/respond', verifyToken, authorizeRoles('lecturer', 'hod'), swapController.respondToSwap);

module.exports = router;