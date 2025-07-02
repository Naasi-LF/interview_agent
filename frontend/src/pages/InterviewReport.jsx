import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// 雷达图组件
const RadarChart = ({ scores, dimensions }) => {
  const maxScore = 100;
  const centerX = 150;
  const centerY = 150;
  const radius = 120;
  
  // 计算多边形的点
  const calculatePoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const x = centerX + (radius * value) / maxScore * Math.cos(angle);
    const y = centerY + (radius * value) / maxScore * Math.sin(angle);
    return { x, y };
  };
  
  // 生成多边形路径
  const generatePolygonPoints = () => {
    return dimensions.map((dimension, index) => {
      const value = scores[dimension] || 0;
      const point = calculatePoint(index, value);
      return `${point.x},${point.y}`;
    }).join(' ');
  };
  
  // 生成网格线
  const generateGridLines = () => {
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
    return gridLevels.map(level => {
      const points = dimensions.map((_, index) => {
        const point = calculatePoint(index, maxScore * level);
        return `${point.x},${point.y}`;
      }).join(' ');
      return (
        <polygon 
          key={level} 
          points={points} 
          fill="none" 
          stroke="#e4e4e7" 
          strokeWidth="1"
        />
      );
    });
  };
  
  // 生成轴线
  const generateAxes = () => {
    return dimensions.map((_, index) => {
      const point = calculatePoint(index, maxScore);
      return (
        <line 
          key={index} 
          x1={centerX} 
          y1={centerY} 
          x2={point.x} 
          y2={point.y} 
          stroke="#d4d4d8" 
          strokeWidth="1"
        />
      );
    });
  };
  
  // 生成标签
  const generateLabels = () => {
    return dimensions.map((dimension, index) => {
      const point = calculatePoint(index, maxScore * 1.1);
      return (
        <text 
          key={index} 
          x={point.x} 
          y={point.y} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          className="text-xs font-heiti fill-zinc-700"
        >
          {dimension}
        </text>
      );
    });
  };
  
  // 生成分数点
  const generateScorePoints = () => {
    return dimensions.map((dimension, index) => {
      const value = scores[dimension] || 0;
      const point = calculatePoint(index, value);
      return (
        <circle 
          key={index} 
          cx={point.x} 
          cy={point.y} 
          r="4" 
          fill="#000000"
        />
      );
    });
  };
  
  return (
    <svg width="300" height="300" viewBox="0 0 300 300">
      {/* 网格线 */}
      {generateGridLines()}
      
      {/* 轴线 */}
      {generateAxes()}
      
      {/* 能力多边形 */}
      <polygon 
        points={generatePolygonPoints()} 
        fill="rgba(0, 0, 0, 0.1)" 
        stroke="#000000" 
        strokeWidth="2"
      />
      
      {/* 分数点 */}
      {generateScorePoints()}
      
      {/* 维度标签 */}
      {generateLabels()}
    </svg>
  );
};

const InterviewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullQA, setShowFullQA] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    fetchAttemptData();
  }, [id, refreshCount]);

  // 如果报告未生成，每5秒自动刷新一次
  useEffect(() => {
    if (attempt && attempt.status === 'completed' && (!attempt.result || !attempt.result.overallScore)) {
      const timer = setTimeout(() => {
        setRefreshCount(prev => prev + 1);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [attempt]);

  const fetchAttemptData = async () => {
    try {
      setLoading(true);
      const response = await attemptService.getAttemptById(id);
      setAttempt(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || '获取面试报告失败');
      setLoading(false);
      console.error('Error fetching attempt data:', err);
    }
  };

  const reportContentRef = useRef(null);

  // 生成Markdown格式的报告
  const generateMarkdownReport = () => {
    if (!attempt || !attempt.result) {
      return '';
    }
    
    const { result, interviewId, userId } = attempt;
    const { overallScore } = result;
    const competencyDimensions = interviewId.settings.competencyDimensions || [];
    const dimensionalScores = result.dimensionalScores || {};
    const qaLog = attempt.qaLog || [];
    
    // 基本信息
    let markdown = `# 面试报告: ${interviewId.title}\n\n`;
    markdown += `- **参与者**: ${userId.nickname || userId.username}\n`;
    markdown += `- **完成时间**: ${new Date(result.completedAt).toLocaleString('zh-CN')}\n`;
    markdown += `- **总分**: ${overallScore.toFixed(1)}\n\n`;
    
    // 生成雷达图的mermaid代码
    markdown += `## 能力维度评分\n\n`;
    markdown += '```mermaid\npie\n';
    
    // 添加各维度得分
    if (competencyDimensions && competencyDimensions.length > 0) {
      competencyDimensions.forEach(dimension => {
        const score = dimensionalScores[dimension] || 0;
        markdown += `    "${dimension}: ${score.toFixed(1)}" : ${score}\n`;
      });
    }
    markdown += '```\n\n';
    
    // 问题与回答
    markdown += `## 问题与回答\n\n`;
    if (qaLog && qaLog.length > 0) {
      qaLog.forEach((qa, index) => {
        markdown += `### 问题 ${index + 1}\n\n`;
        markdown += `**问题**: ${qa.question}\n\n`;
        markdown += `**回答**: ${qa.answer}\n\n`;
        if (qa.score !== undefined) {
          markdown += `**评分**: ${qa.score.toFixed(1)}\n\n`;
        }
        if (qa.feedback) {
          markdown += `**反馈**: ${qa.feedback}\n\n`;
        }
      });
    }
    
    // 总体评价
    if (result.aiComment) {
      markdown += `## 总体评价\n\n${result.aiComment}\n`;
    }
    
    return markdown;
  };

  // 导出Markdown文件
  const handleExportMarkdown = async () => {
    try {
      setExportingPdf(true); // 复用现有状态变量
      
      // 生成Markdown内容
      const markdownContent = generateMarkdownReport();
      
      // 创建Blob对象
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `面试报告_${attempt.interviewId.title}_${new Date().toLocaleDateString('zh-CN')}.md`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportingPdf(false);
    } catch (err) {
      console.error('Error exporting markdown:', err);
      alert('导出报告失败，请稍后再试');
      setExportingPdf(false);
    }
  };

  // 检查是否是创建者
  const isCreator = () => {
    if (!attempt || !currentUser) return false;
    return attempt.interviewId.creatorId._id === currentUser.id;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="bg-zinc-100 border border-zinc-300 text-zinc-800 px-4 py-3 rounded-lg relative flex items-center" role="alert">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span className="block sm:inline">{error || '面试报告不存在'}</span>
      </div>
    );
  }

  // 检查报告是否已生成
  const isReportGenerated = attempt.result && attempt.result.overallScore !== undefined;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        {/* 报告头部 */}
        <div className="p-6 border-b border-zinc-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-heiti font-bold text-black mb-2">面试报告</h1>
              <h2 className="text-xl text-zinc-700 mb-4">{attempt.interviewId.title}</h2>
              <div className="flex items-center text-sm text-zinc-500">
                <div className="flex items-center mr-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>参与者: {attempt.userId.nickname || attempt.userId.username}</span>
                </div>
                <div className="flex items-center mr-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>完成时间: {new Date(attempt.result?.completedAt).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex items-center mr-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <span>问题数量: {attempt.qaLog ? attempt.qaLog.length : 0} 题</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleExportMarkdown}
              disabled={exportingPdf}
              className={`px-4 py-2 rounded-md transition flex items-center ${exportingPdf 
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'}`}
            >
              {exportingPdf ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  导出报告
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* 报告内容 */}
        <div className="p-6" ref={reportContentRef}>
          {!isReportGenerated ? (
            <div className="text-center py-10">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-zinc-100 h-16 w-16 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-zinc-600 font-kaiti text-lg mb-2">报告生成中，请稍候...</p>
                <div className="h-2 w-32 bg-zinc-200 rounded">
                  <div className="h-full bg-black rounded animate-[pulse_1.5s_ease-in-out_infinite] w-1/2"></div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* 总分和雷达图 */}
              <div className="flex flex-col md:flex-row items-center mb-8">
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4">
                  <div className="text-6xl font-bold text-black mb-2">{attempt.result.overallScore}</div>
                  <div className="text-zinc-500">总分</div>
                </div>
                <div className="w-full md:w-2/3 flex justify-center">
                  <RadarChart 
                    scores={Object.fromEntries(
                      Object.entries(attempt.result.dimensionalScores)
                    )} 
                    dimensions={attempt.interviewId.settings.competencyDimensions} 
                  />
                </div>
              </div>
              
              {/* 各维度得分 */}
              <div className="mb-8">
                <h3 className="text-xl font-heiti font-semibold text-black mb-4">能力维度评分</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {attempt.interviewId.settings.competencyDimensions.map((dimension) => {
                    const score = attempt.result.dimensionalScores[dimension] || 0;
                    let scoreClass;
                    
                    if (score < 60) scoreClass = 'bg-zinc-100 text-zinc-800';
                    else if (score >= 60 && score < 75) scoreClass = 'bg-zinc-100 text-zinc-800';
                    else if (score >= 75 && score < 90) scoreClass = 'bg-zinc-100 text-zinc-800';
                    else scoreClass = 'bg-black text-white';
                    
                    return (
                      <div key={dimension} className="bg-white rounded-lg border border-zinc-200 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-heiti text-black">{dimension}</span>
                          <span className={`${scoreClass} text-sm font-medium px-2 py-1 rounded-full`}>
                            {score}分
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2">
                          <div 
                            className="bg-black h-2 rounded-full" 
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* AI评语 */}
              <div className="mb-8">
                <h3 className="text-xl font-heiti font-semibold text-black mb-4">综合评价</h3>
                <div className="bg-white rounded-lg p-6 border border-zinc-200">
                  <p className="text-zinc-800 whitespace-pre-line font-kaiti">{attempt.result.aiComment}</p>
                </div>
              </div>
              
              {/* 问答记录 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-heiti font-semibold text-black">面试问答记录</h3>
                  <button
                    onClick={() => setShowFullQA(!showFullQA)}
                    className="text-zinc-700 hover:text-black transition-colors"
                  >
                    {showFullQA ? '收起' : '展开全部'}
                  </button>
                </div>
                <div className="bg-white rounded-lg border border-zinc-200">
                  {(showFullQA ? attempt.qaLog : attempt.qaLog.slice(0, 2)).map((qa, index) => (
                    <div key={index} className={`p-4 ${index !== 0 ? 'border-t border-zinc-100' : ''}`}>
                      <div className="mb-2">
                        <span className="font-bold text-black">问题 {index + 1}:</span>
                        <p className="mt-1 text-zinc-800 font-kaiti">{qa.question}</p>
                      </div>
                      <div>
                        <span className="font-bold text-zinc-700">回答:</span>
                        <p className="mt-1 text-zinc-700 whitespace-pre-line">{qa.answer}</p>
                      </div>
                    </div>
                  ))}
                  {!showFullQA && attempt.qaLog.length > 2 && (
                    <div className="p-4 text-center border-t border-zinc-100">
                      <button
                        onClick={() => setShowFullQA(true)}
                        className="text-zinc-700 hover:text-black transition-colors"
                      >
                        查看全部 {attempt.qaLog.length} 个问答
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;
