const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const MONGO_URI = 'mongodb://localhost:27017/campus-second-hand';

const newPassword = 'admin123';

async function resetAdminPassword() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('未找到管理员账户');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    console.log('管理员密码重置成功！');
    console.log('邮箱:', admin.email);
    console.log('新密码:', newPassword);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('重置密码失败:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();