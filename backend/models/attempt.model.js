const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  qaLog: [{
    question: String,
    answer: String
  }],
  result: {
    overallScore: Number,
    dimensionalScores: {
      type: Map,
      of: Number
    },
    aiComment: String,
    startedAt: Date,
    completedAt: Date
  }
}, { timestamps: true });

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = Attempt;
