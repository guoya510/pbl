const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { 
  scheduleReminder, 
  createCustomReminder, 
  scheduleDailyReminder, 
  scheduleWeeklyReminder 
} = require('../utils/notificationHelper');
const Product = require('../models/Product');
const Favorite = require('../models/Favorite');

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

router.post('/schedule', async (req, res) => {
  try {
    const { title, content, delayMinutes, relatedId } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '请提供标题和内容' });
    }
    
    await scheduleReminder(req.userId, title, content, delayMinutes || 60, relatedId);
    
    res.json({ message: '提醒已设置' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/daily', async (req, res) => {
  try {
    const { title, content, hour = 9, relatedId } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '请提供标题和内容' });
    }
    
    await scheduleDailyReminder(req.userId, title, content, hour, relatedId);
    
    res.json({ message: '每日提醒已设置' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/weekly', async (req, res) => {
  try {
    const { title, content, dayOfWeek = 1, hour = 9, relatedId } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '请提供标题和内容' });
    }
    
    await scheduleWeeklyReminder(req.userId, title, content, dayOfWeek, hour, relatedId);
    
    res.json({ message: '每周提醒已设置' });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/custom', async (req, res) => {
  try {
    const { title, content, relatedId } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '请提供标题和内容' });
    }
    
    const reminder = await createCustomReminder(req.userId, title, content, relatedId);
    
    res.json({ message: '提醒已创建', reminder });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/product-expiry', async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: '请提供商品ID' });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.seller.toString() !== req.userId) {
      return res.status(403).json({ message: '无权操作此商品' });
    }
    
    const reminder = await createProductExpiryReminder(req.userId, product);
    
    res.json({ message: '商品到期提醒已设置', reminder });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/favorite-price', async (req, res) => {
  try {
    const { productId, oldPrice, newPrice } = req.body;
    
    if (!productId || oldPrice === undefined || newPrice === undefined) {
      return res.status(400).json({ message: '请提供完整的商品信息和价格' });
    }
    
    const favorite = await Favorite.findOne({ user: req.userId, product: productId });
    
    if (!favorite) {
      return res.status(404).json({ message: '您未收藏此商品' });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (newPrice < oldPrice) {
      const reminder = await createFavoritePriceReminder(req.userId, product, oldPrice, newPrice);
      res.json({ message: '降价提醒已发送', reminder });
    } else {
      res.json({ message: '价格未下降，无需发送提醒' });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    res.json({
      dailyReminderEnabled: true,
      weeklyReminderEnabled: true,
      priceAlertEnabled: true,
      expiryAlertEnabled: true,
      preferences: {
        dailyReminderTime: 9,
        weeklyReminderDay: 1,
        weeklyReminderTime: 9,
        notificationSound: true,
        emailNotification: false
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { 
      dailyReminderEnabled, 
      weeklyReminderEnabled, 
      priceAlertEnabled, 
      expiryAlertEnabled,
      preferences 
    } = req.body;
    
    res.json({
      message: '提醒设置已更新',
      settings: {
        dailyReminderEnabled,
        weeklyReminderEnabled,
        priceAlertEnabled,
        expiryAlertEnabled,
        preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;