const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// 创建新面试（需要认证）
router.post('/', verifyToken, interviewController.createInterview);

// 获取所有公开面试列表（支持搜索和分页）
router.get('/', interviewController.getInterviews);

// 获取我创建的面试列表
router.get('/my/interviews', verifyToken, interviewController.getMyInterviews);

// 获取单个面试详情
router.get('/:id', interviewController.getInterviewById);

// 更新面试信息（仅创建者可更新）
router.put('/:id', verifyToken, interviewController.updateInterview);

// 删除面试（仅创建者可删除）
router.delete('/:id', verifyToken, interviewController.deleteInterview);

module.exports = router;
