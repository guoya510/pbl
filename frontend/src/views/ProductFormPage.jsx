import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';

const ProductFormPage = ({ onProductCreated, onProductUpdated }) => {
  const [showForm, setShowForm] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (product) => {
    if (product._id) {
      // 更新商品
      if (onProductUpdated) {
        onProductUpdated(product);
      }
    } else {
      // 发布新商品
      if (onProductCreated) {
        onProductCreated(product);
      }
    }
    // 发布成功后跳转到首页
    navigate('/');
  };

  const handleCancel = () => {
    setShowForm(false);
    // 导航回上一页
    window.history.back();
  };

  if (!showForm) {
    return <div>操作已取消</div>;
  }

  return (
    <div className="product-form-page">
      <ProductForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
      />
    </div>
  );
};

export default ProductFormPage;