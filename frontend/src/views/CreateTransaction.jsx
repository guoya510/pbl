import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, transactionApi } from '../utils/api';

const CreateTransaction = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState('face_to_face');
  const [paymentMethod, setPaymentMethod] = useState('offline');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProduct(productId);
      setProduct(data);
    } catch (error) {
      console.error('获取商品详情失败:', error);
      setError('获取商品详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = {
        productId,
        deliveryMethod,
        paymentMethod,
        deliveryAddress: deliveryMethod === 'express' ? deliveryAddress : undefined
      };

      await transactionApi.createTransaction(data);
      navigate('/profile');
    } catch (error) {
      setError(error.response?.data?.message || '创建交易失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="transaction-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="transaction-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <div className="error-message">商品不存在</div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-page">
      <div className="transaction-container">
        <h2>确认购买</h2>
        
        <div className="product-summary">
          <h3>商品信息</h3>
          <div className="product-card">
            {product.images && product.images.length > 0 && (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="product-image"
              />
            )}
            <div className="product-details">
              <h4>{product.name}</h4>
              <p className="price">¥{product.price.toFixed(2)}</p>
              <p className="seller">卖家: {product.seller?.username || '未知'}</p>
              <p className="location">📍 {product.campus} - {product.building}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-section">
            <h3>交易方式</h3>
            
            <div className="delivery-options">
              <label className="delivery-option">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="face_to_face"
                  checked={deliveryMethod === 'face_to_face'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">🤝</div>
                  <div className="option-info">
                    <span className="option-title">当面交易</span>
                    <span className="option-desc">在指定地点当面交付商品</span>
                  </div>
                </div>
              </label>

              <label className="delivery-option">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="express"
                  checked={deliveryMethod === 'express'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">📦</div>
                  <div className="option-info">
                    <span className="option-title">快递配送</span>
                    <span className="option-desc">卖家发货，快递送达</span>
                  </div>
                </div>
              </label>
            </div>

            {deliveryMethod === 'express' && (
              <div className="address-field">
                <label>收货地址</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="请输入详细收货地址..."
                  className="address-input"
                  required
                />
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>支付方式</h3>
            
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="offline"
                  checked={paymentMethod === 'offline'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">💵</div>
                  <div className="option-info">
                    <span className="option-title">线下支付</span>
                    <span className="option-desc">当面交易时现金支付</span>
                  </div>
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">💳</div>
                  <div className="option-info">
                    <span className="option-title">在线支付</span>
                    <span className="option-desc">通过平台在线支付</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-section summary">
            <h3>交易摘要</h3>
            <div className="summary-row">
              <span className="summary-label">商品金额</span>
              <span className="summary-value">¥{product.price.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">交易方式</span>
              <span className="summary-value">
                {deliveryMethod === 'face_to_face' ? '当面交易' : '快递配送'}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">支付方式</span>
              <span className="summary-value">
                {paymentMethod === 'offline' ? '线下支付' : '在线支付'}
              </span>
            </div>
            {deliveryAddress && (
              <div className="summary-row">
                <span className="summary-label">收货地址</span>
                <span className="summary-value">{deliveryAddress}</span>
              </div>
            )}
            <div className="summary-row total">
              <span className="summary-label">总计</span>
              <span className="summary-value">¥{product.price.toFixed(2)}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => navigate(-1)}>
              取消
            </button>
            <button type="submit" className="submit-button" disabled={submitting}>
              {submitting ? '处理中...' : '确认购买'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransaction;