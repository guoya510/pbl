import React, { useState } from 'react';
import ProductForm from '../components/ProductForm';

const ProductFormPage = ({ onProductCreated, onProductUpdated }) => {
  const [showForm, setShowForm] = useState(true);

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
    // 可以选择是否关闭表单
    // setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    // 可以导航回上一页
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