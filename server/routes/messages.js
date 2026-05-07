const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
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
    const { receiver, content } = req.body;
    
    if (!receiver || !content) {
      return res.status(400).json({ message: '请提供接收者和消息内容' });
    }
    
    const message = new Message({
      sender: req.userId,
      receiver,
      content
    });
    
    await message.save();
    await message.populate('sender', 'username');
    await message.populate('receiver', 'username');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ 
      $or: [{ sender: req.userId }, { receiver: req.userId }] 
    })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/chat/:userId', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ 
      $or: [
        { sender: req.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.userId }
      ] 
    })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: '消息不存在' });
    }
    
    if (message.receiver.toString() !== req.userId) {
      return res.status(403).json({ message: '无权操作此消息' });
    }
    
    message.read = true;
    await message.save();
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: '消息不存在' });
    }
    
    if (message.sender.toString() !== req.userId && message.receiver.toString() !== req.userId) {
      return res.status(403).json({ message: '无权删除此消息' });
    }
    
    await message.remove();
    res.json({ message: '消息已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;