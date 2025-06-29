const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'active'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  participantCount: {
    type: Number,
    default: 0
  },
  settings: {
    maxAttempts: {
      type: Number,
      default: 3
    },
    competencyDimensions: {
      type: [String],
      default: ['逻辑思维', '沟通能力', '团队协作', '技术深度', '抗压能力']
    },
    questionsToAsk: {
      type: Number,
      default: 5
    },
    questionPool: {
      type: [String],
      required: true
    }
  }
}, { timestamps: true });

// 创建索引以便于搜索
interviewSchema.index({ title: 'text', description: 'text' });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
