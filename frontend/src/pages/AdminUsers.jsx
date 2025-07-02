import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ResetPasswordModal from '../components/ResetPasswordModal';

const AdminUsers = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchUsername, setSearchUsername] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordResult, setResetPasswordResult] = useState(null);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, searchUsername, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await adminService.getUsers(page, 10, searchUsername, roleFilter);
      
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('获取用户列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openResetPasswordModal = (user) => {
    setSelectedUser(user);
    setResetPasswordModalOpen(true);
  };

  const handleResetPassword = async (userId, newPassword) => {
    try {
      setResetPasswordLoading(true);
      setResetPasswordResult(null);
      
      // 使用adminService替代axios
      const response = await adminService.resetUserPassword(userId, newPassword);
      
      setResetPasswordResult({
        success: true,
        message: '密码重置成功'
      });
      
      // 刷新用户列表
      fetchUsers();
      return response;
    } catch (error) {
      console.error('Error resetting password:', error);
      setResetPasswordResult({
        success: false,
        message: '密码重置失败，请稍后再试'
      });
      throw error;
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h1 className="text-3xl font-heiti mb-6">用户管理</h1>
      
      {/* 搜索和筛选 */}
      <div className="mb-6 bg-white border border-zinc-200 rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-zinc-500 mb-1">用户名</label>
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="搜索用户名"
              className="px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          
          <div>
            <label className="block text-sm text-zinc-500 mb-1">角色</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">全部角色</option>
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
          >
            搜索
          </button>
        </form>
      </div>
      
      {/* 重置密码结果提示 */}
      {resetPasswordResult && (
        <div className={`mb-6 px-6 py-4 rounded-lg ${
          resetPasswordResult.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p>{resetPasswordResult.message}</p>
          {resetPasswordResult.newPassword && (
            <p className="mt-2 font-medium">新密码: {resetPasswordResult.newPassword}</p>
          )}
        </div>
      )}
      
      {/* 用户列表 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : error ? (
        <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 px-6 py-4 rounded-lg">
          <p>{error}</p>
        </div>
      ) : !users || users.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 px-6 py-4 rounded-lg">
          <p>没有找到符合条件的用户</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-zinc-200 rounded-lg">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">用户名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">昵称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">角色</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">注册时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.avatarUrl || '/default-avatar.png'}
                        alt={`${user.username}的头像`}
                        className="w-8 h-8 rounded-full mr-3 border border-zinc-200"
                      />
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.nickname || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                    }`}>
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openResetPasswordModal(user)}
                      disabled={resetPasswordLoading || user._id === currentUser.id}
                      className={`text-sm px-3 py-1 rounded ${
                        user._id === currentUser.id
                          ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                          : 'bg-zinc-800 text-white hover:bg-black'
                      }`}
                    >
                      {resetPasswordLoading && selectedUser?._id === user._id ? '处理中...' : '重置密码'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* 分页 */}
      {!loading && users && users.length > 0 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-4 py-2 rounded-l-md border border-zinc-200 ${
                page === 1 ? 'bg-zinc-50 text-zinc-300 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-50'
              }`}
            >
              上一页
            </button>
            {[...Array(totalPages).keys()].map((i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 border-t border-b border-zinc-200 ${
                  page === i + 1
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-zinc-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-r-md border border-zinc-200 ${
                page === totalPages ? 'bg-zinc-50 text-zinc-300 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-50'
              }`}
            >
              下一页
            </button>
          </nav>
        </div>
      )}
      
      {/* 重置密码模态框 */}
      <ResetPasswordModal
        isOpen={resetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        onSubmit={handleResetPassword}
        userId={selectedUser?._id}
        username={selectedUser?.username}
      />
    </div>
  );
};

export default AdminUsers;
