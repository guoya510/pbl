import React, { useState, useEffect } from 'react';
import { favoriteApi } from '../utils/api';
import { showToast, showConfirm } from '../components/Toast';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Favorites component mounted');
    console.log('LocalStorage token:', localStorage.getItem('token') ? 'exists' : 'not found');
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching favorites...');
      const data = await favoriteApi.getUserFavorites();
      console.log('Favorites data received:', data);
      if (data && Array.isArray(data)) {
        setFavorites(data);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || '获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    const confirmed = await showConfirm('取消收藏', '确定要取消收藏这个商品吗？');
    if (!confirmed) return;
    
    try {
      await favoriteApi.removeFavorite(productId);
      setFavorites(prev => prev.filter(fav => fav.product._id !== productId));
      showToast('取消收藏成功', 'success');
    } catch (err) {
      showToast('取消收藏失败', 'error');
    }
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading" style={{ textAlign: 'center', padding: '5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>加载收藏列表中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container">
        <div className="error" style={{ textAlign: 'center', padding: '5rem', color: '#e74c3c' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <p>{error}</p>
          <button 
            onClick={fetchFavorites}
            style={{ 
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>我的收藏</h1>
        <span className="favorites-count">共 {favorites.length} 件商品</span>
      </div>
      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💝</div>
          <p>您还没有收藏任何商品</p>
          <a href="/" className="back-home-button">返回首页逛逛</a>
        </div>
      ) : (
        <div className="favorites-list">
          {favorites.map((favorite) => {
            const product = favorite.product;
            if (!product) {
              return (
                <div key={favorite._id} className="favorite-item unavailable">
                  <div className="favorite-image-wrapper">
                    <div className="no-image">❌</div>
                  </div>
                  <div className="favorite-content">
                    <p className="favorite-name unavailable-text">商品已下架</p>
                    <p className="favorite-description">该商品已被删除或下架，无法查看详情</p>
                  </div>
                  <div className="favorite-actions">
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveFavorite(favorite.productId || favorite._id)}
                    >
                      取消收藏
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <div key={product._id} className="favorite-item">
                <a href={`/product/${product._id}`} className="favorite-image-wrapper">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="favorite-image" />
                  ) : (
                    <div className="no-image">暂无图片</div>
                  )}
                </a>
                <div className="favorite-content">
                  <a href={`/product/${product._id}`} className="favorite-name">
                    {product.name}
                  </a>
                  <p className="favorite-price">¥{product.price}</p>
                  <p className="favorite-description">
                    {product.description || '暂无描述'}
                  </p>
                  <div className="favorite-meta">
                    <span className="meta-tag">📍 {product.location || '未知位置'}</span>
                    <span className="meta-tag">🏷️ {product.category || '其他'}</span>
                    <span className="meta-tag">👤 {product.seller?.username || '未知卖家'}</span>
                  </div>
                </div>
                <div className="favorite-actions">
                  <a href={`/product/${product._id}`} className="view-detail-btn">
                    查看详情
                  </a>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveFavorite(product._id)}
                  >
                    取消收藏
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
