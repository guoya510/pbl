import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageApi, userApi } from '../utils/api';

const ChatList = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await userApi.getProfile();
        setCurrentUser(user);

        const messages = await messageApi.getMessages();
        const conversationMap = new Map();

        messages.forEach((message) => {
          const otherUserId = message.sender._id === user._id 
            ? message.receiver._id 
            : message.sender._id;
          const otherUser = message.sender._id === user._id 
            ? message.receiver 
            : message.sender;

          if (!conversationMap.has(otherUserId) || 
              new Date(message.createdAt) > new Date(conversationMap.get(otherUserId).createdAt)) {
            conversationMap.set(otherUserId, {
              userId: otherUserId,
              username: otherUser.username,
              content: message.content,
              createdAt: message.createdAt,
              read: message.read
            });
          }
        });

        const sortedConversations = Array.from(conversationMap.values()).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setConversations(sortedConversations);
      } catch (error) {
        console.error('获取聊天列表失败:', error);
      }
    };

    fetchData();
  }, []);

  const handleChatClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const truncateContent = (content, maxLength = 30) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="chat-list-container">
      <h2 className="page-title">消息</h2>
      
      {conversations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <p>暂无消息</p>
          <p className="empty-hint">去商品详情页联系卖家吧</p>
        </div>
      ) : (
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv.userId}
              className={`conversation-item ${!conv.read ? 'unread' : ''}`}
              onClick={() => handleChatClick(conv.userId)}
            >
              <div className="conversation-avatar">
                {conv.username?.charAt(0) || '?'}
              </div>
              <div className="conversation-info">
                <div className="conversation-name">{conv.username}</div>
                <div className="conversation-preview">
                  {truncateContent(conv.content)}
                </div>
              </div>
              <div className="conversation-meta">
                <span className="conversation-time">{formatTime(conv.createdAt)}</span>
                {!conv.read && <span className="unread-badge">1</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;