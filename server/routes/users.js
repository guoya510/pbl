const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: '请填写完整信息' });
    }
    
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: '用户已存在' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: '请填写邮箱和密码' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, email, avatar },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: '旧密码错误' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.userId === userId) {
      return res.status(400).json({ message: '不能关注自己' });
    }
    
    const user = await User.findById(req.userId);
    const targetUser = await User.findById(userId);
    
    if (!user || !targetUser) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    if (user.following.includes(userId)) {
      return res.status(400).json({ message: '已关注该用户' });
    }
    
    user.following.push(userId);
    targetUser.followers.push(req.userId);
    
    await user.save();
    await targetUser.save();
    
    res.json({ message: '关注成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/unfollow/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(req.userId);
    const targetUser = await User.findById(userId);
    
    if (!user || !targetUser) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    user.following = user.following.filter(id => id.toString() !== userId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.userId);
    
    await user.save();
    await targetUser.save();
    
    res.json({ message: '取消关注成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/following', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('following', 'username avatar');
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/followers', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('followers', 'username avatar');
    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/credit', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('creditScore creditLevel');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({
      creditScore: user.creditScore,
      creditLevel: user.creditLevel
    });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/:userId/credit', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('creditScore creditLevel username');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({
      username: user.username,
      creditScore: user.creditScore,
      creditLevel: user.creditLevel
    });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/admin/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: '请填写完整信息' });
    }
    
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: '用户已存在' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('创建管理员错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/admin/users', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/admin/users/:userId', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { role, creditScore } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role, creditScore },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/admin/users/:userId', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ message: '不能删除管理员账户' });
    }
    
    await user.remove();
    res.json({ message: '用户已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;