import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const Auth = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

  const handleAuthSuccess = (user) => {
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            登录
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            注册
          </button>
        </div>
        <div className="auth-content">
          {activeTab === 'login' ? (
            <Login onLogin={handleAuthSuccess} />
          ) : (
            <Register onRegister={handleAuthSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;