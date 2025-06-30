import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { attemptService, interviewService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyAttempts = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('participated'); // 'participated' or 'created'
  const [attempts, setAttempts] = useState([]);
  const [createdInterviews, setCreatedInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'participated') {
      fetchMyAttempts();
    } else {
      fetchMyInterviews();
    }
  }, [activeTab, page]);

  const fetchMyAttempts = async () => {
    try {
      setLoading(true);
      const response = await attemptService.getUserAttempts(page, 10);
      setAttempts(response.data.attempts);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('获取面试记录失败');
      setLoading(false);
      console.error('Error fetching attempts:', err);
    }
  };

  const fetchMyInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getMyInterviews(page, 10);
      setCreatedInterviews(response.data.interviews);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('获取创建的面试失败');
      setLoading(false);
      console.error('Error fetching created interviews:', err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // 渲染面试尝试卡片
  const renderAttemptCard = (attempt) => {
    const isCompleted = attempt.status === 'completed';
    const hasReport = isCompleted && attempt.result && attempt.result.overallScore;
    
    return (
      <div key={attempt._id} className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
        <div className="p-6">
          <h3 className="text-lg font-heiti font-medium text-black mb-2 truncate">{attempt.interviewId.title}</h3>
          <div className="flex justify-between items-center text-sm text-zinc-500 mb-4">
            <span>参与时间: {new Date(attempt.createdAt).toLocaleDateString('zh-CN')}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              isCompleted ? 'bg-zinc-100 text-zinc-800 border border-zinc-200' : 'bg-black text-white'
            }`}>
              {isCompleted ? '已完成' : '进行中'}
            </span>
          </div>
          
          {hasReport && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600">总分</span>
                <span className="font-bold text-black">{attempt.result.overallScore}</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div 
                  className="bg-black h-2 rounded-full" 
                  style={{ width: `${attempt.result.overallScore}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            {isCompleted ? (
              <Link
                to={`/attempts/${attempt._id}`}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors inline-flex items-center gap-2"
              >
                查看报告
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <Link
                to={`/interviews/${attempt.interviewId._id}/session`}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors inline-flex items-center gap-2"
              >
                继续面试
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染创建的面试卡片
  const renderInterviewCard = (interview) => {
    const isActive = interview.status === 'active';
    
    return (
      <div key={interview._id} className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
        <div className="p-6">
          <h3 className="text-lg font-heiti font-medium text-black mb-2 truncate">{interview.title}</h3>
          <div className="flex justify-between items-center text-sm text-zinc-500 mb-4">
            <span>创建时间: {new Date(interview.createdAt).toLocaleDateString('zh-CN')}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              isActive ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
            }`}>
              {isActive ? '活跃' : '已关闭'}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm text-zinc-500 mb-4">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>参与人数: {interview.attemptCount || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>问题数量: {interview.questionCount}</span>
            </span>
          </div>
          
          <div className="flex justify-end mt-4 space-x-3">
            <Link
              to={`/interviews/${interview._id}`}
              className="px-4 py-2 bg-white text-black border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
            >
              查看详情
            </Link>
            <Link
              to={`/create-interview?edit=${interview._id}`}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              编辑
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-kaiti font-bold text-black">我的面试</h1>
        <p className="text-zinc-500 mt-2">查看您参与的面试和创建的面试</p>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-zinc-200">
        <button
          className={`px-4 py-2 -mb-px font-medium ${activeTab === 'participated' 
            ? 'text-black border-b-2 border-black' 
            : 'text-zinc-500 hover:text-zinc-800'}`}
          onClick={() => {
            setActiveTab('participated');
            setPage(1);
          }}
        >
          我参与的面试
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium ${activeTab === 'created' 
            ? 'text-black border-b-2 border-black' 
            : 'text-zinc-500 hover:text-zinc-800'}`}
          onClick={() => {
            setActiveTab('created');
            setPage(1);
          }}
        >
          我创建的面试
        </button>
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
      ) : activeTab === 'participated' && attempts.length === 0 ? (
        <div className="border border-zinc-200 p-10 rounded-lg text-center bg-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-xl font-kaiti text-zinc-700 mb-2">您还没有参与过任何面试</p>
          <p className="text-zinc-500 mb-6">点击下方按钮开始您的面试之旅</p>
          <Link
            to="/interviews"
            className="inline-block px-6 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors"
          >
            浏览面试列表
          </Link>
        </div>
      ) : activeTab === 'created' && createdInterviews.length === 0 ? (
        <div className="border border-zinc-200 p-10 rounded-lg text-center bg-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-kaiti text-zinc-700 mb-2">您还没有创建过任何面试</p>
          <p className="text-zinc-500 mb-6">创建您的第一个面试，开始招聘之旅</p>
          <Link
            to="/create-interview"
            className="inline-block px-6 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors"
          >
            创建第一个面试
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'participated'
            ? attempts.map(renderAttemptCard)
            : createdInterviews.map(renderInterviewCard)
          }
        </div>
      )}

      {/* 分页 */}
      {!loading && ((activeTab === 'participated' && attempts.length > 0) || 
                   (activeTab === 'created' && createdInterviews.length > 0)) && (
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

export default MyAttempts;
