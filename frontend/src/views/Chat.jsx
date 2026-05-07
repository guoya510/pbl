import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageApi, userApi } from '../utils/api';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userApi.getProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    const fetchReceiver = async () => {
      try {
        const user = await userApi.getProfile(userId);
        setReceiver(user);
      } catch (error) {
        console.error('获取接收者信息失败:', error);
      }
    };

    fetchCurrentUser();
    fetchReceiver();
  }, [userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await messageApi.getChat(userId);
        setMessages(data);
      } catch (error) {
        console.error('获取消息失败:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      await messageApi.sendMessage({
        receiver: userId,
        content: inputValue.trim()
      });
      setInputValue('');
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <div className="chat-title">
          <div className="avatar">
            {receiver?.username?.charAt(0) || '?'}
          </div>
          <span>{receiver?.username || '加载中...'}</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message ${message.sender._id === currentUser?._id ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <span>{message.content}</span>
            </div>
            <span className="message-time">{formatTime(message.createdAt)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-container" onSubmit={handleSend}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入消息..."
          className="message-input"
        />
        <button type="submit" className="send-btn">发送</button>
      </form>
    </div>
  );
};

export default Chat;