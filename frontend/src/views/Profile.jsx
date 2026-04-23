import React, { useState, useEffect } from 'react';
import { productApi, userApi, transactionApi, messageApi } from '../utils/api';

const Profile = ({ user, onUserUpdate }) => {
  const [userInfo, setUserInfo] = useState(user);
  const [myProducts, setMyProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [editForm, setEditForm] = useState({
    username: '',
    phone: '',
    location: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchMyProducts();
    fetchTransactions();
    fetchMessages();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await userApi.getProfile();
      setUserInfo(data.user);
    } catch (err) {
      setError('获取用户信息失败');
    }
  };

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getUserProducts(user._id);
      setMyProducts(data.products);
    } catch (err) {
      setError('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditForm({
      username: userInfo.username,
      phone: userInfo.phone || '',
      location: userInfo.location || ''
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const data = await userApi.updateProfile(editForm);
      setUserInfo(data.user);
      setEditing(false);
      // 更新本地存储中的用户信息
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      setError('更新用户信息失败');
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchTransactions = async () => {
    try {
      const data = await transactionApi.getTransactions();
      setTransactions(data.transactions);
    } catch (err) {
      console.error('获取交易记录失败:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await messageApi.getMessages();
      setMessages(data.messages);
    } catch (err) {
      console.error('获取消息失败:', err);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码长度至少为6位');
      return;
    }

    try {
      await userApi.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess('密码修改成功');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      // 3秒后清除成功提示
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError('密码修改失败，请检查当前密码是否正确');
    }
  };

  const handlePasswordCancel = () => {
    setChangingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <h1>个人中心</h1>
      
      {/* 标签页导航 */}
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          个人信息
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          我的商品
        </button>
        <button 
          className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          交易记录
          {transactions.filter(t => t.status === '待处理').length > 0 && (
            <span className="badge">{transactions.filter(t => t.status === '待处理').length}</span>
          )}
        </button>
        <button 
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          消息通知
          {messages.filter(m => !m.read).length > 0 && (
            <span className="badge">{messages.filter(m => !m.read).length}</span>
          )}
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          密码修改
        </button>
      </div>

      {/* 个人信息标签页 */}
      {activeTab === 'info' && (
        <div className="profile-card">
          <div className="profile-header">
            <h2>个人信息</h2>
            {!editing && (
              <button className="edit-button" onClick={handleEdit}>
                编辑资料
              </button>
            )}
          </div>
          
          {editing ? (
            <div className="profile-form">
              <div className="form-group">
                <label>用户名</label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input
                  type="email"
                  value={userInfo.email}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>电话</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>所在地</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button className="cancel-button" onClick={handleCancel}>
                  取消
                </button>
                <button className="submit-button" onClick={handleSave}>
                  保存
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <span className="label">用户名：</span>
                <span className="value">{userInfo.username}</span>
              </div>
              <div className="info-item">
                <span className="label">邮箱：</span>
                <span className="value">{userInfo.email}</span>
              </div>
              <div className="info-item">
                <span className="label">电话：</span>
                <span className="value">{userInfo.phone || '未设置'}</span>
              </div>
              <div className="info-item">
                <span className="label">所在地：</span>
                <span className="value">{userInfo.location || '未设置'}</span>
              </div>
              <div className="info-item">
                <span className="label">信用评分：</span>
                <span className="value credit-score">{userInfo.creditScore || 100}</span>
              </div>
              <div className="info-item">
                <span className="label">注册时间：</span>
                <span className="value">
                  {new Date(userInfo.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 我的商品标签页 */}
      {activeTab === 'products' && (
        <div className="products-section">
          <h2>我的商品</h2>
          {myProducts.length > 0 ? (
            <div className="products-grid">
              {myProducts.map((product) => (
                <a key={product._id} href={`/product/${product._id}`} className="product-card">
                  <div className="product-images">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        loading="lazy"
                        className="product-image"
                      />
                    ) : (
                      <div className="no-image">
                        <div className="no-image-icon">📷</div>
                        <span>暂无图片</span>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">¥{product.price}</p>
                    <div className="product-meta">
                      <span className="product-location">📍 {product.location}</span>
                      <span className={`product-status status-${product.status}`}>
                        {product.status === '在售' ? '在售' : '已售出'}
                      </span>
                    </div>
                    <div className="product-actions">
                      <a href={`/product/form?id=${product._id}`} className="action-button edit">
                        编辑
                      </a>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>还没有发布商品</h3>
              <p>点击下方按钮发布你的第一件商品</p>
              <a href="/product/form" className="primary-button">
                发布商品
              </a>
            </div>
          )}
        </div>
      )}

      {/* 交易记录标签页 */}
      {activeTab === 'transactions' && (
        <div className="transactions-section">
          <h2>交易记录</h2>
          {transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="transaction-item">
                  <div className="transaction-header">
                    <span className="transaction-id">订单号: {transaction._id}</span>
                    <span className={`transaction-status status-${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <div className="transaction-info">
                    <div className="transaction-product">
                      商品: {transaction.product?.name || '商品信息已删除'}
                    </div>
                    <div className="transaction-amount">
                      金额: ¥{transaction.amount}
                    </div>
                    <div className="transaction-time">
                      时间: {new Date(transaction.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <h3>还没有交易记录</h3>
              <p>开始浏览商品，进行你的第一笔交易吧</p>
              <a href="/" className="primary-button">
                浏览商品
              </a>
            </div>
          )}
        </div>
      )}

      {/* 消息通知标签页 */}
      {activeTab === 'messages' && (
        <div className="messages-section">
          <h2>消息通知</h2>
          {messages.length > 0 ? (
            <div className="messages-list">
              {messages.map((message) => (
                <div key={message._id} className={`message-item ${message.read ? 'read' : 'unread'}`}>
                  <div className="message-header">
                    <span className="message-sender">
                      {message.sender?.username || '系统'}
                    </span>
                    <span className="message-time">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>暂无消息</h3>
              <p>当有新消息时，会显示在这里</p>
            </div>
          )}
        </div>
      )}

      {/* 密码修改标签页 */}
      {activeTab === 'password' && (
        <div className="password-section">
          <h2>修改密码</h2>
          <div className="password-form">
            {passwordError && (
              <div className="form-error">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="form-success">{passwordSuccess}</div>
            )}
            <div className="form-group">
              <label>当前密码</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label>新密码</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="至少6位"
              />
            </div>
            <div className="form-group">
              <label>确认新密码</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-actions">
              <button className="cancel-button" onClick={handlePasswordCancel}>
                取消
              </button>
              <button className="submit-button" onClick={handlePasswordSubmit}>
                修改密码
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;