const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const productsRouter = require('../routes/products');

const app = express();
app.use(express.json());
app.use('/api/products', productsRouter);

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ id: 'testUserId' })
}));

describe('Products API', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/campus-second-hand-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    
    // 创建测试用户
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await User.create({
      username: 'seller',
      email: 'seller@example.com',
      password: hashedPassword
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      jwt.verify.mockReturnValue({ id: testUser._id.toString() });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer testtoken')
        .send({
          name: '二手笔记本电脑',
          description: '9成新，配置良好',
          price: 2500,
          category: '电子产品',
          location: '北京',
          images: ['https://example.com/image1.jpg']
        });

      expect(response.status).toBe(201);
      expect(response.body.product.name).toBe('二手笔记本电脑');
      expect(response.body.product.price).toBe(2500);
      expect(response.body.product.seller.toString()).toBe(testUser._id.toString());
      expect(response.body.product.status).toBe('在售');
    });

    it('should return error without required fields', async () => {
      jwt.verify.mockReturnValue({ id: testUser._id.toString() });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer testtoken')
        .send({
          name: '测试商品'
          // 缺少价格等必填字段
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      // 创建测试商品
      await Product.create({
        name: '商品1',
        description: '描述1',
        price: 100,
        category: '电子产品',
        location: '北京',
        seller: testUser._id,
        status: '在售'
      });
      await Product.create({
        name: '商品2',
        description: '描述2',
        price: 200,
        category: '图书',
        location: '上海',
        seller: testUser._id,
        status: '在售'
      });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(2);
    });

    it('should filter products by category', async () => {
      await Product.create({
        name: '笔记本电脑',
        description: '描述',
        price: 1000,
        category: '电子产品',
        location: '北京',
        seller: testUser._id,
        status: '在售'
      });
      await Product.create({
        name: '教材',
        description: '描述',
        price: 50,
        category: '图书',
        location: '北京',
        seller: testUser._id,
        status: '在售'
      });

      const response = await request(app).get('/api/products?category=电子产品');

      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('笔记本电脑');
    });

    it('should search products by keyword', async () => {
      await Product.create({
        name: 'iPhone 14',
        description: '苹果手机',
        price: 5000,
        category: '电子产品',
        location: '北京',
        seller: testUser._id,
        status: '在售'
      });
      await Product.create({
        name: '华为手机',
        description: '国产手机',
        price: 3000,
        category: '电子产品',
        location: '上海',
        seller: testUser._id,
        status: '在售'
      });

      const response = await request(app).get('/api/products?search=iPhone');

      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('iPhone 14');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product by id', async () => {
      const product = await Product.create({
        name: '测试商品',
        description: '描述',
        price: 100,
        category: '电子产品',
        location: '北京',
        seller: testUser._id,
        status: '在售'
      });

      const response = await request(app).get(`/api/products/${product._id}`);

      expect(response.status).toBe(200);
      expect(response.body.product.name).toBe('测试商品');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/600000000000000000000000');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('商品不存在');
    });
  });

  describe('GET /api/products/user/:userId', () => {
    it('should return products by user', async () => {
      await Product.create({
        name: '用户商品1',
        description: '描述',
        price: 100,
        category: '电子产品',
        location: '北京',
        seller: testUser._id,
        status: '在售'
      });
      await Product.create({
        name: '用户商品2',
        description: '描述',
        price: 200,
        category: '图书',
        location: '上海',
        seller: testUser._id,
        status: '在售'
      });

      const response = await request(app).get(`/api/products/user/${testUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(2);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product', async () => {
      const product = await Product.create({
        name: '旧名称',
        description: '旧描述',
        price: 100,
        category: '电子产品',
        location: '北京',
        seller: testUser._id,
        status: '在售'
      });

      jwt.verify.mockReturnValue({ id: testUser._id.toString() });

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', 'Bearer testtoken')
        .send({
          name: '新名称',
          price: 200
        });

      expect(response.status).toBe(200);
      expect(response.body.product.name).toBe('新名称');
      expect(response.body.product.price).toBe(200);
    });

    it('should return error if not owner', async () => {
      // 创建另一个用户
      const otherUser = await User.create({
        username: 'other',
        email: 'other@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const product = await Product.create({
        name: '商品',
        description: '描述',
        price: 100,
        category: '电子产品',
        location: '北京',
        seller: testUser._id,
        status: '在售'
      });

      // 使用另一个用户的token尝试修改
      jwt.verify.mockReturnValue({ id: otherUser._id.toString() });

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', 'Bearer testtoken')
        .send({ name: '修改名称' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('无权修改此商品');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product', async () => {
      const product = await Product.create({
        name: '要删除的商品',
        description: '描述',
        price: 100,
        category: '电子产品',
        location: '北京',
        seller: testUser._id,
        status: '在售'
      });

      jwt.verify.mockReturnValue({ id: testUser._id.toString() });

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', 'Bearer testtoken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('商品删除成功');

      // 验证商品已删除
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });
  });

  describe('Admin Product Management', () => {
    let adminUser;

    beforeEach(async () => {
      // 创建管理员用户
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
    });

    describe('GET /api/products/admin/all', () => {
      it('should return all products for admin', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        await Product.create({
          name: '管理商品1',
          description: '描述',
          price: 100,
          category: '电子产品',
          location: '北京',
          seller: testUser._id,
          status: '在售'
        });

        const response = await request(app)
          .get('/api/products/admin/all')
          .set('Authorization', 'Bearer admintoken');

        expect(response.status).toBe(200);
        expect(response.body.products).toBeDefined();
        expect(Array.isArray(response.body.products)).toBe(true);
      });

      it('should filter products by status for admin', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        await Product.create({
          name: '在售商品',
          description: '描述',
          price: 100,
          category: '电子产品',
          seller: testUser._id,
          status: '在售'
        });

        await Product.create({
          name: '已下架商品',
          description: '描述',
          price: 200,
          category: '电子产品',
          seller: testUser._id,
          status: '已下架'
        });

        const response = await request(app)
          .get('/api/products/admin/all?status=已下架')
          .set('Authorization', 'Bearer admintoken');

        expect(response.status).toBe(200);
        expect(response.body.products).toHaveLength(1);
        expect(response.body.products[0].status).toBe('已下架');
      });

      it('should reject non-admin users', async () => {
        jwt.verify.mockReturnValue({ id: testUser._id.toString() });

        const response = await request(app)
          .get('/api/products/admin/all')
          .set('Authorization', 'Bearer usertoken');

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('管理员权限不足');
      });
    });

    describe('GET /api/products/admin/review/pending', () => {
      it('should return pending review products', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        await Product.create({
          name: '待审核商品',
          description: '描述',
          price: 100,
          category: '电子产品',
          seller: testUser._id,
          reviewStatus: '待审核'
        });

        const response = await request(app)
          .get('/api/products/admin/review/pending')
          .set('Authorization', 'Bearer admintoken');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('PUT /api/products/admin/review/:id', () => {
      it('should approve product', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        const product = await Product.create({
          name: '待审核商品',
          description: '描述',
          price: 100,
          category: '电子产品',
          seller: testUser._id,
          reviewStatus: '待审核',
          status: '在售'
        });

        const response = await request(app)
          .put(`/api/products/admin/review/${product._id}`)
          .set('Authorization', 'Bearer admintoken')
          .send({ reviewStatus: '已通过' });

        expect(response.status).toBe(200);
        expect(response.body.reviewStatus).toBe('已通过');
        expect(response.body.status).toBe('在售');
      });

      it('should reject product', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        const product = await Product.create({
          name: '违规商品',
          description: '描述',
          price: 100,
          category: '电子产品',
          seller: testUser._id,
          reviewStatus: '待审核',
          status: '在售'
        });

        const response = await request(app)
          .put(`/api/products/admin/review/${product._id}`)
          .set('Authorization', 'Bearer admintoken')
          .send({ 
            reviewStatus: '已拒绝',
            reviewReason: '含有违规内容'
          });

        expect(response.status).toBe(200);
        expect(response.body.reviewStatus).toBe('已拒绝');
        expect(response.body.status).toBe('已下架');
      });

      it('should reject with invalid review status', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        const product = await Product.create({
          name: '商品',
          description: '描述',
          price: 100,
          category: '电子产品',
          seller: testUser._id,
          reviewStatus: '待审核'
        });

        const response = await request(app)
          .put(`/api/products/admin/review/${product._id}`)
          .set('Authorization', 'Bearer admintoken')
          .send({ reviewStatus: '无效状态' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('无效的审核状态');
      });
    });

    describe('PUT /api/products/admin/offline/:id', () => {
      it('should offline product with reason', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        const product = await Product.create({
          name: '违规商品',
          description: '描述',
          price: 100,
          category: '电子产品',
          seller: testUser._id,
          status: '在售'
        });

        const response = await request(app)
          .put(`/api/products/admin/offline/${product._id}`)
          .set('Authorization', 'Bearer admintoken')
          .send({ reason: '违反平台规定' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('已下架');
        expect(response.body.reviewStatus).toBe('已拒绝');
        expect(response.body.reviewReason).toBe('违反平台规定');
      });
    });

    describe('PUT /api/products/admin/batch/offline', () => {
      it('should batch offline products', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        const product1 = await Product.create({
          name: '商品1',
          description: '描述',
          price: 100,
          category: '电子产品',
          seller: testUser._id,
          status: '在售'
        });

        const product2 = await Product.create({
          name: '商品2',
          description: '描述',
          price: 200,
          category: '电子产品',
          seller: testUser._id,
          status: '在售'
        });

        const response = await request(app)
          .put('/api/products/admin/batch/offline')
          .set('Authorization', 'Bearer admintoken')
          .send({ 
            ids: [product1._id, product2._id],
            reason: '批量违规'
          });

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('成功下架');

        // 验证商品已下架
        const p1 = await Product.findById(product1._id);
        const p2 = await Product.findById(product2._id);
        expect(p1.status).toBe('已下架');
        expect(p2.status).toBe('已下架');
      });

      it('should reject without ids', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        const response = await request(app)
          .put('/api/products/admin/batch/offline')
          .set('Authorization', 'Bearer admintoken')
          .send({ reason: '测试' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('请选择商品');
      });
    });

    describe('PUT /api/products/admin/batch/approve', () => {
      it('should batch approve products', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        const product1 = await Product.create({
          name: '待审核商品1',
          description: '描述',
          price: 100,
          category: '电子产品',
          seller: testUser._id,
          reviewStatus: '待审核'
        });

        const product2 = await Product.create({
          name: '待审核商品2',
          description: '描述',
          price: 200,
          category: '电子产品',
          seller: testUser._id,
          reviewStatus: '待审核'
        });

        const response = await request(app)
          .put('/api/products/admin/batch/approve')
          .set('Authorization', 'Bearer admintoken')
          .send({ ids: [product1._id, product2._id] });

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('成功审核通过');

        // 验证商品已通过审核
        const p1 = await Product.findById(product1._id);
        const p2 = await Product.findById(product2._id);
        expect(p1.reviewStatus).toBe('已通过');
        expect(p1.status).toBe('在售');
        expect(p2.reviewStatus).toBe('已通过');
        expect(p2.status).toBe('在售');
      });
    });

    describe('DELETE /api/products/admin/batch', () => {
      it('should batch delete products', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        const product1 = await Product.create({
          name: '删除商品1',
          description: '描述',
          price: 100,
          category: '电子产品',
          seller: testUser._id,
          status: '在售'
        });

        const product2 = await Product.create({
          name: '删除商品2',
          description: '描述',
          price: 200,
          category: '电子产品',
          seller: testUser._id,
          status: '在售'
        });

        const response = await request(app)
          .delete('/api/products/admin/batch')
          .set('Authorization', 'Bearer admintoken')
          .send({ ids: [product1._id, product2._id] });

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('成功删除');

        // 验证商品已删除
        const p1 = await Product.findById(product1._id);
        const p2 = await Product.findById(product2._id);
        expect(p1).toBeNull();
        expect(p2).toBeNull();
      });
    });

    describe('GET /api/products/admin/stats', () => {
      it('should return product statistics', async () => {
        jwt.verify.mockReturnValue({ id: adminUser._id.toString() });

        await Product.create({
          name: '在售商品',
          description: '描述',
          price: 100,
          category: '电子产品',
          seller: testUser._id,
          status: '在售'
        });

        await Product.create({
          name: '已售出商品',
          description: '描述',
          price: 200,
          category: '电子产品',
          seller: testUser._id,
          status: '已售出'
        });

        await Product.create({
          name: '已下架商品',
          description: '描述',
          price: 300,
          category: '电子产品',
          seller: testUser._id,
          status: '已下架'
        });

        const response = await request(app)
          .get('/api/products/admin/stats')
          .set('Authorization', 'Bearer admintoken');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('active');
        expect(response.body).toHaveProperty('sold');
        expect(response.body).toHaveProperty('offline');
        expect(response.body.total).toBe(3);
        expect(response.body.active).toBe(1);
        expect(response.body.sold).toBe(1);
        expect(response.body.offline).toBe(1);
      });
    });
  });
});
