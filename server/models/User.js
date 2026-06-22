const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['男', '女', '保密'],
    default: '保密'
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  creditScore: {
    type: Number,
    default: 100
  },
  creditLevel: {
    type: String,
    enum: ['S', 'A', 'B', 'C', 'D'],
    default: 'B'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.methods.calculateCreditLevel = function() {
  if (this.creditScore >= 90) return 'S';
  if (this.creditScore >= 80) return 'A';
  if (this.creditScore >= 60) return 'B';
  if (this.creditScore >= 40) return 'C';
  return 'D';
};

UserSchema.methods.updateCreditScore = function(points) {
  this.creditScore = Math.max(0, Math.min(100, this.creditScore + points));
  this.creditLevel = this.calculateCreditLevel();
};

UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.creditScore = Math.max(0, Math.min(100, this.creditScore));
  this.creditLevel = this.calculateCreditLevel();
  next();
});

module.exports = mongoose.model('User', UserSchema);