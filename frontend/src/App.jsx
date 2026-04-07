import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './views/Auth';
import Home from './views/Home';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 检查本地存储中的用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">校园二手平台</div>
          <div className="navbar-links">
            {user ? (
              <>
                <span className="user-info">欢迎, {user.username}</span>
                <button className="logout-button" onClick={handleLogout}>
                  退出登录
                </button>
              </>
            ) : (
              <a href="/auth">登录/注册</a>
            )}
          </div>
        </nav>
        
        <div className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<Home />} 
            />
            <Route 
              path="/auth" 
              element={user ? <Navigate to="/" /> : <Auth onAuthSuccess={handleAuthSuccess} />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;