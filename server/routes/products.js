const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
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

router.get('/', async (req, res) => {
  try {
    const { keyword, category, location, sort = 'createdAt', page = 1, limit = 20 } = req.query;
    
    let query = { status: '在售' };
    
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (location) {
      query.location = location;
    }
    
    const products = await Product.find(query)
      .populate('seller', 'username')
      .sort({ [sort.startsWith('-') ? sort.slice(1) : sort]: sort.startsWith('-') ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'username');
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, category, location, images } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ message: '请填写商品名称和价格' });
    }
    
    const product = new Product({
      name,
      description,
      price,
      category,
      location,
      images: images || [],
      seller: req.userId
    });
    
    await product.save();
    await product.populate('seller', 'username');
    
    res.status(201).json(product);
  } catch (error) {
    console.error('创建商品错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.seller.toString() !== req.userId) {
      return res.status(403).json({ message: '无权修改此商品' });
    }
    
    const { name, description, price, category, location, images, status } = req.body;
    
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.location = location || product.location;
    product.images = images || product.images;
    product.status = status || product.status;
    
    await product.save();
    await product.populate('seller', 'username');
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.seller.toString() !== req.userId) {
      return res.status(403).json({ message: '无权删除此商品' });
    }
    
    await product.remove();
    res.json({ message: '商品已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const products = await Product.find({ seller: req.params.userId })
      .populate('seller', 'username')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;