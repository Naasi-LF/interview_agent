import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService, attemptService } from '../services/api';

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchInterviewAndStartAttempt();
  }, [id]);

  const fetchInterviewAndStartAttempt = async () => {
    try {
      setLoading(true);
      // 获取面试详情
      const interviewResponse = await interviewService.getInterviewById(id);
      setInterview(interviewResponse.data);
      
      // 先检查用户是否有进行中的面试尝试
      const userAttemptsResponse = await attemptService.getUserAttempts(1, 100);
      const inProgressAttempt = userAttemptsResponse.data.attempts.find(
        attempt => attempt.interviewId._id === id && attempt.status === 'in_progress'
      );
      
      if (inProgressAttempt) {
        // 如果有进行中的面试尝试，继续该尝试
        setAttemptId(inProgressAttempt._id);
        
        // 计算当前应该显示的问题
        const questionIndex = inProgressAttempt.qaLog.length;
        const currentQuestionToShow = interviewResponse.data.settings.questionPool[questionIndex];
        setCurrentQuestion(currentQuestionToShow);
        
        // 设置历史问答记录
        setQuestionHistory(inProgressAttempt.qaLog.map(qa => ({
          question: qa.question,
          answer: qa.answer
        })));
        
        console.log('继续进行中的面试尝试:', inProgressAttempt._id);
      } else {
        // 如果没有进行中的面试尝试，创建新的
        const attemptResponse = await attemptService.startAttempt(id);
        setAttemptId(attemptResponse.data.attemptId);
        setCurrentQuestion(attemptResponse.data.firstQuestion);
        console.log('创建新的面试尝试:', attemptResponse.data.attemptId);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || '开始面试失败');
      setLoading(false);
      console.error('Error starting interview:', err);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // 保存当前问题和回答到历史记录
      setQuestionHistory(prev => [...prev, { question: currentQuestion, answer }]);
      
      // 提交回答并获取下一个问题
      const response = await attemptService.submitAnswer(attemptId, currentQuestion, answer);
      
      if (response.data.nextQuestion) {
        // 还有下一个问题
        setCurrentQuestion(response.data.nextQuestion);
        setAnswer('');
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      } else {
        // 面试已完成
        setCompleted(true);
        setTimeout(() => {
          navigate(`/attempts/${attemptId}`);
        }, 3000);
      }
      
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.message || '提交回答失败');
      setSubmitting(false);
      console.error('Error submitting answer:', err);
    }
  };

  const handleKeyDown = (e) => {
    // 按下Ctrl+Enter提交回答
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
        <p className="text-zinc-600 font-kaiti">正在准备面试，请稍候...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-zinc-100 border border-zinc-400 text-zinc-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <div className="mt-4">
            <button 
              onClick={() => navigate(`/interviews/${id}`)}
              className="bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded"
            >
              返回面试详情
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg className="w-16 h-16 text-black mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h2 className="text-2xl font-heiti mb-2">面试已完成！</h2>
          <p className="text-zinc-600 mb-6">正在生成您的面试报告，请稍候...</p>
          <div className="animate-pulse flex justify-center">
            <div className="h-2 w-24 bg-zinc-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* 头部信息 */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-heiti">{interview?.title || '面试进行中'}</h1>
          <button
            onClick={() => {
              if (window.confirm('确定要退出面试吗？您的进度将不会保存。')) {
                navigate(`/interviews/${id}`);
              }
            }}
            className="text-zinc-700 hover:text-black"
          >
            退出面试
          </button>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-6xl mx-auto w-full p-4">
        {/* 历史问答记录 */}
        <div className="flex-1 overflow-y-auto mb-4 rounded-lg bg-white shadow-sm">
          <div className="p-6">
            {questionHistory.map((item, index) => (
              <div key={index} className="mb-8">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white mr-3 flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-zinc-100 rounded-lg p-4 max-w-3xl">
                    <p className="text-zinc-800 font-kaiti">{item.question}</p>
                  </div>
                </div>
                <div className="flex items-start pl-16">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700 mr-3 flex-shrink-0">
                    我
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-4 max-w-3xl">
                    <p className="text-zinc-800 whitespace-pre-line">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 当前问题 */}
            {currentQuestion && (
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white mr-3 flex-shrink-0">
                  AI
                </div>
                <div className="bg-zinc-100 rounded-lg p-4 max-w-3xl">
                  <p className="text-zinc-800 font-kaiti">{currentQuestion}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 回答区域 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在这里输入您的回答..."
            className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            rows="5"
            disabled={submitting}
          ></textarea>
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm text-zinc-500">提示：按 Ctrl+Enter 快速提交</p>
            <button
              onClick={handleSubmitAnswer}
              disabled={submitting || !answer.trim()}
              className={`px-6 py-2 rounded-md ${
                submitting || !answer.trim()
                  ? 'bg-zinc-300 cursor-not-allowed'
                  : 'bg-black hover:bg-zinc-800 text-white'
              }`}
            >
              {submitting ? '提交中...' : '提交回答'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
