const Attempt = require('../models/attempt.model');
const Interview = require('../models/interview.model');
const { createError } = require('../utils/error.util');
const axios = require('axios');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 开始一次新的面试尝试
exports.startAttempt = async (req, res, next) => {
  try {
    const { id: interviewId } = req.params;
    const userId = req.user.id;

    // 检查面试是否存在
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return next(createError(404, '面试不存在'));
    }

    // 检查面试是否在有效时间内
    const now = new Date();
    if (now < interview.startTime || now > interview.endTime) {
      return next(createError(400, '面试不在有效时间范围内'));
    }

    // 检查面试状态是否为active
    if (interview.status !== 'active') {
      return next(createError(400, '面试当前不可用'));
    }

    // 检查用户是否已有进行中的面试尝试
    const existingInProgressAttempt = await Attempt.findOne({
      interviewId,
      userId,
      status: 'in_progress'
    });

    // 如果已有进行中的尝试，返回该尝试
    if (existingInProgressAttempt) {
      // 获取当前应该显示的问题
      const questionIndex = existingInProgressAttempt.qaLog.length;
      const currentQuestion = interview.settings.questionPool[questionIndex];
      
      return res.status(200).json({
        attemptId: existingInProgressAttempt._id,
        firstQuestion: currentQuestion,
        isExisting: true
      });
    }
    
    // 检查用户是否已达到最大尝试次数
    const attemptCount = await Attempt.countDocuments({
      interviewId,
      userId,
      status: 'completed'
    });

    if (attemptCount >= interview.settings.maxAttempts) {
      return next(createError(400, `您已达到此面试的最大尝试次数 (${interview.settings.maxAttempts})`));
    }

    // 创建新的尝试记录
    const newAttempt = new Attempt({
      interviewId,
      userId,
      status: 'in_progress',
      qaLog: [],
      result: {
        startedAt: now
      }
    });

    await newAttempt.save();

    // 更新面试参与人数
    await Interview.findByIdAndUpdate(interviewId, { $inc: { participantCount: 1 } });

    // 获取第一个问题
    const firstQuestion = interview.settings.questionPool[0];

    res.status(201).json({
      attemptId: newAttempt._id,
      firstQuestion
    });
  } catch (error) {
    next(error);
  }
};

// 提交回答并获取下一个问题
exports.submitAnswer = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { question, answer } = req.body;
    const userId = req.user.id;

    // 验证请求体
    if (!question || !answer) {
      return next(createError(400, '问题和回答都是必需的'));
    }

    // 检查尝试记录是否存在
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return next(createError(404, '面试尝试记录不存在'));
    }

    // 检查是否是该用户的尝试
    if (attempt.userId.toString() !== userId) {
      return next(createError(403, '您无权访问此面试尝试记录'));
    }

    // 检查尝试状态是否为进行中
    if (attempt.status !== 'in_progress') {
      return next(createError(400, '此面试尝试已完成'));
    }

    // 获取面试详情
    const interview = await Interview.findById(attempt.interviewId);
    if (!interview) {
      return next(createError(404, '面试不存在'));
    }

    // 将问答记录添加到qaLog
    attempt.qaLog.push({ question, answer });
    await attempt.save();

    // 检查是否还有下一个问题
    const nextQuestionIndex = attempt.qaLog.length;
    if (nextQuestionIndex < interview.settings.questionsToAsk && 
        nextQuestionIndex < interview.settings.questionPool.length) {
      // 返回下一个问题
      const nextQuestion = interview.settings.questionPool[nextQuestionIndex];
      return res.json({ nextQuestion });
    } else {
      // 面试完成，更新状态
      attempt.status = 'completed';
      attempt.result.completedAt = new Date();
      await attempt.save();

      // 异步生成面试报告
      generateInterviewReport(attempt._id)
        .catch(err => console.error('生成面试报告时出错:', err));

      return res.json({ message: '面试已完成，正在生成报告...' });
    }
  } catch (error) {
    next(error);
  }
};

// 获取用户的所有面试尝试记录
exports.getUserAttempts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const attempts = await Attempt.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'interviewId',
        select: 'title creatorId',
        populate: {
          path: 'creatorId',
          select: 'username nickname'
        }
      });

    const total = await Attempt.countDocuments({ userId });
    const totalPages = Math.ceil(total / limit);

    res.json({
      attempts,
      totalPages,
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// 获取单个面试尝试记录详情
exports.getAttemptById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const attempt = await Attempt.findById(id)
      .populate({
        path: 'interviewId',
        select: 'title description creatorId settings',
        populate: {
          path: 'creatorId',
          select: 'username nickname'
        }
      })
      .populate('userId', 'username nickname');

    if (!attempt) {
      return next(createError(404, '面试尝试记录不存在'));
    }

    // 检查访问权限（创建者、参与者或管理员可查看）
    const isParticipant = attempt.userId._id.toString() === userId;
    const isCreator = attempt.interviewId.creatorId._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isParticipant && !isCreator && !isAdmin) {
      return next(createError(403, '您无权查看此面试尝试记录'));
    }

    res.json(attempt);
  } catch (error) {
    next(error);
  }
};

