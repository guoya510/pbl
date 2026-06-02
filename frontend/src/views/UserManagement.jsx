import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../utils/api';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({
    keyword: '',
    role: '',
    creditLevel: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', creditScore: '' });
  const navigate = useNavigate();

  const creditLevels = ['普通', '良好', '优秀', '极好'];

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
          fetchUsers(),
          fetchStats()
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

  const fetchUsers = async (page = 1) => {
    const params = {
      ...filters,
      page,
      limit: pagination.limit
    };
    const response = await adminApi.getAllUsers(params);
    setUsers(response.users);
    setPagination({
      ...pagination,
      page: response.page,
      total: response.total,
      totalPages: response.totalPages
    });
    setSelectedIds([]);
  };

  const fetchStats = async () => {
    const response = await adminApi.getUserStats();
    setStats(response);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchUsers(1);
  };

  const handleClearFilters = () => {
    setFilters({ keyword: '', role: '', creditLevel: '' });
    fetchUsers(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({ role: user.role, creditScore: user.creditScore });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await adminApi.updateUser(editingUser._id, editForm);
      alert('用户信息更新成功');
      fetchUsers(pagination.page);
      fetchStats();
    } catch (err) {
      alert('操作失败: ' + (err.response?.data?.message || '未知错误'));
    } finally {
      setShowEditModal(false);
      setEditingUser(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除该用户吗？')) return;
    
    try {
      console.log('正在删除用户:', id);
      const response = await adminApi.deleteUser(id);
      console.log('删除成功:', response);
      alert('用户删除成功');
      fetchUsers(pagination.page);
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
    <div className="user-management">
      <div className="admin-header">
        <h1>用户管理</h1>
        <div className="admin-nav">
          <button onClick={() => navigate('/admin/dashboard')}>数据统计</button>
          <button onClick={() => navigate('/admin/review')}>商品审核</button>
          <button onClick={() => navigate('/admin/products')}>商品管理</button>
          <button onClick={() => navigate('/admin/users')} className="active">用户管理</button>
        </div>
      </div>

      {stats && (
        <div className="stats-summary">
          <div className="summary-card">
            <span className="summary-icon">👥</span>
            <span className="summary-label">用户总数</span>
            <span className="summary-value">{stats.total}</span>
          </div>
          <div className="summary-card">
            <span className="summary-icon">🛡️</span>
            <span className="summary-label">管理员</span>
            <span className="summary-value">{stats.admins}</span>
          </div>
          <div className="summary-card">
            <span className="summary-icon">👤</span>
            <span className="summary-label">普通用户</span>
            <span className="summary-value">{stats.normalUsers}</span>
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
            placeholder="搜索用户名或邮箱..."
            className="filter-input"
          />
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">全部角色</option>
            <option value="admin">管理员</option>
            <option value="user">普通用户</option>
          </select>
          <select
            name="creditLevel"
            value={filters.creditLevel}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">全部信用等级</option>
            {creditLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <div className="filter-actions">
          <button onClick={handleSearch} className="search-btn">搜索</button>
          <button onClick={handleClearFilters} className="clear-btn">清除筛选</button>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedIds.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>用户信息</th>
              <th>角色</th>
              <th>信用等级</th>
              <th>信用积分</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className={selectedIds.includes(user._id) ? 'selected' : ''}>
                <td className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user._id)}
                    onChange={() => handleSelect(user._id)}
                  />
                </td>
                <td className="user-info-cell">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="user-avatar" />
                  ) : (
                    <div className="no-avatar">👤</div>
                  )}
                  <div className="user-text">
                    <h4>{user.username}</h4>
                    <p className="user-email">{user.email}</p>
                  </div>
                </td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </td>
                <td>
                  <span className={`credit-badge credit-${user.creditLevel}`}>
                    {user.creditLevel}
                  </span>
                </td>
                <td>{user.creditScore}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="action-btn edit"
                      title="编辑用户"
                    >
                      ✏️
                    </button>
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="action-btn delete"
                        title="删除用户"
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

        {users.length === 0 && (
          <div className="empty-state">
            <p>暂无用户数据</p>
          </div>
        )}
      </div>

      <div className="pagination">
        <button 
          onClick={() => pagination.page > 1 && fetchUsers(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="pagination-btn"
        >
          上一页
        </button>
        <span className="pagination-info">
          第 {pagination.page} / {pagination.totalPages} 页
        </span>
        <button 
          onClick={() => pagination.page < pagination.totalPages && fetchUsers(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="pagination-btn"
        >
          下一页
        </button>
      </div>

      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>编辑用户信息</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>用户名:</label>
                <input type="text" value={editingUser.username} disabled className="disabled-input" />
              </div>
              <div className="form-group">
                <label>邮箱:</label>
                <input type="email" value={editingUser.email} disabled className="disabled-input" />
              </div>
              <div className="form-group">
                <label>角色:</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  className="modal-select"
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className="form-group">
                <label>信用积分:</label>
                <input
                  type="number"
                  value={editForm.creditScore}
                  onChange={e => setEditForm(prev => ({ ...prev, creditScore: parseInt(e.target.value) || 0 }))}
                  className="modal-input"
                  min="0"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)} className="modal-btn cancel">
                取消
              </button>
              <button 
                onClick={handleSaveEdit} 
                className="modal-btn confirm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;