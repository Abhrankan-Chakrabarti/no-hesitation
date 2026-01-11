const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  topic: {
    type: String,
    default: 'General'
  },
  confusionLevel: {
    type: Number,
    min: 0,
    max: 3,
    default: 1
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  answeredAt: {
    type: Date
  },
  answer: {
    type: String
  },
  mergedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doubt'
  },
  mergedCount: {
    type: Number,
    default: 1
  },
  mergedStudents: [{
    studentId: String,
    studentName: String,
    timestamp: Date
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for fast searching
doubtSchema.index({ sessionId: 1, isAnswered: 1 });
doubtSchema.index({ question: 'text' });

module.exports = mongoose.model('Doubt', doubtSchema);
