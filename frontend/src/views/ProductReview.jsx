import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductReview() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewReason, setReviewReason] = useState('');
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
    <div className="product-review">
      <div className="admin-header">
        <h1>商品审核</h1>
        <div className="admin-nav">
          <button onClick={() => navigate('/admin/dashboard')}>数据统计</button>
          <button onClick={() => navigate('/admin/review')} className="active">商品审核</button>
          <button onClick={() => navigate('/admin/products')}>商品管理</button>
        </div>
      </div>

      <div className="review-content">
        <div className="products-list">
          <h2>待审核商品 ({products.length})</h2>
          
          {products.length === 0 ? (
            <div className="empty-state">
              <p>暂无待审核商品</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div 
                  key={product._id} 
                  className={`product-card ${selectedProduct?._id === product._id ? 'selected' : ''}`}
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.images && product.images.length > 0 && (
                    <img src={product.images[0]} alt={product.name} className="product-image" />
                  )}
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="price">¥{product.price}</p>
                    <p className="seller">发布者: {product.seller?.username}</p>
                    <p className="date">发布时间: {new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedProduct && (
          <div className="review-panel">
            <div className="review-header">
              <h2>商品详情</h2>
              <button onClick={() => setSelectedProduct(null)} className="close-btn">×</button>
            </div>

            <div className="product-detail">
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="product-images">
                  {selectedProduct.images.map((image, index) => (
                    <img key={index} src={image} alt={`${selectedProduct.name}-${index}`} />
                  ))}
                </div>
              )}

              <div className="product-details">
                <h3>{selectedProduct.name}</h3>
                <p className="price">¥{selectedProduct.price}</p>
                <p className="category">分类: {selectedProduct.category}</p>
                <p className="location">位置: {selectedProduct.location || '未填写'}</p>
                <p className="description">{selectedProduct.description || '暂无描述'}</p>
                
                <div className="seller-info">
                  <h4>发布者信息</h4>
                  <p>用户名: {selectedProduct.seller?.username}</p>
                  <p>邮箱: {selectedProduct.seller?.email}</p>
                </div>

                <div className="review-actions">
                  <h4>审核操作</h4>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleApprove(selectedProduct._id)}
                      className="approve-btn"
                    >
                      ✓ 通过审核
                    </button>
                    <button 
                      onClick={() => handleReject(selectedProduct._id)}
                      className="reject-btn"
                    >
                      ✗ 拒绝审核
                    </button>
                  </div>

                  <div className="reject-reason">
                    <label>拒绝原因:</label>
                    <textarea
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="请输入拒绝原因..."
                      rows="4"
                    />
                  </div>

                  <div className="offline-action">
                    <h4>下架操作</h4>
                    <button 
                      onClick={() => {
                        const reason = prompt('请输入下架原因:');
                        if (reason) {
                          handleOffline(selectedProduct._id, reason);
                        }
                      }}
                      className="offline-btn"
                    >
                      🚫 下架商品
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductReview;