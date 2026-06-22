import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('获取统计数据失败');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>管理后台</h1>
        <div className="admin-nav">
          <button onClick={() => navigate('/admin/dashboard')} className="active">数据统计</button>
          <button onClick={() => navigate('/admin/review')}>商品审核</button>
          <button onClick={() => navigate('/admin/products')}>商品管理</button>
          <button onClick={() => navigate('/admin/users')}>用户管理</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>商品总数</h3>
            <p className="stat-number">{stats.products.total}</p>
            <p className="stat-detail">在售: {stats.products.active} | 待审核: {stats.products.pendingReview}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>交易统计</h3>
            <p className="stat-number">{stats.transactions.total}</p>
            <p className="stat-detail">已完成: {stats.transactions.completed} | 总额: ¥{stats.transactions.revenue}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>用户统计</h3>
            <p className="stat-number">{stats.users.total}</p>
            <p className="stat-detail">活跃用户: {stats.users.active}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3>今日数据</h3>
            <p className="stat-number">{stats.products.today + stats.transactions.today + stats.users.today}</p>
            <p className="stat-detail">商品: {stats.products.today} | 交易: {stats.transactions.today} | 用户: {stats.users.today}</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>最近7天交易趋势</h3>
          <div className="chart-container">
            {stats.transactions.last7Days.map((day, index) => (
              <div key={index} className="chart-bar">
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ height: `${Math.max(day.transactions * 20, 10)}px` }}
                  >
                    <span className="bar-label">{day.transactions}</span>
                  </div>
                </div>
                <div className="bar-date">{day.date.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>商品分类统计</h3>
          <div className="category-list">
            {stats.products.categories.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-name">{category._id || '未分类'}</div>
                <div className="category-bar">
                  <div 
                    className="category-progress"
                    style={{ 
                      width: `${(category.count / stats.products.active) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="category-count">{category.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;