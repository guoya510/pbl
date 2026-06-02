import React, { useState, useEffect } from 'react';
import { statsApi } from '../utils/api';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await statsApi.getStats();
      if (data.success) {
        setStats(data.data);
      } else {
        setError('获取统计数据失败');
      }
    } catch (err) {
      setError('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, unit = '', icon, color, trend }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">
          {value.toLocaleString()}
          {unit && <span className="stat-unit">{unit}</span>}
        </div>
        <div className="stat-title">{title}</div>
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="stats-container">
        <h2>数据统计</h2>
        <div className="stats-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="stat-card skeleton">
              <div className="stat-icon skeleton-icon"></div>
              <div className="stat-content">
                <div className="stat-value skeleton-text"></div>
                <div className="stat-title skeleton-text"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-container">
        <h2>数据统计</h2>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error || '无法获取统计数据'}</div>
          <button className="retry-button" onClick={fetchStats}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <h2>数据统计</h2>
      
      <div className="stats-grid">
        <StatCard
          title="商品总数"
          value={stats.products.total}
          icon="📦"
          color="blue"
        />
        <StatCard
          title="在售商品"
          value={stats.products.active}
          icon="✅"
          color="green"
        />
        <StatCard
          title="今日新增商品"
          value={stats.products.today}
          icon="➕"
          color="purple"
        />
        <StatCard
          title="交易总数"
          value={stats.transactions.total}
          icon="💳"
          color="orange"
        />
        <StatCard
          title="交易总额"
          value={stats.transactions.revenue}
          unit="元"
          icon="💰"
          color="gold"
        />
        <StatCard
          title="用户总数"
          value={stats.users.total}
          icon="👥"
          color="cyan"
        />
      </div>

      <div className="stats-detail">
        <div className="detail-section">
          <h3>📊 交易数据</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">总交易数</span>
              <span className="detail-value">{stats.transactions.total.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">已完成交易</span>
              <span className="detail-value">{stats.transactions.completed.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">今日交易</span>
              <span className="detail-value">{stats.transactions.today}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">本周交易</span>
              <span className="detail-value">{stats.transactions.weekly}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">本月交易</span>
              <span className="detail-value">{stats.transactions.monthly}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">交易总额</span>
              <span className="detail-value highlight">¥{stats.transactions.revenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>👤 用户活跃度</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">总用户数</span>
              <span className="detail-value">{stats.users.total.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">活跃用户</span>
              <span className="detail-value">{stats.users.active.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">今日注册</span>
              <span className="detail-value">{stats.users.today}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">本周注册</span>
              <span className="detail-value">{stats.users.weekly}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">本月注册</span>
              <span className="detail-value">{stats.users.monthly}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">活跃率</span>
              <span className="detail-value highlight">
                {stats.users.total > 0 
                  ? ((stats.users.active / stats.users.total) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>📦 商品数量</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">商品总数</span>
              <span className="detail-value">{stats.products.total.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">在售商品</span>
              <span className="detail-value">{stats.products.active.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">今日发布</span>
              <span className="detail-value">{stats.products.today}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">本周发布</span>
              <span className="detail-value">{stats.products.weekly}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">本月发布</span>
              <span className="detail-value">{stats.products.monthly}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">在售率</span>
              <span className="detail-value highlight">
                {stats.products.total > 0 
                  ? ((stats.products.active / stats.products.total) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;