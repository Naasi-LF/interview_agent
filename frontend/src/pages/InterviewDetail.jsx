import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/api';

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'leaderboard'

  useEffect(() => {
    fetchInterviewData();
  }, [id]);

  const fetchInterviewData = async () => {
    try {
      setLoading(true);
      const interviewResponse = await interviewService.getInterviewById(id);
      setInterview(interviewResponse.data);
      
      // 获取面试数据看板
      const dashboardResponse = await interviewService.getInterviewDashboard(id);
      setDashboard(dashboardResponse.data);
      
      setLoading(false);
    } catch (err) {
      setError('获取面试详情失败');
      setLoading(false);
      console.error('Error fetching interview details:', err);
    }
  };

  const startInterview = () => {
    navigate(`/interviews/${id}/session`);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 检查面试是否在有效时间内
  const isInterviewActive = () => {
    if (!interview) return false;
    const now = new Date();
    const startTime = new Date(interview.startTime);
    const endTime = new Date(interview.endTime);
    return now >= startTime && now <= endTime && interview.status === 'active';
  };

  // 渲染排行榜
  const renderLeaderboard = () => {
    if (!dashboard || !dashboard.leaderboard || dashboard.leaderboard.length === 0) {
      return (
        <div className="text-center py-10 bg-zinc-50 border border-zinc-200 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="text-zinc-700 font-kaiti text-lg">暂无排行数据</p>
          <p className="text-zinc-500 text-sm mt-2">当有参与者完成面试后将显示在此处</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto border border-zinc-200 rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-zinc-50 text-zinc-700 text-sm">
              <th className="py-3 px-6 text-left font-medium">排名</th>
              <th className="py-3 px-6 text-left font-medium">用户</th>
              <th className="py-3 px-6 text-center font-medium">总分</th>
              <th className="py-3 px-6 text-center font-medium">完成时间</th>
            </tr>
          </thead>
          <tbody className="text-zinc-700 text-sm">
            {dashboard.leaderboard.map((entry, index) => (
              <tr key={entry.attemptId} className={`border-b ${index < 3 ? 'bg-zinc-50' : ''} hover:bg-zinc-50`}>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`
                      ${index === 0 ? 'bg-black text-white' : ''}
                      ${index === 1 ? 'bg-zinc-600 text-white' : ''}
                      ${index === 2 ? 'bg-zinc-400 text-white' : ''}
                      ${index > 2 ? 'bg-zinc-100 text-zinc-800' : ''}
                      w-8 h-8 rounded-full flex items-center justify-center font-bold
                    `}>
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="flex items-center">
                    <img 
                      src={entry.avatarUrl || '/default-avatar.png'} 
                      className="w-8 h-8 rounded-full mr-2 border border-zinc-200" 
                      alt="User Avatar" 
                    />
                    <span className="font-medium">{entry.nickname || entry.username}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-center">
                  <span className="bg-zinc-100 text-zinc-800 border border-zinc-200 py-1 px-3 rounded-full text-xs font-medium">
                    {entry.overallScore}
                  </span>
                </td>
                <td className="py-3 px-6 text-center text-zinc-500">
                  {new Date(entry.completedAt).toLocaleString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 渲染分数分布
  const renderScoreDistribution = () => {
    if (!dashboard || !dashboard.scoreDistribution) {
      return null;
    }

    const { scoreDistribution } = dashboard;
    const maxCount = Math.max(...Object.values(scoreDistribution));
    
    if (maxCount === 0) {
      return null;
    }

    return (
      <div className="mt-8 bg-white border border-zinc-200 rounded-lg p-6">
        <h3 className="text-lg font-heiti font-semibold text-black mb-4">分数分布</h3>
        <div className="grid grid-cols-10 gap-1 h-40">
          {Object.entries(scoreDistribution).map(([score, count]) => {
            const heightPercentage = (count / maxCount) * 100;
            return (
              <div key={score} className="flex flex-col items-center">
                <div className="flex-grow w-full flex items-end">
                  <div 
                    className={`w-full ${count > 0 ? 'bg-black' : ''}`}
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-zinc-700 mt-1 font-medium">{score}</div>
                <div className="text-xs text-zinc-500">{count}人</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 px-6 py-4 rounded-lg relative flex items-center" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="block sm:inline">{error || '面试不存在'}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        {/* 面试标题和基本信息 */}
        <div className="p-6 flex justify-between items-center border-b border-zinc-200">
          <div>
            <h1 className="text-3xl font-heiti font-bold text-black mb-2">{interview.title}</h1>
            <div className="flex flex-wrap items-center text-sm text-zinc-500 mb-4 gap-4">
              <div className="flex items-center">
                <img
                  src={interview.creatorId.avatarUrl || '/default-avatar.png'}
                  alt="创建者头像"
                  className="w-6 h-6 rounded-full mr-2 border border-zinc-200"
                />
                <span>创建者: {interview.creatorId.nickname || interview.creatorId.username}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>参与人数: {interview.participantCount || 0}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${interview.status === 'active' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'}`}>
                {interview.status === 'active' ? '进行中' : interview.status === 'draft' ? '草稿' : '已结束'}
              </span>
            </div>
          </div>
          {isInterviewActive() && (
            <button
              onClick={startInterview}
              className="bg-black hover:bg-zinc-800 text-white px-6 py-2 rounded-md transition-colors"
            >
              开始面试
            </button>
          )}
        </div>
        
        {/* 选项卡导航 */}
        <div className="border-b border-zinc-200">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'info' 
                ? 'border-b-2 border-black text-black' 
                : 'text-zinc-500 hover:text-black'}`}
              onClick={() => setActiveTab('info')}
            >
              面试详情
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'leaderboard' 
                ? 'border-b-2 border-black text-black' 
                : 'text-zinc-500 hover:text-black'}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              排行榜
            </button>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="p-6">
          {activeTab === 'info' ? (
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-heiti font-semibold text-black mb-3">面试描述</h2>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                  <p className="text-zinc-800 whitespace-pre-line">{interview.description || '暂无描述'}</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-heiti font-semibold text-black mb-3">时间安排</h2>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-zinc-500 w-24">开始时间:</span>
                    <span className="text-zinc-800 font-medium">{formatDate(interview.startTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-zinc-500 w-24">结束时间:</span>
                    <span className="text-zinc-800 font-medium">{formatDate(interview.endTime)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-heiti font-semibold text-black mb-3">面试设置</h2>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-zinc-500 mr-2">每人最多尝试次数:</span>
                    <span className="text-zinc-800 font-medium">{interview.settings.maxAttempts} 次</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-zinc-500 mr-2">问题数量:</span>
                    <span className="text-zinc-800 font-medium">{interview.settings.questionsToAsk} 个</span>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-zinc-500">考察能力维度:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-7">
                      {interview.settings.competencyDimensions.map((dimension, index) => (
                        <span
                          key={index}
                          className="bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs px-3 py-1 rounded-full"
                        >
                          {dimension}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-heiti mb-4">排行榜</h2>
              {renderLeaderboard()}
              {renderScoreDistribution()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;
