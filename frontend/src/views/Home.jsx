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

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
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
        {products.map((product) => (
          <a key={product._id} href={`/product/${product._id}`} className="product-card">
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
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Home;