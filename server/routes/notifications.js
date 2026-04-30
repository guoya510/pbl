const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
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

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    let query = { userId: req.userId };
    if (type && ['system', 'transaction', 'reminder', 'message'].includes(type)) {
      query.type = type;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    
    res.json({
      notifications,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/unread', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.userId, 
      read: false 
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/read', async (req, res) => {
  try {
    const { notificationId } = req.body;
    
    if (notificationId) {
      const notification = await Notification.findOne({ 
        _id: notificationId, 
        userId: req.userId 
      });
      
      if (!notification) {
        return res.status(404).json({ message: '通知不存在' });
      }
      
      notification.read = true;
      await notification.save();
      res.json(notification);
    } else {
      await Notification.updateMany(
        { userId: req.userId, read: false },
        { read: true }
      );
      res.json({ message: '所有通知已标记为已读' });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }
    
    await notification.remove();
    res.json({ message: '通知已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;