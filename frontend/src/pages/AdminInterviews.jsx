import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminInterviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTitle, setSearchTitle] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, [page, searchTitle]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      
      const response = await adminService.getInterviews(page, 10, searchTitle);
      
      setInterviews(response.data.interviews);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setError('获取面试列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInterviews();
  };

  const handleDeleteClick = (interview) => {
    setInterviewToDelete(interview);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!interviewToDelete) return;
    
    try {
      setDeleteLoading(true);
      setDeleteResult(null);
      
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/interviews/${interviewToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDeleteResult({
        success: true,
        message: '面试已成功删除'
      });
      
      // 从列表中移除已删除的面试
      setInterviews(interviews.filter(i => i._id !== interviewToDelete._id));
      setShowDeleteModal(false);
      setInterviewToDelete(null);
    } catch (error) {
      console.error('Error deleting interview:', error);
      setDeleteResult({
        success: false,
        message: '删除面试失败，请稍后再试'
      });
    } finally {
      setDeleteLoading(false);
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
      <h1 className="text-3xl font-heiti mb-6">面试管理</h1>
      
      {/* 搜索 */}
      <div className="mb-6 bg-white border border-zinc-200 rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-zinc-500 mb-1">面试标题</label>
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="搜索面试标题"
              className="px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
          >
            搜索
          </button>
        </form>
      </div>
      
      {/* 删除结果提示 */}
      {deleteResult && (
        <div className={`mb-6 px-6 py-4 rounded-lg ${
          deleteResult.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p>{deleteResult.message}</p>
        </div>
      )}
      
      {/* 面试列表 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : error ? (
        <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 px-6 py-4 rounded-lg">
          <p>{error}</p>
        </div>
      ) : !interviews || interviews.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 px-6 py-4 rounded-lg">
          <p>没有找到符合条件的面试</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-zinc-200 rounded-lg">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">面试标题</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">创建者</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">问题数量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">参与人数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {interviews.map((interview) => (
                <tr key={interview._id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="font-medium">{interview.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{interview.creatorId?.username || '未知用户'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{interview.questionCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{interview.attemptCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(interview.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/interviews/${interview._id}`)}
                        className="text-sm px-3 py-1 rounded bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleDeleteClick(interview)}
                        className="text-sm px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* 分页 */}
      {!loading && interviews && interviews.length > 0 && (
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
            {[...Array(Math.min(totalPages, 5)).keys()].map((i) => {
              // 显示当前页附近的页码
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 border-t border-b border-zinc-200 ${
                    page === pageNum
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-zinc-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
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
      
      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-heiti mb-4">确认删除</h3>
            <p className="mb-6">
              您确定要删除面试 <span className="font-medium">{interviewToDelete?.title}</span> 吗？
              此操作将同时删除所有相关的面试尝试记录，且无法恢复。
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-zinc-200 rounded-md hover:bg-zinc-50"
                disabled={deleteLoading}
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterviews;
