const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  deliveryMethod: {
    type: String,
    enum: ['face_to_face', 'express'],
    default: 'face_to_face',
    required: true
  },
  deliveryAddress: {
    type: String
  },
  status: {
    type: String,
    enum: ['待处理', '已完成', '已取消'],
    default: '待处理'
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

TransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);