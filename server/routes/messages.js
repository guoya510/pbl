const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

// 发送消息
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { receiver, content } = req.body;
    
    if (!receiver || !content) {
      return res.status(400).json({ message: '请提供接收者和消息内容' });
    }
    
    const message = new Message({
      sender: decoded.id,
      receiver,
      content
    });
    
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取消息列表
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const messages = await Message.find({ 
      $or: [{ sender: decoded.id }, { receiver: decoded.id }] 
    })
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar')
    .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取与特定用户的聊天记录
router.get('/chat/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const messages = await Message.find({ 
      $or: [
        { sender: decoded.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: decoded.id }
      ] 
    })
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar')
    .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 标记消息为已读
router.put('/:id/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: '消息不存在' });
    }
    
    if (message.receiver.toString() !== decoded.id) {
      return res.status(403).json({ message: '无权操作此消息' });
    }
    
    message.read = true;
    await message.save();
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 删除消息
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: '消息不存在' });
    }
    
    if (message.sender.toString() !== decoded.id && message.receiver.toString() !== decoded.id) {
      return res.status(403).json({ message: '无权删除此消息' });
    }
    
    await message.remove();
    res.json({ message: '消息已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;