import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../utils/api';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    status: '',
    reviewStatus: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchAction, setBatchAction] = useState('');
  const [batchReason, setBatchReason] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('请先登录');
          return;
        }
        
        await Promise.all([
          fetchProducts(),
          fetchStats(),
          fetchCategories()
        ]);
      } catch (err) {
        console.error('加载数据失败:', err);
        setError('加载数据失败，请检查网络连接或登录状态');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const fetchProducts = async (page = 1) => {
    const params = {
      ...filters,
      page,
      limit: pagination.limit
    };
    const response = await adminApi.getAllProducts(params);
    setProducts(response.products);
    setPagination({
      ...pagination,
      page: response.page,
      total: response.total,
      totalPages: response.totalPages
    });
    setSelectedIds([]);
  };

  const fetchStats = async () => {
    const response = await adminApi.getProductStats();
    setStats(response);
  };

  const fetchCategories = async () => {
    const response = await adminApi.getCategories();
    setCategories(response);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchProducts(1);
  };

  const handleClearFilters = () => {
    setFilters({ keyword: '', category: '', status: '', reviewStatus: '' });
    fetchProducts(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchAction = (action) => {
    setBatchAction(action);
    setShowBatchModal(true);
  };

  const confirmBatchAction = async () => {
    try {
      let response;
      
      switch (batchAction) {
        case 'approve':
          response = await adminApi.batchApprove({ ids: selectedIds });
          break;
        case 'offline':
          response = await adminApi.batchOffline({ ids: selectedIds, reason: batchReason });
          break;
        case 'delete':
          if (!confirm(`确定要删除选中的 ${selectedIds.length} 件商品吗？`)) {
            setShowBatchModal(false);
            return;
          }
          response = await adminApi.batchDeleteProducts({ ids: selectedIds });
          break;
        default:
          break;
      }
      
      if (response) {
        alert(response.message);
        fetchProducts(pagination.page);
        fetchStats();
      }
    } catch (err) {
      alert('操作失败: ' + (err.response?.data?.message || '未知错误'));
    } finally {
      setShowBatchModal(false);
      setBatchReason('');
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.reviewProduct(id, { reviewStatus: '已通过' });
      fetchProducts(pagination.page);
      fetchStats();
    } catch (err) {
      alert('操作失败: ' + (err.response?.data?.message || '未知错误'));
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('请输入拒绝原因:');
    if (!reason) return;
    
    try {
      await adminApi.reviewProduct(id, { reviewStatus: '已拒绝', reviewReason: reason });
      fetchProducts(pagination.page);
      fetchStats();
    } catch (err) {
      alert('操作失败: ' + (err.response?.data?.message || '未知错误'));
    }
  };

  const handleOffline = async (id) => {
    const reason = prompt('请输入下架原因:');
    if (!reason) return;
    
    try {
      await adminApi.offlineProduct(id, { reason });
      fetchProducts(pagination.page);
      fetchStats();
    } catch (err) {
      alert('操作失败: ' + (err.response?.data?.message || '未知错误'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这件商品吗？')) return;
    
    try {
      console.log('正在删除商品:', id);
      const response = await adminApi.deleteProduct(id);
      console.log('删除成功:', response);
      alert('商品删除成功');
      fetchProducts(pagination.page);
      fetchStats();
    } catch (err) {
      console.error('删除失败:', err);
      alert('操作失败: ' + (err.response?.data?.message || err.message || '未知错误'));
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-management">
      <div className="admin-header">
        <h1>商品管理</h1>
        <div className="admin-nav">
          <button onClick={() => navigate('/admin/dashboard')}>数据统计</button>
          <button onClick={() => navigate('/admin/review')}>商品审核</button>
          <button onClick={() => navigate('/admin/products')} className="active">商品管理</button>
        </div>
      </div>

      {stats && (
        <div className="stats-summary">
          <div className="summary-card">
            <span className="summary-icon">📦</span>
            <span className="summary-label">商品总数</span>
            <span className="summary-value">{stats.total}</span>
          </div>
          <div className="summary-card">
            <span className="summary-icon">✅</span>
            <span className="summary-label">在售</span>
            <span className="summary-value">{stats.active}</span>
          </div>
          <div className="summary-card">
            <span className="summary-icon">📋</span>
            <span className="summary-label">待审核</span>
            <span className="summary-value">{stats.pending}</span>
          </div>
          <div className="summary-card">
            <span className="summary-icon">🆕</span>
            <span className="summary-label">今日新增</span>
            <span className="summary-value">{stats.todayCount}</span>
          </div>
        </div>
      )}

      <div className="filter-section">
        <div className="filter-form">
          <input
            type="text"
            name="keyword"
            value={filters.keyword}
            onChange={handleFilterChange}
            placeholder="搜索商品名称或描述..."
            className="filter-input"
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">全部分类</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">全部状态</option>
            <option value="在售">在售</option>
            <option value="已售出">已售出</option>
            <option value="已下架">已下架</option>
          </select>
          <select
            name="reviewStatus"
            value={filters.reviewStatus}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">全部审核状态</option>
            <option value="待审核">待审核</option>
            <option value="已通过">已通过</option>
            <option value="已拒绝">已拒绝</option>
          </select>
        </div>
        <div className="filter-actions">
          <button onClick={handleSearch} className="search-btn">搜索</button>
          <button onClick={handleClearFilters} className="clear-btn">清除筛选</button>
        </div>
      </div>

      <div className="batch-section">
        <label className="select-all">
          <input
            type="checkbox"
            checked={selectedIds.length === products.length && products.length > 0}
            onChange={handleSelectAll}
          />
          全选
        </label>
        <div className="batch-actions">
          {selectedIds.length > 0 && (
            <>
              <button 
                onClick={() => handleBatchAction('approve')}
                className="batch-btn approve"
              >
                批量通过 ({selectedIds.length})
              </button>
              <button 
                onClick={() => handleBatchAction('offline')}
                className="batch-btn offline"
              >
                批量下架 ({selectedIds.length})
              </button>
              <button 
                onClick={() => handleBatchAction('delete')}
                className="batch-btn delete"
              >
                批量删除 ({selectedIds.length})
              </button>
            </>
          )}
        </div>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedIds.length === products.length && products.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>商品信息</th>
              <th>发布者</th>
              <th>状态</th>
              <th>审核状态</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className={selectedIds.includes(product._id) ? 'selected' : ''}>
                <td className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product._id)}
                    onChange={() => handleSelect(product._id)}
                  />
                </td>
                <td className="product-info-cell">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="product-thumb" />
                  ) : (
                    <div className="no-image-thumb">📷</div>
                  )}
                  <div className="product-text">
                    <h4>{product.name}</h4>
                    <p className="price">¥{product.price}</p>
                  </div>
                </td>
                <td>
                  <div className="seller-info">
                    <span className="seller-name">{product.seller?.username}</span>
                    <span className="seller-email">{product.seller?.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${product.status}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <span className={`review-badge review-${product.reviewStatus}`}>
                    {product.reviewStatus}
                  </span>
                </td>
                <td>{new Date(product.createdAt).toLocaleString()}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {product.reviewStatus === '待审核' && (
                      <>
                        <button 
                          onClick={() => handleApprove(product._id)}
                          className="action-btn approve"
                          title="通过审核"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={() => handleReject(product._id)}
                          className="action-btn reject"
                          title="拒绝审核"
                        >
                          ✗
                        </button>
                      </>
                    )}
                    {product.status !== '已下架' && (
                      <button 
                        onClick={() => handleOffline(product._id)}
                        className="action-btn offline"
                        title="下架商品"
                      >
                        🚫
                      </button>
                    )}
                    {product.status === '已下架' && (
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="action-btn delete"
                        title="删除商品"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="empty-state">
            <p>暂无商品数据</p>
          </div>
        )}
      </div>

      <div className="pagination">
        <button 
          onClick={() => pagination.page > 1 && fetchProducts(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="pagination-btn"
        >
          上一页
        </button>
        <span className="pagination-info">
          第 {pagination.page} / {pagination.totalPages} 页
        </span>
        <button 
          onClick={() => pagination.page < pagination.totalPages && fetchProducts(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="pagination-btn"
        >
          下一页
        </button>
      </div>

      {showBatchModal && (
        <div className="modal-overlay" onClick={() => setShowBatchModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>
              {batchAction === 'approve' && '批量通过审核'}
              {batchAction === 'offline' && '批量下架商品'}
              {batchAction === 'delete' && '批量删除商品'}
            </h3>
            <p>确定要对选中的 {selectedIds.length} 件商品执行此操作吗？</p>
            {batchAction === 'offline' && (
              <div className="modal-reason">
                <label>下架原因:</label>
                <textarea
                  value={batchReason}
                  onChange={e => setBatchReason(e.target.value)}
                  placeholder="请输入下架原因..."
                  rows="3"
                />
              </div>
            )}
            <div className="modal-actions">
              <button onClick={() => setShowBatchModal(false)} className="modal-btn cancel">
                取消
              </button>
              <button 
                onClick={confirmBatchAction} 
                className={`modal-btn confirm ${batchAction}`}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;