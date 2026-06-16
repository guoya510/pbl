const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const MONGO_URI = 'mongodb://localhost:27017/campus-second-hand';

const adminData = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('管理员账户已存在:', adminData.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    const admin = new User({
      ...adminData,
      password: hashedPassword
    });

    await admin.save();
    console.log('管理员账户创建成功！');
    console.log('邮箱:', adminData.email);
    console.log('密码:', adminData.password);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('创建管理员失败:', error.message);
    process.exit(1);
  }
}

createAdmin();