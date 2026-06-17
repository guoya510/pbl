import React, { useState, useEffect } from 'react';
import { messageApi, userApi } from '../utils/api';

const ChatList = ({ onSelectUser, selectedUserId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    fetchChats();
    fetchOnlineUsers();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch('/api/users/online');
      const data = await response.json();
      setOnlineUsers(new Set(data.users));
    } catch (error) {
      console.error('获取在线用户失败:', error);
    }
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const messages = await messageApi.getMessages();
      
      const chatMap = new Map();
      messages.forEach(msg => {
        const otherUserId = msg.sender._id === localStorage.getItem('userId') 
          ? msg.receiver._id 
          : msg.sender._id;
        const otherUser = msg.sender._id === localStorage.getItem('userId') 
          ? msg.receiver 
          : msg.sender;
        
        if (!chatMap.has(otherUserId) || new Date(msg.createdAt) > new Date(chatMap.get(otherUserId).lastMessageTime)) {
          chatMap.set(otherUserId, {
            userId: otherUserId,
            username: otherUser.username,
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
            unread: !msg.read && msg.receiver._id === localStorage.getItem('userId'),
            online: onlineUsers.has(otherUserId)
          });
        }
      });
      
      const sortedChats = Array.from(chatMap.values()).sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
      setChats(sortedChats);
    } catch (error) {
      console.error('获取聊天列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('zh-CN');
  };

  const filteredChats = chats.filter(chat => 
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="qq-chat-list">
        <div className="qq-chat-header">
          <h2 className="qq-title">消息</h2>
          <div className="qq-search-box">
            <input
              type="text"
              placeholder="搜索联系人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="qq-search-input"
            />
            <span className="qq-search-icon">🔍</span>
          </div>
        </div>
        <div className="qq-chat-content">
          <div className="qq-loading">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="qq-chat-list">
      <div className="qq-chat-header">
        <h2 className="qq-title">消息</h2>
        <div className="qq-search-box">
          <input
            type="text"
            placeholder="搜索联系人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="qq-search-input"
          />
          <span className="qq-search-icon">🔍</span>
        </div>
      </div>
      <div className="qq-chat-content">
        {filteredChats.length === 0 ? (
          <div className="qq-empty-state">
            <div className="qq-empty-icon">💬</div>
            <p>暂无消息</p>
            <p className="qq-empty-hint">开始与好友聊天吧</p>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.userId}
              className={`qq-chat-item ${chat.unread ? 'qq-unread' : ''} ${selectedUserId === chat.userId ? 'qq-selected' : ''}`}
              onClick={() => onSelectUser(chat.userId, chat.username)}
            >
              <div className="qq-avatar-container">
                <div className="qq-avatar">
                  <span>{chat.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className={`qq-status-dot ${onlineUsers.has(chat.userId) ? 'qq-online' : ''}`}></div>
              </div>
              <div className="qq-chat-info">
                <div className="qq-chat-name">{chat.username}</div>
                <div className="qq-chat-preview">
                  {chat.unread ? <span className="qq-unread-dot">●</span> : null}
                  {chat.lastMessage.length > 20 ? chat.lastMessage.substring(0, 20) + '...' : chat.lastMessage}
                </div>
              </div>
              <div className="qq-chat-meta">
                <div className="qq-chat-time">{formatTime(chat.lastMessageTime)}</div>
                {chat.unread && (
                  <div className="qq-unread-count">●</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;