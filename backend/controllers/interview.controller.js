const Interview = require('../models/interview.model');
const { createError } = require('../utils/error.util');

// 创建新面试
exports.createInterview = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      status, 
      isPublic, 
      startTime, 
      endTime,
      settings 
    } = req.body;

    // 验证必要字段
    if (!title || !description || !startTime || !endTime || !settings?.questionPool?.length) {
      return next(createError(400, '请提供所有必要的面试信息'));
    }

    // 验证时间
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return next(createError(400, '请提供有效的开始和结束时间'));
    }
    
    if (startDate >= endDate) {
      return next(createError(400, '结束时间必须晚于开始时间'));
    }

    // 创建新面试
    const newInterview = new Interview({
      title,
      description,
      creatorId: req.user.id, // 从认证中间件获取
      status: status || 'active',
      isPublic: isPublic !== undefined ? isPublic : true,
      startTime: startDate,
      endTime: endDate,
      settings: {
        maxAttempts: settings.maxAttempts || 3,
        competencyDimensions: settings.competencyDimensions || ['逻辑思维', '沟通能力', '团队协作', '技术深度', '抗压能力'],
        questionsToAsk: settings.questionsToAsk || 5,
        questionPool: settings.questionPool
      }
    });

    await newInterview.save();
    res.status(201).json(newInterview);
  } catch (error) {
    next(error);
  }
};

// 获取所有公开面试列表（支持搜索和分页）
exports.getInterviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const now = new Date(); // 获取当前时间

    // 基础查询条件：公开且未过期（结束时间大于当前时间）
    let query = { 
      isPublic: true,
      endTime: { $gt: now } // 只显示未过期的面试
    };
    
    // 如果有搜索关键词，使用模糊搜索
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const interviews = await Interview.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creatorId', 'username nickname avatarUrl');

    const total = await Interview.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      interviews,
      totalPages,
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// 获取单个面试详情
exports.getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('creatorId', 'username nickname avatarUrl');
    
    if (!interview) {
      return next(createError(404, '面试不存在'));
    }

    res.json(interview);
  } catch (error) {
    next(error);
  }
};

// 更新面试信息（仅创建者可更新）
exports.updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return next(createError(404, '面试不存在'));
    }

    // 检查是否为创建者
    if (interview.creatorId.toString() !== req.user.id) {
      return next(createError(403, '您无权更新此面试'));
    }

    // 更新面试信息
    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedInterview);
  } catch (error) {
    next(error);
  }
};

// 删除面试（仅创建者可删除）
exports.deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return next(createError(404, '面试不存在'));
    }

    // 检查是否为创建者
    if (interview.creatorId.toString() !== req.user.id) {
      return next(createError(403, '您无权删除此面试'));
    }

    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: '面试已成功删除' });
  } catch (error) {
    next(error);
  }
};

// 获取我创建的面试列表
exports.getMyInterviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 获取面试列表
    const interviews = await Interview.find({ creatorId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 获取总数
    const total = await Interview.countDocuments({ creatorId: req.user.id });
    const totalPages = Math.ceil(total / limit);

    // 使用Promise.all并行处理每个面试的数据增强
    const enhancedInterviews = await Promise.all(interviews.map(async (interview) => {
      // 转换为普通对象
      const interviewObj = interview.toObject();
      
      // 添加问题数量
      interviewObj.questionCount = interview.settings?.questionPool?.length || 0;
      
      // 查询参与人数
      const Attempt = require('../models/attempt.model');
      const attemptCount = await Attempt.countDocuments({ interviewId: interview._id });
      interviewObj.attemptCount = attemptCount;
      
      return interviewObj;
    }));

    res.json({
      interviews: enhancedInterviews,
      totalPages,
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};
