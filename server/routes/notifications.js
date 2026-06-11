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

const User = require('../models/User');

router.post('/admin/broadcast', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '请提供标题和内容' });
    }
    
    const currentUser = await User.findById(req.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: '无权限执行此操作' });
    }
    
    const users = await User.find({}, '_id');
    
    const notifications = users.map(user => ({
      userId: user._id,
      type: 'system',
      title,
      content,
      read: false,
      createdAt: Date.now()
    }));
    
    await Notification.insertMany(notifications);
    
    res.json({ 
      message: '系统公告发布成功',
      count: notifications.length 
    });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/admin/send-to-user', authenticateToken, async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    
    if (!userId || !title || !content) {
      return res.status(400).json({ message: '请提供用户ID、标题和内容' });
    }
    
    const currentUser = await User.findById(req.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: '无权限执行此操作' });
    }
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const notification = new Notification({
      userId,
      type: 'system',
      title,
      content,
      read: false
    });
    
    await notification.save();
    
    res.json({ message: '通知发送成功', notification });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/admin/list', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: '无权限执行此操作' });
    }
    
    const { page = 1, limit = 20 } = req.query;
    
    const notifications = await Notification.find({ type: 'system' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments({ type: 'system' });
    
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

module.exports = router;