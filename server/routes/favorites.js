const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
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
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: '请提供商品ID' });
    }
    
    const existingFavorite = await Favorite.findOne({
      user: req.userId,
      product: productId
    });
    
    if (existingFavorite) {
      return res.status(400).json({ message: '已收藏此商品' });
    }
    
    const favorite = new Favorite({
      user: req.userId,
      product: productId
    });
    
    await favorite.save();
    await favorite.populate('product');
    
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.userId,
      product: req.params.productId
    });
    
    if (!favorite) {
      return res.status(404).json({ message: '未收藏此商品' });
    }
    
    await favorite.remove();
    res.json({ message: '取消收藏成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.userId })
      .populate('product')
      .populate({
        path: 'product',
        populate: {
          path: 'seller',
          select: 'username'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.userId,
      product: req.params.productId
    });
    
    res.json({ isFavorited: !!favorite });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;