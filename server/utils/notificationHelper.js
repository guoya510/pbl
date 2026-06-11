const Notification = require('../models/Notification');

const createNotification = async (userId, type, title, content, relatedId = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      content,
      relatedId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('创建通知失败:', error);
    return null;
  }
};

const createTransactionNotification = async (userId, transaction, action) => {
  const title = '交易状态变更';
  let content = '';
  
  switch (action) {
    case 'created':
      content = `您发起的交易已创建，商品：${transaction.product?.name || '未知商品'}`;
      break;
    case 'status_changed':
      content = `您的交易状态已更新为：${transaction.status}`;
      break;
    case 'completed':
      content = `交易已完成，感谢您的使用！`;
      break;
    case 'cancelled':
      content = `交易已取消`;
      break;
    case 'seller_notify':
      content = `有用户想要购买您的商品：${transaction.product?.name || '未知商品'}`;
      break;
    default:
      content = `交易状态发生变化`;
  }
  
  return await createNotification(userId, 'transaction', title, content, transaction._id);
};

const createSystemNotification = async (title, content) => {
  try {
    const User = require('../models/User');
    const users = await User.find({}, '_id');
    
    const notifications = await Promise.all(
      users.map(user => 
        createNotification(user._id, 'system', title, content)
      )
    );
    
    return notifications.filter(n => n !== null);
  } catch (error) {
    console.error('创建系统通知失败:', error);
    return [];
  }
};

const createReminderNotification = async (userId, title, content, relatedId = null) => {
  return await createNotification(userId, 'reminder', title, content, relatedId);
};

const createTransactionReminder = async (userId, transactionId, reminderType) => {
  const title = '交易提醒';
  let content = '';
  
  switch (reminderType) {
    case 'payment_due':
      content = '您有一笔交易待付款，请尽快完成支付';
      break;
    case 'shipment_due':
      content = '您有一笔交易待发货，请及时处理';
      break;
    case 'delivery_due':
      content = '您购买的商品已发货，请留意物流信息';
      break;
    case 'confirm_delivery':
      content = '您的商品已送达，请确认收货';
      break;
    case 'review_due':
      content = '交易已完成，请对卖家进行评价';
      break;
    case 'expiring':
      content = '您的交易即将到期，请及时处理';
      break;
    default:
      content = '您有一条交易提醒';
  }
  
  return await createReminderNotification(userId, title, content, transactionId);
};

const scheduleReminder = async (userId, title, content, delayMinutes, relatedId = null) => {
  setTimeout(async () => {
    await createReminderNotification(userId, title, content, relatedId);
  }, delayMinutes * 60 * 1000);
};

const createProductExpiryReminder = async (userId, product) => {
  const title = '商品发布到期提醒';
  const content = `您发布的商品「${product.name}」即将到期，请及时处理或重新发布`;
  return await createReminderNotification(userId, title, content, product._id);
};

const createFavoritePriceReminder = async (userId, product, oldPrice, newPrice) => {
  const discount = Math.round((1 - newPrice / oldPrice) * 100);
  const title = '收藏商品降价提醒';
  const content = `您收藏的商品「${product.name}」降价了！原价¥${oldPrice}，现价¥${newPrice}，优惠${discount}%`;
  return await createReminderNotification(userId, title, content, product._id);
};

const createCustomReminder = async (userId, title, content, relatedId = null) => {
  return await createReminderNotification(userId, title, content, relatedId);
};

const scheduleDailyReminder = async (userId, title, content, hour = 9, relatedId = null) => {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const delayMinutes = Math.floor((target - now) / 60000);
  
  setTimeout(async () => {
    await createReminderNotification(userId, title, content, relatedId);
    scheduleDailyReminder(userId, title, content, hour, relatedId);
  }, delayMinutes * 60 * 1000);
};

const scheduleWeeklyReminder = async (userId, title, content, dayOfWeek = 1, hour = 9, relatedId = null) => {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  
  const daysUntil = (dayOfWeek - now.getDay() + 7) % 7;
  if (daysUntil === 0 && now > target) {
    target.setDate(target.getDate() + 7);
  } else {
    target.setDate(target.getDate() + daysUntil);
  }
  
  const delayMinutes = Math.floor((target - now) / 60000);
  
  setTimeout(async () => {
    await createReminderNotification(userId, title, content, relatedId);
    scheduleWeeklyReminder(userId, title, content, dayOfWeek, hour, relatedId);
  }, delayMinutes * 60 * 1000);
};

const cancelScheduledReminder = (timerId) => {
  if (timerId) {
    clearTimeout(timerId);
    return true;
  }
  return false;
};

module.exports = {
  createNotification,
  createTransactionNotification,
  createSystemNotification,
  createReminderNotification,
  createTransactionReminder,
  scheduleReminder,
  createProductExpiryReminder,
  createFavoritePriceReminder,
  createCustomReminder,
  scheduleDailyReminder,
  scheduleWeeklyReminder,
  cancelScheduledReminder
};
