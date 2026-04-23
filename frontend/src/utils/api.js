import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
  getFollowers: () => api.get('/users/followers')
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
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data)
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

export default api;