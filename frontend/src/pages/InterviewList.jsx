import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interviewService } from '../services/api';

const InterviewList = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchInterviews();
  }, [page, search]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getInterviews(page, 10, search);
      setInterviews(response.data.interviews);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('获取面试列表失败');
      setLoading(false);
      console.error('Error fetching interviews:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); // 重置页码
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-kaiti font-bold text-black">面试列表</h1>
        <p className="text-zinc-500 mt-2">浏览可用的面试并开始您的面试旅程</p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="搜索面试..."
              className="px-4 py-2 w-full border border-zinc-200 rounded-l-md focus:outline-none focus:ring-1 focus:ring-black"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-r-md hover:bg-zinc-800 transition-colors"
            >
              搜索
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : error ? (
        <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 px-6 py-4 rounded-lg relative flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : interviews.length === 0 ? (
        <div className="border border-zinc-200 p-10 rounded-lg text-center bg-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-xl font-kaiti text-zinc-700 mb-2">暂无可用的面试</p>
          <p className="text-zinc-500">请稍后再来查看或尝试其他搜索条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => (
            <Link
              to={`/interviews/${interview._id}`}
              key={interview._id}
              className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-heiti font-medium text-black mb-2 truncate">{interview.title}</h2>
                <p className="text-zinc-600 mb-4 h-12 overflow-hidden">{interview.description.substring(0, 80)}...</p>
                <div className="flex justify-between items-center text-sm text-zinc-500">
                  <div className="flex items-center">
                    <img
                      src={interview.creatorId.avatarUrl || '/default-avatar.png'}
                      alt="创建者头像"
                      className="w-6 h-6 rounded-full mr-2 border border-zinc-200"
                    />
                    <span>{interview.creatorId.nickname || interview.creatorId.username}</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {interview.participantCount || 0} 人参与
                  </span>
                </div>
              </div>
              <div className="bg-zinc-50 px-6 py-3 flex justify-between items-center border-t border-zinc-200">
                <div className="text-xs text-zinc-500">
                  {new Date(interview.startTime).toLocaleDateString()} - {new Date(interview.endTime).toLocaleDateString()}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${interview.status === 'active' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'}`}>
                  {interview.status === 'active' ? '进行中' : interview.status === 'draft' ? '草稿' : '已结束'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {!loading && interviews.length > 0 && (
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
    </div>
  );
};

export default InterviewList;
