import React, { useState, useEffect, useRef } from 'react';
import { messageApi } from '../utils/api';

const ChatWindow = ({ userId, username }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'];

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

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const isOwnMessage = (msg) => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    const userId = JSON.parse(user)._id;
    return msg.sender._id === userId;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!userId) {
    return (
      <div className="qq-chat-window">
        <div className="qq-empty-chat">
          <div className="qq-empty-icon">💬</div>
          <p>请选择一个聊天对象开始对话</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qq-chat-window">
      <div className="qq-chat-header">
        <div className="qq-chat-user">
          <div className="qq-chat-avatar">
            <span>{username?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="qq-chat-user-info">
            <span className="qq-chat-name">{username}</span>
            <span className="qq-chat-status">在线</span>
          </div>
        </div>
      </div>
      
      <div className="qq-chat-messages">
        {loading ? (
          <div className="qq-loading">加载中...</div>
        ) : messages.length === 0 ? (
          <div className="qq-no-messages">
            <div className="qq-no-messages-icon">👋</div>
            <p>开始与 {username} 的对话吧</p>
            <p className="qq-no-messages-hint">发送消息开始聊天</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`qq-message-wrapper ${isOwnMessage(msg) ? 'qq-message-own' : 'qq-message-other'}`}
            >
              <div className="qq-message-avatar">
                <span>{isOwnMessage(msg) ? (localStorage.getItem('username')?.charAt(0).toUpperCase() || '我') : (username?.charAt(0).toUpperCase())}</span>
              </div>
              <div className={`qq-message-bubble ${isOwnMessage(msg) ? 'qq-bubble-own' : 'qq-bubble-other'}`}>
                <p>{msg.content}</p>
                <span className={`qq-message-time ${isOwnMessage(msg) ? 'qq-time-own' : 'qq-time-other'}`}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="qq-chat-input-area">
        {showEmoji && (
          <div className="qq-emoji-panel">
            {emojis.map((emoji, index) => (
              <button key={index} className="qq-emoji-btn" onClick={() => handleEmojiClick(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="qq-chat-form">
          <button type="button" className="qq-tool-btn" onClick={() => setShowEmoji(!showEmoji)}>😊</button>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="qq-chat-input"
          />
          <button type="submit" className="qq-send-btn" disabled={!newMessage.trim()}>
            <span className="qq-send-icon">➤</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;