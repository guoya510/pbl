import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response) {
      // 处理错误响应
      console.error('API Error:', error.response.data);
      
      // 处理token失效（403错误）
      if (error.response.status === 403 && error.response.data?.message === '无效的token') {
        // 清除本地存储中的token和用户信息
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 提示用户重新登录
        alert('登录已过期，请重新登录');
        
        // 跳转到登录页面
        window.location.href = '/auth';
      }
    } else if (error.request) {
      // 处理网络错误
      console.error('Network Error:', error.request);
    } else {
      // 处理其他错误
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 用户相关API
export const userApi = {
  // 注册
  register: (data) => api.post('/users/register', data),
  // 登录
  login: (data) => api.post('/users/login', data),
  // 获取用户信息
  getProfile: () => api.get('/users/profile'),
  // 更新用户信息
  updateProfile: (data) => api.put('/users/profile', data),
  // 修改密码
  updatePassword: (data) => api.put('/users/password', data),
  // 关注用户
  followUser: (userId) => api.post(`/users/follow/${userId}`),
  // 取消关注用户
  unfollowUser: (userId) => api.post(`/users/unfollow/${userId}`),
  // 获取关注列表
  getFollowing: () => api.get('/users/following'),
  // 获取粉丝列表
  getFollowers: () => api.get('/users/followers'),
  // 获取当前用户信用评级
  getCredit: () => api.get('/users/credit'),
  // 获取指定用户信用评级
  getUserCredit: (userId) => api.get(`/users/${userId}/credit`),
  // 获取指定用户信息
  getUserInfo: (userId) => api.get(`/users/${userId}`)
};

// 商品相关API
export const productApi = {
  // 获取商品列表
  getProducts: (params) => api.get('/products', { params }),
  // 获取商品详情
  getProduct: (id) => api.get(`/products/${id}`),
  // 发布商品
  createProduct: (data) => api.post('/products', data),
  // 更新商品
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  // 删除商品
  deleteProduct: (id) => api.delete(`/products/${id}`),
  // 获取用户发布的商品
  getUserProducts: (userId) => api.get(`/products/user/${userId}`)
};

// 收藏相关API
export const favoriteApi = {
  // 收藏商品
  addFavorite: (productId) => api.post('/favorites', { productId }),
  // 取消收藏
  removeFavorite: (productId) => api.delete(`/favorites/${productId}`),
  // 获取用户的收藏列表
  getUserFavorites: () => api.get('/favorites/user'),
  // 检查商品是否已收藏
  checkFavorite: (productId) => api.get(`/favorites/check/${productId}`)
};

// 交易相关API
export const transactionApi = {
  // 创建交易
  createTransaction: (data) => api.post('/transactions', data),
  // 获取交易列表
  getTransactions: () => api.get('/transactions'),
  // 获取交易详情
  getTransaction: (id) => api.get(`/transactions/${id}`),
  // 更新交易状态
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  // 确认付款
  confirmPayment: (id) => api.put(`/transactions/${id}/confirm-payment`),
  // 确认发货
  confirmShipping: (id) => api.put(`/transactions/${id}/confirm-shipping`),
  // 确认收货
  confirmReceipt: (id) => api.put(`/transactions/${id}/confirm-receipt`)
};

// 消息相关API
export const messageApi = {
  // 发送消息
  sendMessage: (data) => api.post('/messages', data),
  // 获取消息列表
  getMessages: () => api.get('/messages'),
  // 获取与特定用户的聊天记录
  getChat: (userId) => api.get(`/messages/chat/${userId}`),
  // 标记消息为已读
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  // 删除消息
  deleteMessage: (id) => api.delete(`/messages/${id}`)
};

// 通知相关API
export const notificationApi = {
  // 获取通知列表
  getNotifications: (params) => api.get('/notifications', { params }),
  // 获取未读通知数量
  getUnreadCount: () => api.get('/notifications/unread'),
  // 标记通知为已读
  markAsRead: (notificationId) => api.put('/notifications/read', { notificationId }),
  // 标记所有通知为已读
  markAllAsRead: () => api.put('/notifications/read'),
  // 删除通知
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  // 管理员发布系统公告
  broadcast: (data) => api.post('/notifications/admin/broadcast', data),
  // 管理员发送通知给指定用户
  sendToUser: (data) => api.post('/notifications/admin/send-to-user', data),
  // 管理员获取系统通知列表
  getAdminNotifications: (params) => api.get('/notifications/admin/list', { params })
};

// 管理员相关API
export const adminApi = {
  // 获取统计数据
  getStats: () => api.get('/stats'),
  // 获取待审核商品
  getPendingReviews: () => api.get('/products/admin/review/pending'),
  // 审核商品
  reviewProduct: (id, data) => api.put(`/products/admin/review/${id}`, data),
  // 下架商品
  offlineProduct: (id, data) => api.put(`/products/admin/offline/${id}`, data),
  // 获取所有商品（管理）
  getAllProducts: (params) => api.get('/products/admin/all', { params }),
  // 获取商品统计
  getProductStats: () => api.get('/products/admin/stats'),
  // 获取商品分类
  getCategories: () => api.get('/products/admin/categories'),
  // 批量审核通过
  batchApprove: (data) => api.put('/products/admin/batch/approve', data),
  // 批量下架
  batchOffline: (data) => api.put('/products/admin/batch/offline', data),
  // 批量删除商品
  batchDeleteProducts: (data) => api({
    method: 'delete',
    url: '/products/admin/batch',
    data: data
  }),
  // 删除商品
  deleteProduct: (id) => api.delete(`/products/${id}`),
  // 获取所有用户（管理）
  getAllUsers: (params) => api.get('/users/admin/users', { params }),
  // 获取用户统计
  getUserStats: () => api.get('/users/admin/users/stats'),
  // 更新用户信息
  updateUser: (id, data) => api.put(`/users/admin/users/${id}`, data),
  // 删除用户
  deleteUser: (id) => api.delete(`/users/admin/users/${id}`),
  // 管理员注册
  adminRegister: (data) => api.post('/users/admin/register', data)
};

export default api;