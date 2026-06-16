const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const usersRouter = require('../routes/users');

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

// Mock jwt验证
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ id: 'testUserId' })
}));

describe('Users API', () => {
  let connection;

  beforeAll(async () => {
    // 连接测试数据库
    connection = await mongoose.connect('mongodb://localhost:27017/campus-second-hand-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // 清理测试数据库
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return error if email already exists', async () => {
      // 先注册一个用户
      await request(app)
        .post('/api/users/register')
        .send({
          username: 'user1',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      // 再次使用相同邮箱注册
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'password456'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('用户已存在');
    });

    it('should return error if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser'
          // 缺少email和password
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('请填写完整信息');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login with correct credentials', async () => {
      // 先注册用户
      await request(app)
        .post('/api/users/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123'
        });

      // 登录
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('_id');
    });

    it('should return error with incorrect password', async () => {
      // 先注册用户
      await request(app)
        .post('/api/users/register')
        .send({
          username: 'wrongpwd',
          email: 'wrongpwd@example.com',
          password: 'password123'
        });

      // 使用错误密码登录
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'wrongpwd@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('邮箱或密码错误');
    });

    it('should return error if email not found', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('邮箱或密码错误');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile', async () => {
      // 创建测试用户
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        username: 'profileuser',
        email: 'profile@example.com',
        password: hashedPassword
      });

      // Mock jwt验证返回正确的用户ID
      jwt.verify.mockReturnValue({ id: user._id.toString() });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('profileuser');
      expect(response.body.user.email).toBe('profile@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('未授权');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      // 创建测试用户
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        username: 'updateuser',
        email: 'update@example.com',
        password: hashedPassword
      });

      jwt.verify.mockReturnValue({ id: user._id.toString() });

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer testtoken')
        .send({
          username: 'newname',
          phone: '13800138000',
          gender: '男',
          location: '北京'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('newname');
      expect(response.body.user.phone).toBe('13800138000');
      expect(response.body.user.gender).toBe('男');
      expect(response.body.user.location).toBe('北京');
    });
  });

  describe('POST /api/users/follow/:userId', () => {
    it('should follow another user', async () => {
      // 创建两个用户
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user1 = await User.create({
        username: 'follower',
        email: 'follower@example.com',
        password: hashedPassword
      });
      const user2 = await User.create({
        username: 'followee',
        email: 'followee@example.com',
        password: hashedPassword
      });

      jwt.verify.mockReturnValue({ id: user1._id.toString() });

      const response = await request(app)
        .post(`/api/users/follow/${user2._id}`)
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('关注成功');

      // 验证关注关系已建立
      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);
      expect(updatedUser1.following).toContain(user2._id);
      expect(updatedUser2.followers).toContain(user1._id);
    });

    it('should return error when following oneself', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        username: 'selfuser',
        email: 'self@example.com',
        password: hashedPassword
      });

      jwt.verify.mockReturnValue({ id: user._id.toString() });

      const response = await request(app)
        .post(`/api/users/follow/${user._id}`)
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('不能关注自己');
    });
  });

  describe('POST /api/users/unfollow/:userId', () => {
    it('should unfollow a user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user1 = await User.create({
        username: 'unfollower',
        email: 'unfollower@example.com',
        password: hashedPassword,
        following: []
      });
      const user2 = await User.create({
        username: 'unfollowee',
        email: 'unfollowee@example.com',
        password: hashedPassword,
        followers: []
      });

      // 先建立关注关系
      user1.following.push(user2._id);
      user2.followers.push(user1._id);
      await user1.save();
      await user2.save();

      jwt.verify.mockReturnValue({ id: user1._id.toString() });

      const response = await request(app)
        .post(`/api/users/unfollow/${user2._id}`)
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('取消关注成功');

      // 验证关注关系已取消
      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);
      expect(updatedUser1.following).not.toContain(user2._id);
      expect(updatedUser2.followers).not.toContain(user1._id);
    });
  });
});
