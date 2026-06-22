const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
      status: '待付款'
    });
    
    await transaction.save();
    
    product.status = '已售出';
    await product.save();
    
    await transaction.populate('product');
    await transaction.populate('seller', 'username');
    
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
    
    
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: '交易不存在' });
    }
    
    if (transaction.buyer.toString() !== req.userId) {
      return res.status(403).json({ message: '无权操作此交易' });
    }
    
    if (transaction.status !== '待付款') {
      return res.status(400).json({ message: '当前交易状态不允许确认付款' });
    }
    
    transaction.status = '待发货';
    await transaction.save();
    
    await transaction.populate('product');
    await transaction.populate('buyer', 'username');
    await transaction.populate('seller', 'username');
    
    res.json({ message: '付款确认成功', transaction });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id/confirm-shipping', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: '交易不存在' });
    }
    
    if (transaction.seller.toString() !== req.userId) {
      return res.status(403).json({ message: '无权操作此交易' });
    }
    
    if (transaction.status !== '待发货') {
      return res.status(400).json({ message: '当前交易状态不允许确认发货' });
    }
    
    transaction.status = '待收货';
    await transaction.save();
    
    await transaction.populate('product');
    await transaction.populate('buyer', 'username');
    await transaction.populate('seller', 'username');
    
    res.json({ message: '发货确认成功', transaction });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id/confirm-receipt', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: '交易不存在' });
    }
    
    if (transaction.buyer.toString() !== req.userId) {
      return res.status(403).json({ message: '无权操作此交易' });
    }
    
    if (transaction.status !== '待收货') {
      return res.status(400).json({ message: '当前交易状态不允许确认收货' });
    }
    
    transaction.status = '已完成';
    await transaction.save();
    
    await transaction.populate('product');
    await transaction.populate('buyer', 'username');
    await transaction.populate('seller', 'username');
    
    res.json({ message: '收货确认成功，交易已完成', transaction });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('product');
    
    if (!transaction) {
      return res.status(404).json({ message: '交易不存在' });
    }
    
    const isBuyer = transaction.buyer.toString() === req.userId;
    const isSeller = transaction.seller.toString() === req.userId;
    
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: '无权操作此交易' });
    }
    
    const status = transaction.status;
    const statusHex = Buffer.from(status).toString('hex');
    
    console.log('Cancel transaction:', req.params.id);
    console.log('Current status:', status, 'Hex:', statusHex);
    console.log('Is buyer:', isBuyer, 'Is seller:', isSeller);
    
    const pendingHex = 'e5be85e4bb98e6acbe';
    const completedHexes = ['e5b7b2e5ae8ce68890', 'e5b7b2e58f96e6b688'];
    
    console.log('Pending hex match:', statusHex === pendingHex);
    console.log('Completed hex match:', completedHexes.includes(statusHex));
    
    if (completedHexes.includes(statusHex)) {
      return res.status(400).json({ message: '当前交易状态不允许取消' });
    }
    
    if (statusHex !== pendingHex && status !== '待付款') {
      console.log('Unknown status, allowing cancel');
    }
    
    let cancelBy = isBuyer ? 'buyer' : 'seller';
    let creditScoreUser = isBuyer ? transaction.buyer : transaction.seller;
    
    console.log('Cancel by:', cancelBy);
    console.log('Credit score user ID:', creditScoreUser);
    
    transaction.status = '已取消';
    transaction.cancelBy = cancelBy;
    await transaction.save();
    
    console.log('Credit score user:', creditScoreUser, 'Type:', typeof creditScoreUser);
    
    const creditScoreUserId = creditScoreUser.toString();
    console.log('Credit score user ID (string):', creditScoreUserId);
    
    try {
      const user = await User.findById(creditScoreUserId);
      console.log('Found user:', user ? user.username : null);
      
      if (user) {
        user.creditScore = Math.max(0, user.creditScore - 10);
        await user.save();
        console.log('User credit score updated:', user.username, user.creditScore);
      } else {
        console.log('User not found, skipping credit score update');
      }
    } catch (userError) {
      console.error('Error updating credit score:', userError);
    }
    
    if (isSeller && transaction.product) {
      transaction.product.status = '在售';
      await transaction.product.save();
    }
    
    await transaction.populate('product');
    await transaction.populate('buyer', 'username');
    await transaction.populate('seller', 'username');
    
    res.json({ message: '交易已取消', transaction });
  } catch (error) {
    console.error('Cancel transaction error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;