const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// 所有管理员路由都需要验证token和管理员权限
router.use(verifyToken, verifyAdmin);

// 获取平台统计数据
router.get('/stats', adminController.getStats);

// 用户管理
router.get('/users', adminController.getUsers);
router.put('/users/:id/reset-password', adminController.resetUserPassword);

// 面试管理
router.get('/interviews', adminController.getInterviews);
router.delete('/interviews/:id', adminController.deleteInterview);

// 面试尝试管理
router.get('/attempts', adminController.getAttempts);

module.exports = router;
