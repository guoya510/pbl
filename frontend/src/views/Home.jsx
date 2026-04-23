import React, { useState, useEffect, useCallback } from 'react';
import { productApi } from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState(['全部', '电子产品', '书籍', '生活用品', '运动器材', '其他']);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productApi.getProducts();
      setProducts(data.products);
    } catch (err) {
      setError('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === '' || category === '全部' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  if (loading) {
    return (
      <div className="home-container">
        <h1>校园二手物品</h1>
        <div className="products-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="product-card skeleton">
              <div className="product-images skeleton-image"></div>
              <div className="product-info">
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-location"></div>
                <div className="skeleton-seller"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <h1>校园二手物品</h1>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button className="retry-button" onClick={fetchProducts}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <h1>校园二手物品</h1>
      
      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索商品..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={category}
            onChange={handleCategoryChange}
            className="category-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <a key={product._id} href={`/product/${product._id}`} className="product-card">
              <div className="product-images">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    loading="lazy"
                    className="product-image"
                  />
                ) : (
                  <div className="no-image">
                    <div className="no-image-icon">📷</div>
                    <span>暂无图片</span>
                  </div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">¥{product.price}</p>
                <div className="product-meta">
                  <span className="product-location">📍 {product.location}</span>
                  <span className="product-category">{product.category || '其他'}</span>
                </div>
                <div className="product-seller">
                  <span>卖家: {product.seller?.username || '未知'}</span>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="no-products">
            <div className="no-products-icon">🔍</div>
            <h3>未找到商品</h3>
            <p>尝试调整搜索条件或查看其他分类</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;