import React, { useState } from 'react';
import { productApi } from '../utils/api';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    location: product?.location || '',
    images: product?.images || []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let response;
      if (product) {
        // 更新商品
        response = await productApi.updateProduct(product._id, formData);
      } else {
        // 发布新商品
        response = await productApi.createProduct(formData);
      }
      if (onSubmit) {
        onSubmit(response);
      }
    } catch (err) {
      setError(err.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>{product ? '编辑商品' : '发布商品'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">商品名称</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">商品描述</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="price">价格</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">分类</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">请选择分类</option>
            <option value="教材">教材</option>
            <option value="电子产品">电子产品</option>
            <option value="体育用品">体育用品</option>
            <option value="服装">服装</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="location">所在区域</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="例如：东区宿舍"
          />
        </div>
        <div className="form-group">
          <label htmlFor="images">图片链接（多个链接用逗号分隔）</label>
          <input
            type="text"
            id="images"
            name="images"
            value={Array.isArray(formData.images) ? formData.images.join(',') : formData.images}
            onChange={(e) => setFormData({ ...formData, images: e.target.value.split(',') })}
            placeholder="例如：https://example.com/image1.jpg,https://example.com/image2.jpg"
          />
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel} disabled={loading}>
            取消
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '提交中...' : (product ? '更新' : '发布')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;