// 获取面试活动的数据看板
exports.getInterviewDashboard = async (req, res, next) => {
  try {
    const { id: interviewId } = req.params;

    // 检查面试是否存在
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return next(createError(404, '面试不存在'));
    }

    // 获取所有已完成的尝试记录
    const completedAttempts = await Attempt.find({
      interviewId,
      status: 'completed',
      'result.overallScore': { $exists: true }
    }).populate('userId', 'username nickname avatarUrl');

    // 生成排行榜（按总分排序）
    const leaderboard = completedAttempts
      .map(attempt => ({
        attemptId: attempt._id,
        userId: attempt.userId._id,
        username: attempt.userId.username,
        nickname: attempt.userId.nickname,
        avatarUrl: attempt.userId.avatarUrl,
        overallScore: attempt.result.overallScore,
        completedAt: attempt.result.completedAt
      }))
      .sort((a, b) => b.overallScore - a.overallScore);

    // 生成分数分布
    const scoreDistribution = {
      '0-60': 0,
      '60-70': 0,
      '70-80': 0,
      '80-90': 0,
      '90-100': 0
    };

    completedAttempts.forEach(attempt => {
      const score = attempt.result.overallScore;
      if (score < 60) scoreDistribution['0-60']++;
      else if (score < 70) scoreDistribution['60-70']++;
      else if (score < 80) scoreDistribution['70-80']++;
      else if (score < 90) scoreDistribution['80-90']++;
      else scoreDistribution['90-100']++;
    });

    res.json({
      leaderboard,
      scoreDistribution,
      totalParticipants: interview.participantCount,
      completedAttempts: completedAttempts.length
    });
  } catch (error) {
    next(error);
  }
};

// 异步生成面试报告
async function generateInterviewReport(attemptId) {
  try {
    // 获取尝试记录详情
    const attempt = await Attempt.findById(attemptId)
      .populate('interviewId');
    
    if (!attempt || attempt.status !== 'completed') {
      console.error('无效的面试尝试记录或状态不是已完成');
      return;
    }

    const interview = attempt.interviewId;
    
    // 准备AI评估请求
    const competencyDimensions = interview.settings.competencyDimensions;
    const qaLog = attempt.qaLog;
    
    // 构建AI请求内容
    const messages = [
      {
        role: "system",
        content: `你是一位专业的面试评估专家。请根据候选人的回答，评估他们在以下能力维度的表现：${competencyDimensions.join('、')}。
        为每个维度打分（0-100分），并给出一个总体评价。评价应该客观、专业，指出优点和需要改进的地方。`
      },
      {
        role: "user",
        content: `以下是面试问答记录，请进行评估：\n\n${qaLog.map(qa => 
          `问题：${qa.question}\n回答：${qa.answer}`).join('\n\n')}\n\n请提供：
          1. 各维度得分（每个维度0-100分）
          2. 总体得分（0-100分）
          3. 300字左右的综合评价`
      }
    ];

    // 调用AI API
    const response = await axios.post(`${process.env.AI_BASE_URL}/v1/chat/completions`, {
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`
      }
    });

    // 解析AI响应
    const aiResponse = response.data.choices[0].message.content;
    
    // 提取各维度得分
    const dimensionalScores = {};
    competencyDimensions.forEach(dimension => {
      const regex = new RegExp(`${dimension}[：:] *(\\d+)`, 'i');
      const match = aiResponse.match(regex);
      if (match && match[1]) {
        dimensionalScores[dimension] = parseInt(match[1]);
      } else {
        // 如果没有找到匹配，给一个默认分数
        dimensionalScores[dimension] = 75;
      }
    });
    
    // 提取总体得分
    let overallScore = 0;
    const overallMatch = aiResponse.match(/总体得分[：:] *(\\d+)/i) || 
                         aiResponse.match(/总分[：:] *(\\d+)/i);
    
    if (overallMatch && overallMatch[1]) {
      overallScore = parseInt(overallMatch[1]);
    } else {
      // 如果没有找到匹配，计算平均分
      const scores = Object.values(dimensionalScores);
      overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }
    
    // 提取综合评价
    let aiComment = aiResponse;
    if (aiResponse.length > 500) {
      // 如果评价太长，尝试提取评价部分
      const commentMatch = aiResponse.match(/综合评价[：:]([\s\S]+)/i) || 
                          aiResponse.match(/评语[：:]([\s\S]+)/i);
      if (commentMatch && commentMatch[1]) {
        aiComment = commentMatch[1].trim();
      } else {
        // 如果没有找到匹配，取最后500个字符
        aiComment = aiResponse.slice(-500);
      }
    }
    
    // 更新面试尝试记录
    await Attempt.findByIdAndUpdate(attemptId, {
      'result.overallScore': overallScore,
      'result.dimensionalScores': dimensionalScores,
      'result.aiComment': aiComment
    });
    
    console.log(`面试报告生成成功: ${attemptId}`);
  } catch (error) {
    console.error('生成面试报告时出错:', error);
  }
}

// 导出面试报告为PDF（此处只返回一个标记，前端负责实际生成PDF）
exports.exportReportPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const attempt = await Attempt.findById(id)
      .populate({
        path: 'interviewId',
        select: 'creatorId'
      });

    if (!attempt) {
      return next(createError(404, '面试尝试记录不存在'));
    }

    // 检查权限（仅创建者可导出）
    if (attempt.interviewId.creatorId.toString() !== userId) {
      return next(createError(403, '您无权导出此面试报告'));
    }

    // 返回导出标记（前端负责实际生成PDF）
    res.json({
      canExport: true,
      attemptId: attempt._id
    });
  } catch (error) {
    next(error);
  }
};
