const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const { createTransactionReminder, scheduleReminder } = require('../utils/notificationHelper');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '未授权' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ message: '无效的token' });
  }
};

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1, paymentMethod = 'offline', deliveryMethod = 'face_to_face', deliveryAddress } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: '请提供商品ID' });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.status !== '在售') {
      return res.status(400).json({ message: '商品已售出' });
    }
    
    if (product.seller.toString() === req.userId) {
      return res.status(400).json({ message: '不能购买自己的商品' });
    }
    
    const transaction = new Transaction({
      product: productId,
      buyer: req.userId,
      seller: product.seller,
      price: product.price,
      quantity,
      paymentMethod,
      deliveryMethod,
      deliveryAddress,
      status: '待处理'
    });
    
    await transaction.save();
    
    product.status = '已售出';
    await product.save();
    
    await transaction.populate('product');
    await transaction.populate('seller', 'username');
    
    scheduleReminder(req.userId, '交易提醒', `您创建的交易订单：${transaction.product?.name || '未知商品'}，请及时关注交易进度`, 60, transaction._id);
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.userId }, { seller: req.userId }]
    })
      .populate('product')
      .populate('buyer', 'username')
      .populate('seller', 'username')
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('product')
      .populate('buyer', 'username')
      .populate('seller', 'username');
    
    if (!transaction) {
      return res.status(404).json({ message: '交易不存在' });
    }
    
    if (transaction.buyer.toString() !== req.userId && transaction.seller.toString() !== req.userId) {
      return res.status(403).json({ message: '无权查看此交易' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: '交易不存在' });
    }
    
    if (transaction.seller.toString() !== req.userId) {
      return res.status(403).json({ message: '无权修改此交易' });
    }
    
    transaction.status = status;
    await transaction.save();
    
    await transaction.populate('product');
    await transaction.populate('buyer', 'username');
    await transaction.populate('seller', 'username');
    
    if (status === '待发货') {
      await createTransactionReminder(transaction.seller.toString(), transaction._id, 'shipment_due');
    } else if (status === '待收货') {
      await createTransactionReminder(transaction.buyer.toString(), transaction._id, 'delivery_due');
    } else if (status === '已完成') {
      await createTransactionReminder(transaction.buyer.toString(), transaction._id, 'review_due');
      await scheduleReminder(transaction.buyer.toString(), '评价提醒', '请记得对本次交易进行评价哦！', 1440, transaction._id);
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;