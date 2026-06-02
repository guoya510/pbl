const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    default: '其他'
  },
  location: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['在售', '已售出', '已下架'],
    default: '在售'
  },
  reviewStatus: {
    type: String,
    enum: ['待审核', '已通过', '已拒绝'],
    default: '待审核'
  },
  reviewReason: {
    type: String,
    default: ''
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);