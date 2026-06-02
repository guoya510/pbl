import React, { useState, useEffect, useRef } from 'react';
import { messageApi } from '../utils/api';

const ChatWindow = ({ userId, username }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await messageApi.getChat(userId);
      setMessages(data);
    } catch (error) {
      console.error('获取聊天记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      const response = await messageApi.sendMessage({
        receiver: userId,
        content: newMessage.trim()
      });
      
      setMessages(prev => [...prev, response]);
      setNewMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送消息失败');
    }
  };

  const isOwnMessage = (msg) => {
    return msg.sender._id === localStorage.getItem('userId');
  };

  if (!userId) {
    return (
      <div className="chat-window empty">
        <div className="empty-chat">
          <div className="empty-icon">💬</div>
          <p>请选择一个聊天对象开始对话</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-avatar">
            <span>{username?.charAt(0).toUpperCase()}</span>
          </div>
          <span className="chat-username">{username}</span>
        </div>
      </div>
      
      <div className="chat-messages">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">👋</div>
            <p>开始与 {username} 的对话吧</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${isOwnMessage(msg) ? 'own' : 'other'}`}
            >
              <div className="message-content">
                <p>{msg.content}</p>
              </div>
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="输入消息..."
          className="chat-input"
        />
        <button type="submit" className="send-button">发送</button>
      </form>
    </div>
  );
};

export default ChatWindow;