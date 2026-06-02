const express = require('express');
const router = express.Router();
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

const authenticateAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: '管理员权限不足' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: '服务器内部错误' });
  }
};

router.get('/', async (req, res) => {
  try {
    const { keyword, category, campus, building, minPrice, maxPrice, sort = 'createdAt', page = 1, limit = 20 } = req.query;
    
    let query = { status: '在售' };
    let orConditions = [];
    let andConditions = [];
    
    if (keyword) {
      orConditions.push({ name: { $regex: keyword, $options: 'i' } });
      orConditions.push({ description: { $regex: keyword, $options: 'i' } });
    }
    
    if (category) {
      query.category = category;
    }
    
    if (campus) {
      const campusKeywords = {
        '东校区': ['东', '东区', '东校'],
        '西校区': ['西', '西区', '西校'],
        '南校区': ['南', '南区', '南校'],
        '北校区': ['北', '北区', '北校']
      };
      
      const keywords = campusKeywords[campus] || [campus];
      const campusConditions = [];
      
      keywords.forEach(keyword => {
        campusConditions.push({ campus: { $regex: keyword, $options: 'i' } });
        campusConditions.push({ location: { $regex: keyword, $options: 'i' } });
      });
      
      andConditions.push({ $or: campusConditions });
    }
    
    if (building) {
      andConditions.push({
        $or: [
          { building: { $regex: building, $options: 'i' } },
          { location: { $regex: building, $options: 'i' } }
        ]
      });
    }
    
    if (orConditions.length > 0) {
      query.$or = orConditions;
    }
    
    if (andConditions.length > 0) {
      if (query.$or) {
        const originalOr = query.$or;
        delete query.$or;
        andConditions.push({ $or: originalOr });
      }
      query.$and = andConditions;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
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
    const user = await User.findById(req.userId);
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.seller.toString() !== req.userId && user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除此商品' });
    }
    
    // 使用findByIdAndDelete替代已废弃的remove()方法
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: '商品已删除' });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({ message: '服务器内部错误: ' + error.message });
  }
});

router.get('/admin/all', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { keyword, category, status, reviewStatus, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (reviewStatus) {
      query.reviewStatus = reviewStatus;
    }
    
    const products = await Product.find(query)
      .populate('seller', 'username email')
      .sort(sort)
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
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/admin/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('seller', 'username');
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    res.json(product);
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

router.get('/admin/review/pending', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const products = await Product.find({ reviewStatus: '待审核' })
      .populate('seller', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/admin/review/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { reviewStatus, reviewReason } = req.body;
    
    if (!['已通过', '已拒绝'].includes(reviewStatus)) {
      return res.status(400).json({ message: '无效的审核状态' });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        reviewStatus,
        reviewReason: reviewReason || '',
        status: reviewStatus === '已通过' ? '在售' : '已下架'
      },
      { new: true }
    ).populate('seller', 'username');
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/admin/offline/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        status: '已下架',
        reviewStatus: '已拒绝',
        reviewReason: reason || '违规商品'
      },
      { new: true }
    ).populate('seller', 'username');
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/admin/batch/offline', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { ids, reason } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: '请选择商品' });
    }
    
    await Product.updateMany(
      { _id: { $in: ids } },
      { 
        status: '已下架',
        reviewStatus: '已拒绝',
        reviewReason: reason || '批量下架'
      }
    );
    
    res.json({ message: `成功下架 ${ids.length} 件商品` });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/admin/batch/approve', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: '请选择商品' });
    }
    
    await Product.updateMany(
      { _id: { $in: ids } },
      { 
        status: '在售',
        reviewStatus: '已通过',
        reviewReason: ''
      }
    );
    
    res.json({ message: `成功审核通过 ${ids.length} 件商品` });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/admin/batch', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: '请选择商品' });
    }
    
    await Product.deleteMany({ _id: { $in: ids } });
    
    res.json({ message: `成功删除 ${ids.length} 件商品` });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/admin/stats', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const active = await Product.countDocuments({ status: '在售' });
    const sold = await Product.countDocuments({ status: '已售出' });
    const offline = await Product.countDocuments({ status: '已下架' });
    const pending = await Product.countDocuments({ reviewStatus: '待审核' });
    const approved = await Product.countDocuments({ reviewStatus: '已通过' });
    const rejected = await Product.countDocuments({ reviewStatus: '已拒绝' });
    
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Product.countDocuments({ createdAt: { $gte: today } });
    
    res.json({
      total,
      active,
      sold,
      offline,
      pending,
      approved,
      rejected,
      todayCount,
      categories
    });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/admin/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;