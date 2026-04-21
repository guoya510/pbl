const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-second-hand', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('数据库连接成功'))
.catch(err => console.log('数据库连接失败:', err));

// 路由
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/favorites', require('./routes/favorites'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});