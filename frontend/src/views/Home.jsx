import React, { useState, useEffect } from 'react';
import { productApi } from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
    campus: '',
    building: '',
    minPrice: '',
    maxPrice: '',
    sort: 'createdAt'
  });
  const [showFilters, setShowFilters] = useState(false);

  const campuses = [
    { value: '', label: 'All Campuses' },
    { value: 'East', label: 'East Campus' },
    { value: 'West', label: 'West Campus' },
    { value: 'South', label: 'South Campus' },
    { value: 'North', label: 'North Campus' }
  ];

  const buildings = {
    '': [
      { value: '', label: 'All Buildings' }
    ],
    'East': [
      { value: '', label: 'All Buildings' },
      { value: 'BuildingA', label: 'Building A' },
      { value: 'BuildingB', label: 'Building B' },
      { value: 'Dorm1', label: 'Dormitory 1' }
    ],
    'West': [
      { value: '', label: 'All Buildings' },
      { value: 'Lab', label: 'Lab Building' },
      { value: 'Dorm3', label: 'Dormitory 3' },
      { value: 'Admin', label: 'Admin Building' }
    ],
    'South': [
      { value: '', label: 'All Buildings' },
      { value: 'Art', label: 'Art Building' },
      { value: 'Dorm4', label: 'Dormitory 4' },
      { value: 'Library', label: 'Library' }
    ],
    'North': [
      { value: '', label: 'All Buildings' },
      { value: 'Complex', label: 'Complex Building' },
      { value: 'Dorm5', label: 'Dormitory 5' },
      { value: 'Gym', label: 'Gymnasium' }
    ]
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { ...searchParams };
      if (!params.minPrice) delete params.minPrice;
      if (!params.maxPrice) delete params.maxPrice;
      const data = await productApi.getProducts(params);
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
      [name]: value,
      ...(name === 'campus' ? { building: '' } : {})
    }));
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      category: '',
      campus: '',
      building: '',
      minPrice: '',
      maxPrice: '',
      sort: 'createdAt'
    });
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
                name="sort"
                value={searchParams.sort}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="createdAt">最新发布</option>
                <option value="price">价格从低到高</option>
                <option value="-price">价格从高到低</option>
              </select>
            </div>
            <button type="submit" className="search-button">搜索</button>
            <button type="button" className="filter-toggle-button" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? '收起筛选' : '更多筛选'}
            </button>
          </div>

          {showFilters && (
            <div className="advanced-filters">
              <div className="filter-section">
                <h3>区域筛选</h3>
                <div className="filter-row">
                  <div className="form-group">
                    <label>校区</label>
                    <select
                      name="campus"
                      value={searchParams.campus}
                      onChange={handleInputChange}
                      className="filter-select"
                    >
                      {campuses.map(campus => (
                        <option key={campus.value} value={campus.value}>{campus.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>楼栋</label>
                    <select
                      name="building"
                      value={searchParams.building}
                      onChange={handleInputChange}
                      className="filter-select"
                      disabled={!searchParams.campus}
                    >
                      {(buildings[searchParams.campus] || buildings['']).map(building => (
                        <option key={building.value} value={building.value}>{building.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="filter-section">
                <h3>价格区间</h3>
                <div className="filter-row price-range">
                  <div className="form-group">
                    <label>最低价格</label>
                    <input
                      type="number"
                      name="minPrice"
                      value={searchParams.minPrice}
                      onChange={handleInputChange}
                      placeholder="最低价"
                      className="price-input"
                      min="0"
                    />
                  </div>
                  <span className="price-separator">-</span>
                  <div className="form-group">
                    <label>最高价格</label>
                    <input
                      type="number"
                      name="maxPrice"
                      value={searchParams.maxPrice}
                      onChange={handleInputChange}
                      placeholder="最高价"
                      className="price-input"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <button type="button" className="reset-button" onClick={handleReset}>
                重置筛选条件
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="results-info">
        <span className="results-count">共找到 <strong>{products.length}</strong> 件商品</span>
        {searchParams.keyword && (
          <span className="search-keyword">搜索关键词: "{searchParams.keyword}"</span>
        )}
      </div>

      <div className="products-grid">
        {products.length > 0 ? (
          products.map((product) => (
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
                {product.status === '已售出' && (
                  <div className="sold-badge">已售出</div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">¥{product.price.toFixed(2)}</p>
                <div className="product-meta">
                  <span className="product-location">📍 {product.campus || product.location || '未知位置'}</span>
                  {product.building && (
                    <span className="product-building">{product.building}</span>
                  )}
                </div>
                <div className="product-category">{product.category || '其他'}</div>
                <div className="product-seller">
                  <span>卖家: {product.seller?.username || '未知'}</span>
                </div>
                <div className="product-date">
                  {new Date(product.createdAt).toLocaleDateString()}
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="no-products">
            <div className="no-products-icon">🔍</div>
            <h3>未找到商品</h3>
            <p>尝试调整搜索条件或查看其他分类</p>
            <button className="reset-button" onClick={handleReset}>重置筛选</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;