const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const { keyword, category, location, sort = 'createdAt', page = 1, limit = 10 } = req.query;
    const query = { status: '在售' };
    
    // 关键词搜索
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // 分类筛选
    if (category) query.category = category;
    
    // 地点筛选
    if (location) query.location = location;
    
    // 排序逻辑
    let sortOptions = { createdAt: -1 };
    if (sort === 'price') {
      sortOptions = { price: 1 };
    } else if (sort === '-price') {
      sortOptions = { price: -1 };
    } else if (sort === 'createdAt') {
      sortOptions = { createdAt: -1 };
    }
    
    const products = await Product.find(query)
      .populate('seller', 'username avatar')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sortOptions);
    
    const total = await Product.countDocuments(query);
    
    res.json({ products, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'username avatar');
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 发布商品
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { name, description, price, category, location, images } = req.body;
    
    const product = new Product({
      name,
      description,
      price,
      category,
      location,
      images,
      seller: decoded.id
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 更新商品
router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.seller.toString() !== decoded.id) {
      return res.status(403).json({ message: '无权修改此商品' });
    }
    
    const { name, description, price, category, location, images, status } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (location) product.location = location;
    if (images) product.images = images;
    if (status) product.status = status;
    product.updatedAt = Date.now();
    
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.seller.toString() !== decoded.id) {
      return res.status(403).json({ message: '无权删除此商品' });
    }
    
    await product.remove();
    res.json({ message: '商品已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取用户发布的商品
router.get('/user/:userId', async (req, res) => {
  try {
    const products = await Product.find({ seller: req.params.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;