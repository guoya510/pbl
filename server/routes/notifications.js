const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
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

router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.userId, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } else {
      await Notification.updateMany({ userId: req.userId }, { read: true });
    }
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }
    if (notification.userId.toString() !== req.userId) {
      return res.status(403).json({ message: '无权删除此通知' });
    }
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/admin/broadcast', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    const users = await User.find({}, '_id');
    
    const notifications = users.map(user => ({
      userId: user._id,
      type: 'system',
      title,
      content,
      relatedId: null
    }));
    
    await Notification.insertMany(notifications);
    res.json({ message: `成功发送 ${users.length} 条通知` });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/admin/send-to-user', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { userId, title, content, relatedId } = req.body;
    
    const notification = await Notification.create({
      userId,
      type: 'system',
      title,
      content,
      relatedId
    });
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/admin/list', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments();
    res.json({ notifications, total });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;
