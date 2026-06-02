import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState('');

  const handleSelectUser = (userId, username) => {
    setSelectedUser(userId);
    setSelectedUsername(username);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-sidebar">
          <ChatList onSelectUser={handleSelectUser} />
        </div>
        <div className="chat-main">
          <ChatWindow userId={selectedUser} username={selectedUsername} />
        </div>
      </div>
    </div>
  );
};

export default Chat;