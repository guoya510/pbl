const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }
    
    // 创建新用户
    const user = new User({ username, email, password });
    await user.save();
    
    // 生成token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }
    
    // 验证密码
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }
    
    // 生成token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取用户信息
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 更新用户信息
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const { avatar, phone, gender } = req.body;
    if (avatar) user.avatar = avatar;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 关注用户
router.post('/follow/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const currentUser = await User.findById(decoded.id);
    const userToFollow = await User.findById(req.params.userId);
    
    if (!currentUser || !userToFollow) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    if (currentUser._id.toString() === userToFollow._id.toString()) {
      return res.status(400).json({ message: '不能关注自己' });
    }
    
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: '已经关注了该用户' });
    }
    
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);
    
    await currentUser.save();
    await userToFollow.save();
    
    res.json({ message: '关注成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 取消关注用户
router.post('/unfollow/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const currentUser = await User.findById(decoded.id);
    const userToUnfollow = await User.findById(req.params.userId);
    
    if (!currentUser || !userToUnfollow) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ message: '未关注该用户' });
    }
    
    currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());
    
    await currentUser.save();
    await userToUnfollow.save();
    
    res.json({ message: '取消关注成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取当前用户关注的人
router.get('/following', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).populate('following', '-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取当前用户的粉丝
router.get('/followers', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).populate('followers', '-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;