# 校园二手物品发布平台

## 项目简介

校园二手物品发布平台是一个专为在校学生设计的在线跳蚤市场，提供二手物品的发布、浏览、搜索、交易等功能，促进校园内的资源循环利用。

## 项目结构

```
校园二手发布平台/
├── frontend/           # 前端项目
│   ├── public/         # 静态资源
│   ├── src/            # 源代码
│   │   ├── assets/     # 资源文件
│   │   ├── components/ # 组件
│   │   ├── views/      # 页面
│   │   ├── utils/      # 工具函数
│   │   ├── App.jsx     # 主组件
│   │   ├── main.jsx    # 入口文件
│   │   ├── index.css   # 全局样式
│   │   └── App.css     # 组件样式
│   ├── index.html      # HTML模板
│   ├── vite.config.js  # Vite配置
│   └── package.json    # 前端依赖
├── server/             # 后端项目
│   ├── controllers/    # 控制器
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   ├── config/         # 配置
│   ├── index.js        # 主入口
│   └── package.json    # 后端依赖
├── .gitignore          # Git忽略文件
├── README.md           # 项目说明
└── 需求文档.md         # 需求文档
```

## 技术栈

### 前端
- React 18
- Vite
- React Router
- CSS3

### 后端
- Node.js
- Express
- MongoDB
- JWT
- Mongoose

## 快速开始

### 前端
1. 进入前端目录
   ```bash
   cd frontend
   ```
2. 安装依赖
   ```bash
   npm install
   ```
3. 启动开发服务器
   ```bash
   npm run dev
   ```

### 后端
1. 进入后端目录
   ```bash
   cd server
   ```
2. 安装依赖
   ```bash
   npm install
   ```
3. 启动服务器
   ```bash
   npm run dev
   ```

## 功能特性

### 用户管理
- 注册登录
- 个人信息管理
- 信用评级

### 商品管理
- 商品发布
- 商品编辑
- 商品列表展示
- 商品详情查看

### 搜索与筛选
- 关键词搜索
- 分类筛选
- 区域筛选

### 交易管理
- 商品咨询
- 交易方式选择
- 交易记录查看

### 通知系统
- 系统通知
- 交易通知
- 提醒功能

### 管理后台
- 用户管理
- 商品管理
- 交易管理
- 数据统计

## 数据库设计

### 用户表 (users)
- id: ObjectId
- username: String
- email: String
- password: String
- avatar: String
- phone: String
- gender: String
- creditScore: Number
- creditLevel: String
- createdAt: Date

### 商品表 (products)
- id: ObjectId
- name: String
- description: String
- price: Number
- category: String
- location: String
- images: Array
- status: String
- seller: ObjectId
- createdAt: Date
- updatedAt: Date

### 交易表 (transactions)
- id: ObjectId
- product: ObjectId
- buyer: ObjectId
- seller: ObjectId
- amount: Number
- paymentMethod: String
- status: String
- createdAt: Date
- updatedAt: Date

### 消息表 (messages)
- id: ObjectId
- sender: ObjectId
- receiver: ObjectId
- content: String
- read: Boolean
- createdAt: Date

## API接口

### 用户接口
- POST /api/users/register - 注册
- POST /api/users/login - 登录
- GET /api/users/profile - 获取用户信息
- PUT /api/users/profile - 更新用户信息

### 商品接口
- GET /api/products - 获取商品列表
- GET /api/products/:id - 获取商品详情
- POST /api/products - 发布商品
- PUT /api/products/:id - 更新商品
- DELETE /api/products/:id - 删除商品
- GET /api/products/user/:userId - 获取用户发布的商品

### 交易接口
- POST /api/transactions - 创建交易
- GET /api/transactions - 获取交易列表
- GET /api/transactions/:id - 获取交易详情
- PUT /api/transactions/:id - 更新交易状态

### 消息接口
- POST /api/messages - 发送消息
- GET /api/messages - 获取消息列表
- GET /api/messages/chat/:userId - 获取与特定用户的聊天记录
- PUT /api/messages/:id/read - 标记消息为已读
- DELETE /api/messages/:id - 删除消息

## 注意事项

1. 确保MongoDB服务已启动
2. 前端默认运行在 http://localhost:5173
3. 后端默认运行在 http://localhost:5000
4. 首次运行时，MongoDB会自动创建数据库和集合

## 许可证

MIT