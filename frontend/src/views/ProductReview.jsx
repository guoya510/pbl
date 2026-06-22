import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductReview() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewReason, setReviewReason] = useState('');
  const [offlineReason, setOfflineReason] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/products/admin/review/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('获取待审核商品失败');
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/products/admin/review/${productId}`, 
        { reviewStatus: '已通过', reviewReason: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProducts(products.filter(p => p._id !== productId));
      setSelectedProduct(null);
      setReviewReason('');
    } catch (err) {
      alert('审核失败: ' + (err.response?.data?.message || '未知错误'));
    }
  };

  const handleReject = async (productId) => {
    if (!reviewReason.trim()) {
      alert('请填写拒绝原因');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/products/admin/review/${productId}`, 
        { reviewStatus: '已拒绝', reviewReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProducts(products.filter(p => p._id !== productId));
      setSelectedProduct(null);
      setReviewReason('');
    } catch (err) {
      alert('审核失败: ' + (err.response?.data?.message || '未知错误'));
    }
  };

  const handleOffline = async (productId, reason) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/products/admin/offline/${productId}`, 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProducts(products.filter(p => p._id !== productId));
      setSelectedProduct(null);
    } catch (err) {
      alert('下架失败: ' + (err.response?.data?.message || '未知错误'));
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="review-container">
      <div className="review-header">
        <div className="header-left">
          <h1>商品审核</h1>
          <p className="subtitle">管理待审核商品，确保平台内容质量</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{products.length}</span>
            <span className="stat-label">待审核</span>
          </div>
        </div>
      </div>

      <div className="review-nav">
        <button onClick={() => navigate('/admin/dashboard')}>数据统计</button>
        <button onClick={() => navigate('/admin/review')} className="active">商品审核</button>
        <button onClick={() => navigate('/admin/products')}>商品管理</button>
      </div>

      <div className="review-main">
        <div className="review-sidebar">
          <div className="sidebar-header">
            <h2>待审核商品</h2>
            <span className="count-badge">{products.length}</span>
          </div>
          
          {products.length === 0 ? (
            <div className="empty-sidebar">
              <div className="empty-icon">✅</div>
              <p>暂无待审核商品</p>
            </div>
          ) : (
            <div className="product-list">
              {products.map(product => (
                <div 
                  key={product._id} 
                  className={`list-item ${selectedProduct?._id === product._id ? 'active' : ''}`}
                  onClick={() => { setSelectedProduct(product); setCurrentImageIndex(0); }}
                >
                  <div className="item-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <div className="no-image">📷</div>
                    )}
                  </div>
                  <div className="item-info">
                    <h3 className="item-name">{product.name}</h3>
                    <p className="item-price">¥{product.price}</p>
                    <p className="item-seller">{product.seller?.username}</p>
                  </div>
                  <div className="item-status">
                    <span className="pending-badge">待审核</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="review-content">
          {selectedProduct ? (
            <div className="product-panel">
              <div className="panel-header">
                <h2>商品详情</h2>
                <button onClick={() => setSelectedProduct(null)} className="close-btn">
                  <span>×</span>
                </button>
              </div>

              <div className="panel-body">
                <div className="gallery-section">
                  <div className="main-image">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <img src={selectedProduct.images[currentImageIndex]} alt={selectedProduct.name} />
                    ) : (
                      <div className="placeholder-image">
                        <span>暂无图片</span>
                      </div>
                    )}
                  </div>
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="thumbnails">
                      {selectedProduct.images.map((image, index) => (
                        <div 
                          key={index} 
                          className={`thumbnail-item ${currentImageIndex === index ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                        >
                          <img src={image} alt={`${selectedProduct.name}-${index}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="info-section">
                  <div className="product-title-row">
                    <h3 className="product-name">{selectedProduct.name}</h3>
                    <span className="price-tag">¥{selectedProduct.price}</span>
                  </div>

                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">分类</span>
                      <span className="info-value">{selectedProduct.category || '未分类'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">位置</span>
                      <span className="info-value">{selectedProduct.location || '未填写'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">校区</span>
                      <span className="info-value">{selectedProduct.campus || '未填写'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">发布时间</span>
                      <span className="info-value">{new Date(selectedProduct.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="description-box">
                    <h4>商品描述</h4>
                    <p>{selectedProduct.description || '暂无描述'}</p>
                  </div>

                  <div className="seller-box">
                    <h4>发布者信息</h4>
                    <div className="seller-info">
                      <div className="seller-avatar">
                        {selectedProduct.seller?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="seller-detail">
                        <p className="seller-name">{selectedProduct.seller?.username}</p>
                        <p className="seller-email">{selectedProduct.seller?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel-footer">
                <div className="review-section">
                  <h4 className="section-title">审核操作</h4>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleApprove(selectedProduct._id)}
                      className="btn-approve"
                    >
                      <span className="btn-icon">✓</span>
                      <span>通过审核</span>
                    </button>
                    <button 
                      onClick={() => handleReject(selectedProduct._id)}
                      className="btn-reject"
                    >
                      <span className="btn-icon">✗</span>
                      <span>拒绝审核</span>
                    </button>
                  </div>
                  
                  <div className="reason-box">
                    <label>拒绝原因（拒绝时必填）</label>
                    <textarea
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="请输入拒绝原因，将通知给卖家..."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="offline-section">
                  <h4 className="section-title">下架操作</h4>
                  <button 
                    onClick={() => {
                      if (!offlineReason.trim()) {
                        alert('请填写下架原因');
                        return;
                      }
                      handleOffline(selectedProduct._id, offlineReason);
                      setOfflineReason('');
                    }}
                    className="btn-offline"
                  >
                    <span className="btn-icon">🚫</span>
                    <span>下架商品</span>
                  </button>
                  <div className="reason-box">
                    <label>下架原因</label>
                    <textarea
                      value={offlineReason}
                      onChange={(e) => setOfflineReason(e.target.value)}
                      placeholder="请输入下架原因，将通知给卖家..."
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-content">
              <div className="empty-icon">👆</div>
              <h3>选择商品查看详情</h3>
              <p>从左侧列表中选择一个待审核商品进行审核操作</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductReview;
