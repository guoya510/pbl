import React, { useState, useEffect } from 'react';
import { productApi } from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProducts();
      setProducts(data.products);
    } catch (err) {
      setError('获取商品列表失败');
    } finally {
      setLoading(false);
    }
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