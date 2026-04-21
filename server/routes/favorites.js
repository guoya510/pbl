const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const jwt = require('jsonwebtoken');

// 收藏商品
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { productId } = req.body;
    
    // 检查是否已经收藏
    const existingFavorite = await Favorite.findOne({ user: decoded.id, product: productId });
    if (existingFavorite) {
      return res.status(400).json({ message: '已经收藏过此商品' });
    }
    
    const favorite = new Favorite({
      user: decoded.id,
      product: productId
    });
    
    await favorite.save();
    res.status(201).json({ message: '收藏成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 取消收藏
router.delete('/:productId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { productId } = req.params;
    
    const result = await Favorite.findOneAndDelete({ user: decoded.id, product: productId });
    if (!result) {
      return res.status(404).json({ message: '收藏不存在' });
    }
    
    res.json({ message: '取消收藏成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取用户的收藏列表
router.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const favorites = await Favorite.find({ user: decoded.id })
      .populate('product')
      .populate('product.seller', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 检查商品是否已收藏
router.get('/check/:productId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { productId } = req.params;
    
    const favorite = await Favorite.findOne({ user: decoded.id, product: productId });
    res.json({ isFavorited: !!favorite });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;