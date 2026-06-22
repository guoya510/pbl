import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, favoriteApi } from '../utils/api';
import { showToast, showConfirm } from '../components/Toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

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
      showToast('请先登录', 'warning');
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorited) {
        await favoriteApi.removeFavorite(id);
        setIsFavorited(false);
        showToast('取消收藏成功', 'success');
      } else {
        await favoriteApi.addFavorite(id);
        setIsFavorited(true);
        showToast('收藏成功', 'success');
      }
    } catch (err) {
      showToast('操作失败，请重试', 'error');
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
    const confirmed = await showConfirm('删除商品', '确定要删除这个商品吗？');
    if (!confirmed) return;
    
    try {
      await productApi.deleteProduct(id);
      showToast('商品已删除', 'success');
      window.location.href = '/';
    } catch (err) {
      showToast('删除商品失败', 'error');
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      showToast('请先登录', 'warning');
      navigate('/auth');
      return;
    }

    if (user._id === product.seller._id) {
      showToast('不能联系自己', 'warning');
      return;
    }

    localStorage.setItem('chatTargetUserId', product.seller._id);
    localStorage.setItem('chatTargetUsername', product.seller.username);
    navigate('/chat');
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
        <div className="product-top-section">
          <div className="product-images-container">
            <div className="main-image-wrapper">
              {product.images && product.images.length > 0 ? (
                <>
                  <button 
                    className="carousel-prev" 
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                  >
                    &#8249;
                  </button>
                  <img 
                    src={product.images[currentImageIndex].startsWith('http') ? product.images[currentImageIndex] : `http://localhost:5000${product.images[currentImageIndex]}`} 
                    alt={`${product.name} ${currentImageIndex + 1}`}
                    className="main-image"
                    onClick={() => setShowLightbox(true)}
                  />
                  <button 
                    className="carousel-next" 
                    onClick={() => setCurrentImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                  >
                    &#8250;
                  </button>
                </>
              ) : (
                <div className="no-image">暂无图片</div>
              )}
              {product.images && product.images.length > 0 && (
                <div className="image-counter">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-list">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail-item ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={image.startsWith('http') ? image : `http://localhost:5000${image}`} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-info-top">
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
          </div>
        </div>

        <div className="product-info-bottom">
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
                  className="contact-button"
                  onClick={handleContactSeller}
                >
                  联系商家
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
            {user && user._id !== product.seller?._id && product.status === '在售' && (
              <a href={`/transaction/create/${product._id}`} className="buy-button">
                立即购买
              </a>
            )}
            {user && user._id === product.seller?._id && product.status === '在售' && (
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
      
      {showLightbox && product.images && (
        <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <button className="lightbox-close" onClick={() => setShowLightbox(false)}>×</button>
          <button 
            className="lightbox-prev" 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => prev > 0 ? prev - 1 : product.images.length - 1);
            }}
          >
            &#8249;
          </button>
          <img 
            src={product.images[currentImageIndex]} 
            alt={`${product.name} ${currentImageIndex + 1}`}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            className="lightbox-next" 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0);
            }}
          >
            &#8250;
          </button>
          <div className="lightbox-counter">
            {currentImageIndex + 1} / {product.images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;