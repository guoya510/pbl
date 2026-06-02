const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
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

router.get('/', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    // 获取今日日期范围
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 获取本周日期范围
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // 获取本月日期范围
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // 商品统计
    const totalProducts = await Product.countDocuments();
    const todayProducts = await Product.countDocuments({ 
      createdAt: { $gte: today, $lt: tomorrow } 
    });
    const weeklyProducts = await Product.countDocuments({ 
      createdAt: { $gte: weekStart, $lt: weekEnd } 
    });
    const monthlyProducts = await Product.countDocuments({ 
      createdAt: { $gte: monthStart, $lt: monthEnd } 
    });

    // 交易统计
    const totalTransactions = await Transaction.countDocuments();
    const todayTransactions = await Transaction.countDocuments({ 
      createdAt: { $gte: today, $lt: tomorrow } 
    });
    const weeklyTransactions = await Transaction.countDocuments({ 
      createdAt: { $gte: weekStart, $lt: weekEnd } 
    });
    const monthlyTransactions = await Transaction.countDocuments({ 
      createdAt: { $gte: monthStart, $lt: monthEnd } 
    });

    // 计算交易总额
    const totalRevenue = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    // 用户统计
    const totalUsers = await User.countDocuments();
    const todayUsers = await User.countDocuments({ 
      createdAt: { $gte: today, $lt: tomorrow } 
    });
    const weeklyUsers = await User.countDocuments({ 
      createdAt: { $gte: weekStart, $lt: weekEnd } 
    });
    const monthlyUsers = await User.countDocuments({ 
      createdAt: { $gte: monthStart, $lt: monthEnd } 
    });

    // 活跃用户统计（30天内有登录）
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // 在售商品数量
    const activeProducts = await Product.countDocuments({ status: '在售' });

    // 待审核商品
    const pendingReviewProducts = await Product.countDocuments({ reviewStatus: '待审核' });

    // 已完成交易
    const completedTransactions = await Transaction.countDocuments({ status: '已完成' });

    // 获取最近7天的交易趋势数据
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayTransactions = await Transaction.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });
      const dayRevenue = await Transaction.aggregate([
        { $match: { createdAt: { $gte: date, $lt: nextDate } } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]);
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        transactions: dayTransactions,
        revenue: dayRevenue[0]?.total || 0
      });
    }

    // 获取商品分类统计
    const categoryStats = await Product.aggregate([
      { $match: { status: '在售' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          active: activeProducts,
          pendingReview: pendingReviewProducts,
          today: todayProducts,
          weekly: weeklyProducts,
          monthly: monthlyProducts,
          categories: categoryStats
        },
        transactions: {
          total: totalTransactions,
          completed: completedTransactions,
          today: todayTransactions,
          weekly: weeklyTransactions,
          monthly: monthlyTransactions,
          revenue: totalRevenue[0]?.total || 0,
          last7Days: last7Days
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          today: todayUsers,
          weekly: weeklyUsers,
          monthly: monthlyUsers
        }
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;