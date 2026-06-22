import React from 'react';

const FavoritesTest = () => {
  return (
    <div style={{ 
      minHeight: '400px', 
      padding: '2rem', 
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
    }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '1rem' }}>我的收藏</h1>
      <p style={{ color: '#7f8c8d' }}>共 0 件商品</p>
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem', 
        marginTop: '2rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💝</div>
        <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>您还没有收藏任何商品</p>
        <a 
          href="/" 
          style={{ 
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
        >
          返回首页逛逛
        </a>
      </div>
    </div>
  );
};

export default FavoritesTest