import React, { useState, useEffect } from 'react';
import { notificationApi } from '../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [activeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = activeFilter !== 'all' ? { type: activeFilter } : {};
      const data = await notificationApi.getNotifications(params);
      setNotifications(data.notifications);
    } catch (err) {
      setError('获取通知列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      alert('操作失败，请重试');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      alert('操作失败，请重试');
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('确定要删除这条通知吗？')) {
      try {
        await notificationApi.deleteNotification(notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
      } catch (err) {
        alert('删除失败，请重试');
      }
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'system':
        return '📢';
      case 'transaction':
        return '💰';
      case 'reminder':
        return '⏰';
      case 'message':
        return '💬';
      default:
        return '📌';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'system':
        return '系统通知';
      case 'transaction':
        return '交易通知';
      case 'reminder':
        return '提醒';
      case 'message':
        return '消息通知';
      default:
        return '通知';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={fetchNotifications}>重试</button>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <h1>我的通知</h1>
      
      <div className="notification-header">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            全部 ({notifications.length})
          </button>
          <button
            className={`filter-tab ${activeFilter === 'system' ? 'active' : ''}`}
            onClick={() => setActiveFilter('system')}
          >
            系统通知
          </button>
          <button
            className={`filter-tab ${activeFilter === 'transaction' ? 'active' : ''}`}
            onClick={() => setActiveFilter('transaction')}
          >
            交易通知
          </button>
          <button
            className={`filter-tab ${activeFilter === 'reminder' ? 'active' : ''}`}
            onClick={() => setActiveFilter('reminder')}
          >
            提醒
          </button>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button className="mark-all-read-button" onClick={handleMarkAllAsRead}>
            全部标记为已读
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${notification.read ? '' : 'unread'}`}
            >
              <div className="notification-icon">{getTypeIcon(notification.type)}</div>
              <div className="notification-content">
                <div className="notification-header-row">
                  <h3 className="notification-title">{notification.title}</h3>
                  <span className="notification-type">{getTypeLabel(notification.type)}</span>
                </div>
                <p className="notification-body">{notification.content}</p>
                <div className="notification-footer">
                  <span className="notification-time">{formatTime(notification.createdAt)}</span>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        className="action-btn read-btn"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        标记已读
                      </button>
                    )}
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(notification._id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>暂无通知</h3>
            <p>您还没有收到任何通知</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;