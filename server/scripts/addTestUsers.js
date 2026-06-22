const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/campus_sell', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const testUsers = [
  {
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    password: '123456',
    location: '南区宿舍',
    creditScore: 100,
    role: '普通用户'
  },
  {
    username: 'lisi',
    email: 'lisi@example.com',
    phone: '13800138002',
    password: '123456',
    location: '北区宿舍',
    creditScore: 100,
    role: '普通用户'
  },
  {
    username: 'wangwu',
    email: 'wangwu@example.com',
    phone: '13800138003',
    password: '123456',
    location: '东区宿舍',
    creditScore: 100,
    role: '普通用户'
  },
  {
    username: 'zhaoliu',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    password: '123456',
    location: '西区宿舍',
    creditScore: 100,
    role: '普通用户'
  },
  {
    username: 'sunqi',
    email: 'sunqi@example.com',
    phone: '13800138005',
    password: '123456',
    location: '南区宿舍',
    creditScore: 100,
    role: '普通用户'
  },
  {
    username: 'zhouba',
    email: 'zhouba@example.com',
    phone: '13800138006',
    password: '123456',
    location: '北区宿舍',
    creditScore: 100,
    role: '普通用户'
  },
  {
    username: 'wujiu',
    email: 'wujiu@example.com',
    phone: '13800138007',
    password: '123456',
    location: '东区宿舍',
    creditScore: 100,
    role: '普通用户'
  },
  {
    username: 'zhengshi',
    email: 'zhengshi@example.com',
    phone: '13800138008',
    password: '123456',
    location: '西区宿舍',
    creditScore: 100,
    role: '普通用户'
  }
];

async function addUsers() {
  try {
    await User.deleteMany({});
    await User.insertMany(testUsers);
    console.log(`Added ${testUsers.length} users`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addUsers();