import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { productApi } from '../utils/api';

const ProductFormPage = ({ onProductCreated, onProductUpdated }) => {
  const [showForm, setShowForm] = useState(true);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const productId = searchParams.get('id');
    if (productId) {
      fetchProduct(productId);
    }
  }, [searchParams]);

  const fetchProduct = async (id) => {
    try {
      setLoading(true);
      const data = await productApi.getProduct(id);
      setProduct(data);
    } catch (err) {
      console.error('获取商品信息失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (productData) => {
    if (product) {
      if (onProductUpdated) {
        onProductUpdated(productData);
      }
    } else {
      if (onProductCreated) {
        onProductCreated(productData);
      }
    }
    navigate('/');
  };

  const handleCancel = () => {
    setShowForm(false);
    window.history.back();
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!showForm) {
    return <div>操作已取消</div>;
  }

  return (
    <div className="product-form-page">
      <ProductForm 
        product={product} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
      />
    </div>
  );
};

export default ProductFormPage;
