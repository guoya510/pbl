const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = 'mongodb://localhost:27017/campus-second-hand';

const promoteUserToAdmin = async (username) => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ username });
    if (!user) {
      console.log(`用户 "${username}" 不存在`);
      await mongoose.disconnect();
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`用户 "${username}" 已成功升级为管理员！`);
    console.log(`用户名: ${user.username}`);
    console.log(`邮箱: ${user.email}`);
    console.log(`角色: ${user.role}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('升级管理员失败:', error.message);
    process.exit(1);
  }
};

promoteUserToAdmin('admin');