import React, { useState, useEffect } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState('');

  useEffect(() => {
    const targetUserId = localStorage.getItem('chatTargetUserId');
    const targetUsername = localStorage.getItem('chatTargetUsername');
    
    if (targetUserId && targetUsername) {
      setSelectedUser(targetUserId);
      setSelectedUsername(targetUsername);
      localStorage.removeItem('chatTargetUserId');
      localStorage.removeItem('chatTargetUsername');
    }
  }, []);

  const handleSelectUser = (userId, username) => {
    setSelectedUser(userId);
    setSelectedUsername(username);
  };

  return (
    <div className="qq-chat-page">
      <div className="qq-chat-container">
        <div className="qq-chat-sidebar">
          <ChatList onSelectUser={handleSelectUser} selectedUserId={selectedUser} />
        </div>
        <div className="qq-chat-main">
          <ChatWindow userId={selectedUser} username={selectedUsername} />
        </div>
      </div>
    </div>
  );
};

export default Chat;