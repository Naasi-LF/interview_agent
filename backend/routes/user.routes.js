const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', verifyToken, userController.getCurrentUser);

/**
 * @route PUT /api/users/me
 * @desc Update current user profile
 * @access Private
 */
router.put('/me', verifyToken, userController.updateCurrentUser);

module.exports = router;
