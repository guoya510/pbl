import React, { useState, useEffect } from 'react';
import { messageApi, userApi } from '../utils/api';

const ChatList = ({ onSelectUser }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

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
            unread: !msg.read && msg.receiver._id === localStorage.getItem('userId')
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

  if (loading) {
    return (
      <div className="chat-list">
        <div className="chat-list-header">
          <h3>消息列表</h3>
        </div>
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>消息列表</h3>
      </div>
      <div className="chat-list-content">
        {chats.length === 0 ? (
          <div className="no-chats">
            <div className="no-chats-icon">💬</div>
            <p>暂无消息</p>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.userId}
              className={`chat-item ${chat.unread ? 'unread' : ''}`}
              onClick={() => onSelectUser(chat.userId, chat.username)}
            >
              <div className="chat-avatar">
                <span>{chat.username.charAt(0).toUpperCase()}</span>
              </div>
              <div className="chat-info">
                <div className="chat-username">{chat.username}</div>
                <div className="chat-preview">{chat.lastMessage}</div>
              </div>
              <div className="chat-time">
                {new Date(chat.lastMessageTime).toLocaleDateString()}
              </div>
              {chat.unread && (
                <div className="unread-badge">●</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;