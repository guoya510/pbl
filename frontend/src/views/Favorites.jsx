import React, { useState, useEffect } from 'react';
import { favoriteApi } from '../utils/api';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteApi.getUserFavorites();
      setFavorites(data);
    } catch (err) {
      setError('获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    if (window.confirm('确定要取消收藏这个商品吗？')) {
      try {
        await favoriteApi.removeFavorite(productId);
        setFavorites(prev => prev.filter(fav => fav.product._id !== productId));
        alert('取消收藏成功');
      } catch (err) {
        alert('取消收藏失败');
      }
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="favorites-container">
      <h1>我的收藏</h1>
      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>您还没有收藏任何商品</p>
          <a href="/" className="back-home-button">返回首页</a>
        </div>
      ) : (
        <div className="products-grid">
          {favorites.map((favorite) => {
            const product = favorite.product;
            return (
              <div key={product._id} className="product-card">
                <div className="product-images">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className="no-image">暂无图片</div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">¥{product.price}</p>
                  <p className="product-location">{product.location}</p>
                  <div className="product-seller">
                    <span>卖家: {product.seller?.username || '未知'}</span>
                  </div>
                  <div className="card-actions">
                    <a href={`/product/${product._id}`} className="view-button">
                      查看详情
                    </a>
                    <button 
                      className="remove-favorite-button"
                      onClick={() => handleRemoveFavorite(product._id)}
                    >
                      取消收藏
                    </button>
                  </div>
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