import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { productApi, favoriteApi, userApi } from '../utils/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchFollowing();
    }
  }, []);

  useEffect(() => {
    checkIfFollowing();
  }, [following, product]);

  useEffect(() => {
    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkFavoriteStatus();
    }
  }, [user, id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteApi.checkFavorite(id);
      setIsFavorited(response.isFavorited);
    } catch (err) {
      console.error('检查收藏状态失败:', err);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorited) {
        await favoriteApi.removeFavorite(id);
        setIsFavorited(false);
        alert('取消收藏成功');
      } else {
        await favoriteApi.addFavorite(id);
        setIsFavorited(true);
        alert('收藏成功');
      }
    } catch (err) {
      alert('操作失败，请重试');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProduct(id);
      setProduct(data);
    } catch (err) {
      setError('获取商品详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('确定要删除这个商品吗？')) {
      try {
        await productApi.deleteProduct(id);
        alert('商品已删除');
        window.location.href = '/';
      } catch (err) {
        alert('删除商品失败');
      }
    }
  };

  const fetchFollowing = async () => {
    try {
      const data = await userApi.getFollowing();
      setFollowing(data);
    } catch (err) {
      console.error('获取关注列表失败:', err);
    }
  };

  const checkIfFollowing = () => {
    if (user && product && product.seller) {
      const isFollow = following.some(item => item._id === product.seller._id);
      setIsFollowing(isFollow);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      alert('请先登录');
      window.location.href = '/auth';
      return;
    }

    if (user._id === product.seller._id) {
      alert('不能关注自己');
      return;
    }

    try {
      if (isFollowing) {
        await userApi.unfollowUser(product.seller._id);
        setIsFollowing(false);
        // 更新关注列表
        setFollowing(prev => prev.filter(item => item._id !== product.seller._id));
        alert('取消关注成功');
      } else {
        await userApi.followUser(product.seller._id);
        setIsFollowing(true);
        // 更新关注列表
        setFollowing(prev => [...prev, product.seller]);
        alert('关注成功');
      }
    } catch (err) {
      alert('操作失败，请重试');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="error">商品不存在</div>;
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        <div className="product-images">
          {product.images && product.images.length > 0 ? (
            product.images.map((image, index) => (
              <img key={index} src={image} alt={`${product.name} ${index + 1}`} />
            ))
          ) : (
            <div className="no-image">暂无图片</div>
          )}
        </div>
        
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">¥{product.price}</p>
          <div className="product-meta">
            <div className="meta-item">
              <span className="label">分类:</span>
              <span className="value">{product.category}</span>
            </div>
            <div className="meta-item">
              <span className="label">地点:</span>
              <span className="value">{product.location}</span>
            </div>
            <div className="meta-item">
              <span className="label">状态:</span>
              <span className={`value status-${product.status}`}>
                {product.status === '在售' ? '在售' : '已售出'}
              </span>
            </div>
            <div className="meta-item">
              <span className="label">发布时间:</span>
              <span className="value">
                {new Date(product.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="seller-info">
            <h3>卖家信息</h3>
            <div className="seller-details">
              <span className="seller-avatar">
                {product.seller?.username?.charAt(0) || 'U'}
              </span>
              <span className="seller-name">
                {product.seller?.username || '未知卖家'}
              </span>
              {product.seller && user && user._id !== product.seller._id && (
                <button 
                  className={`follow-button ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollow}
                >
                  {isFollowing ? '已关注' : '关注'}
                </button>
              )}
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
              onClick={handleFavorite}
              disabled={favoriteLoading}
            >
              {isFavorited ? '取消收藏' : '收藏'}
            </button>
            {user && user._id === product.seller?._id && (
              <>
                <a href={`/product/form?id=${product._id}`} className="edit-button">
                  编辑商品
                </a>
                <button className="delete-button" onClick={handleDelete}>
                  删除商品
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="product-description">
        <h2>商品描述</h2>
        <p>{product.description}</p>
      </div>
    </div>
  );
};

export default ProductDetail;