const User = require('../models/user.model');
const Interview = require('../models/interview.model');
const Attempt = require('../models/attempt.model');
const bcrypt = require('bcryptjs');
const createError = require('http-errors');

// 获取平台统计数据
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalInterviews = await Interview.countDocuments();
    const totalAttempts = await Attempt.countDocuments();
    const completedAttempts = await Attempt.countDocuments({ status: 'completed' });
    
    // 获取最近7天的新用户数量
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo },
      role: 'user'
    });
    
    // 获取最近7天的新面试数量
    const newInterviews = await Interview.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    // 获取最近7天的面试尝试数量
    const newAttempts = await Attempt.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    // 获取过去30天的时间序列数据
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 生成日期数组，从30天前到今天
    const dateArray = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dateArray.push(date);
    }
    
    // 获取新用户注册的时间序列数据
    const userRegistrations = await User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo },
          role: 'user'
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    
    // 获取面试尝试的时间序列数据
    const attemptData = await Attempt.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    
    // 获取面试创建的时间序列数据
    const interviewData = await Interview.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    
    // 格式化时间序列数据
    const formatTimeSeriesData = (rawData, dateArray, statusField = null) => {
      const formattedData = dateArray.map(date => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        if (statusField) {
          // 如果需要按状态分组
          const completedItem = rawData.find(item => 
            item._id.year === year && 
            item._id.month === month && 
            item._id.day === day &&
            item._id.status === 'completed'
          );
          
          const inProgressItem = rawData.find(item => 
            item._id.year === year && 
            item._id.month === month && 
            item._id.day === day &&
            item._id.status === 'in_progress'
          );
          
          const abandonedItem = rawData.find(item => 
            item._id.year === year && 
            item._id.month === month && 
            item._id.day === day &&
            item._id.status === 'abandoned'
          );
          
          return {
            date: dateStr,
            completed: completedItem ? completedItem.count : 0,
            inProgress: inProgressItem ? inProgressItem.count : 0,
            abandoned: abandonedItem ? abandonedItem.count : 0,
            total: (completedItem ? completedItem.count : 0) + 
                   (inProgressItem ? inProgressItem.count : 0) + 
                   (abandonedItem ? abandonedItem.count : 0)
          };
        } else {
          // 普通的时间序列数据
          const item = rawData.find(item => 
            item._id.year === year && 
            item._id.month === month && 
            item._id.day === day
          );
          
          return {
            date: dateStr,
            count: item ? item.count : 0
          };
        }
      });
      
      return formattedData;
    };
    
    const userTimeSeriesData = formatTimeSeriesData(userRegistrations, dateArray);
    const interviewTimeSeriesData = formatTimeSeriesData(interviewData, dateArray);
    const attemptTimeSeriesData = formatTimeSeriesData(attemptData, dateArray, 'status');

    res.json({
      totalUsers,
      totalAdmins,
      totalInterviews,
      totalAttempts,
      completedAttempts,
      completionRate: totalAttempts > 0 ? (completedAttempts / totalAttempts * 100).toFixed(2) : 0,
      newUsers,
      newInterviews,
      newAttempts,
      timeSeriesData: {
        users: userTimeSeriesData,
        interviews: interviewTimeSeriesData,
        attempts: attemptTimeSeriesData
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取所有用户
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const query = {};
    
    // 用户名搜索
    if (req.query.username) {
      query.username = { $regex: req.query.username, $options: 'i' };
    }
    
    // 角色筛选
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // 执行查询
    const users = await User.find(query)
      .select('-password') // 排除密码字段
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      users,
      totalPages,
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// 重置用户密码
exports.resetUserPassword = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, '用户不存在'));
    }
    
    // 生成随机密码
    const newPassword = req.body.newPassword || Math.random().toString(36).slice(-8);
    
    // 更新用户密码 - 使用 $set 操作符，让 pre('findOneAndUpdate') 钩子处理密码加密
    await User.findByIdAndUpdate(userId, { $set: { password: newPassword } });
    
    res.json({
      message: '密码重置成功',
      newPassword: newPassword
    });
  } catch (error) {
    next(error);
  }
};

// 获取所有面试
exports.getInterviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const query = {};
    
    // 标题搜索
    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: 'i' };
    }
    
    // 状态筛选
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // 创建者ID筛选
    if (req.query.creatorId) {
      query.creatorId = req.query.creatorId;
    }
    
    // 排序方式
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortField] = sortOrder;
    
    // 执行查询
    const interviews = await Interview.find(query)
      .populate('creatorId', 'username nickname avatarUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // 增强面试数据
    const enhancedInterviews = await Promise.all(interviews.map(async (interview) => {
      const interviewObj = interview.toObject();
      
      // 添加问题数量
      interviewObj.questionCount = interview.settings?.questionPool?.length || 0;
      
      // 查询参与人数
      const attemptCount = await Attempt.countDocuments({ interviewId: interview._id });
      interviewObj.attemptCount = attemptCount;
      
      return interviewObj;
    }));
    
    const total = await Interview.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
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

// 删除面试
exports.deleteInterview = async (req, res, next) => {
  try {
    const interviewId = req.params.id;
    
    // 检查面试是否存在
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return next(createError(404, '面试不存在'));
    }
    
    // 删除面试
    await Interview.findByIdAndDelete(interviewId);
    
    // 删除相关的面试尝试
    await Attempt.deleteMany({ interviewId });
    
    res.json({
      message: '面试及相关记录已成功删除'
    });
  } catch (error) {
    next(error);
  }
};

// 获取所有面试尝试
exports.getAttempts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const query = {};
    
    // 面试ID筛选
    if (req.query.interviewId) {
      query.interviewId = req.query.interviewId;
    }
    
    // 用户ID筛选
    if (req.query.userId) {
      query.userId = req.query.userId;
    }
    
    // 状态筛选
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // 排序方式
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortField] = sortOrder;
    
    // 执行查询
    const attempts = await Attempt.find(query)
      .populate('interviewId', 'title settings')
      .populate('userId', 'username nickname avatarUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    const total = await Attempt.countDocuments(query);
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
