import React, { useState, useEffect } from 'react';
import { productApi } from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
    location: '',
    sort: 'createdAt'
  });

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProducts(searchParams);
      setProducts(data.products);
    } catch (err) {
      setError('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredProducts = products;

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

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-inputs">
            <div className="form-group">
              <input
                type="text"
                name="keyword"
                value={searchParams.keyword}
                onChange={handleInputChange}
                placeholder="搜索商品名称或描述"
                className="search-input"
              />
            </div>
            <div className="form-group">
              <select
                name="category"
                value={searchParams.category}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="">全部分类</option>
                <option value="教材">教材</option>
                <option value="电子产品">电子产品</option>
                <option value="体育用品">体育用品</option>
                <option value="生活用品">生活用品</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div className="form-group">
              <select
                name="location"
                value={searchParams.location}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="">全部地点</option>
                <option value="东区">东区</option>
                <option value="西区">西区</option>
                <option value="南区">南区</option>
                <option value="北区">北区</option>
              </select>
            </div>
            <div className="form-group">
              <select
                name="sort"
                value={searchParams.sort}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="createdAt">最新发布</option>
                <option value="price">价格最低</option>
                <option value="-price">价格最高</option>
              </select>
            </div>
            <button type="submit" className="search-button">搜索</button>
          </div>
        </form>



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