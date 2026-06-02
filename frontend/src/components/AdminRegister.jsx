import React, { useState } from 'react';
import axios from 'axios';

const AdminRegister = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/users/admin/register', formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setSuccess(true);
      if (onRegister) {
        onRegister(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || '注册失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="admin-register-success">
        <div className="success-icon">✓</div>
        <h2>管理员账号创建成功！</h2>
        <p>您现在可以使用管理员权限访问管理后台</p>
        <button onClick={() => window.location.href = '/'} className="back-home-button">
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="admin-register-container">
      <div className="admin-register-card">
        <div className="admin-header">
          <h1>🛡️ 管理员注册</h1>
          <p>创建管理员账号以访问系统管理功能</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-register-form">
          <div className="form-group">
            <label htmlFor="username">
              <span className="label-icon">👤</span>
              用户名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名"
              required
              minLength={2}
              maxLength={20}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              邮箱
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入邮箱地址"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              密码
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码（至少6位）"
              required
              minLength={6}
            />
          </div>
          
          <button type="submit" className="admin-register-button" disabled={loading}>
            {loading ? '创建中...' : '🚀 创建管理员账号'}
          </button>
        </form>
        
        <div className="admin-notice">
          <h3>⚠️ 重要提示</h3>
          <ul>
            <li>管理员账号拥有系统最高权限</li>
            <li>请妥善保管管理员账号信息</li>
            <li>管理员可以审核商品、管理用户、查看统计数据</li>
            <li>建议使用强密码保护账号安全</li>
          </ul>
        </div>
        
        <div className="back-link">
          <a href="/">← 返回首页</a>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;