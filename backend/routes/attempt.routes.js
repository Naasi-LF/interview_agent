const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attempt.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// 开始一次新的面试尝试
router.post('/interviews/:id/attempts', verifyToken, attemptController.startAttempt);

// 提交回答并获取下一个问题
router.post('/attempts/:attemptId/answer', verifyToken, attemptController.submitAnswer);

// 获取用户的所有面试尝试记录
router.get('/users/me/attempts', verifyToken, attemptController.getUserAttempts);

// 获取单个面试尝试记录详情
router.get('/attempts/:id', verifyToken, attemptController.getAttemptById);

// 获取面试活动的数据看板
router.get('/interviews/:id/dashboard', attemptController.getInterviewDashboard);

// 导出面试报告为PDF（此处只返回一个标记，前端负责实际生成PDF）
router.get('/attempts/:id/export/pdf', verifyToken, attemptController.exportReportPdf);

module.exports = router;
