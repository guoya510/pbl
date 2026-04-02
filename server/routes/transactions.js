const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// 创建交易
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { productId, paymentMethod } = req.body;
    
    // 查找商品
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.status !== '在售') {
      return res.status(400).json({ message: '商品已下架或已售出' });
    }
    
    if (product.seller.toString() === decoded.id) {
      return res.status(400).json({ message: '不能购买自己的商品' });
    }
    
    // 创建交易
    const transaction = new Transaction({
      product: productId,
      buyer: decoded.id,
      seller: product.seller,
      amount: product.price,
      paymentMethod
    });
    
    await transaction.save();
    
    // 更新商品状态
    product.status = '已售出';
    await product.save();
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取交易列表
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const transactions = await Transaction.find({ 
      $or: [{ buyer: decoded.id }, { seller: decoded.id }] 
    })
    .populate('product', 'name images price')
    .populate('buyer', 'username avatar')
    .populate('seller', 'username avatar')
    .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取交易详情
router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const transaction = await Transaction.findById(req.params.id)
      .populate('product', 'name images price')
      .populate('buyer', 'username avatar')
      .populate('seller', 'username avatar');
    
    if (!transaction) {
      return res.status(404).json({ message: '交易不存在' });
    }
    
    if (transaction.buyer.toString() !== decoded.id && transaction.seller.toString() !== decoded.id) {
      return res.status(403).json({ message: '无权查看此交易' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 更新交易状态
router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: '交易不存在' });
    }
    
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: '请提供交易状态' });
    }
    
    // 检查权限
    if (transaction.buyer.toString() !== decoded.id && transaction.seller.toString() !== decoded.id) {
      return res.status(403).json({ message: '无权修改此交易' });
    }
    
    // 更新状态
    transaction.status = status;
    transaction.updatedAt = Date.now();
    await transaction.save();
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;