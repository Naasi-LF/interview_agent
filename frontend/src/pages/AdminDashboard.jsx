import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { adminService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'admin') {
      // 重定向非管理员用户到普通仪表盘
      navigate('/');
    } else {
      setLoading(false);
      fetchStats();
    }
  }, [currentUser, navigate]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex bg-white">
      {/* 左侧导航栏 */}
      <div className="w-28 min-h-screen bg-black flex flex-col items-center justify-between py-10 sticky top-0">
        <div className="flex flex-col items-center space-y-10">
          {/* 仪表盘图标 */}
          <NavLink 
            to="/admin"
            end
            className={({ isActive }) => `w-20 h-20 flex items-center justify-center cursor-pointer ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </NavLink>
          
          {/* 用户管理图标 */}
          <NavLink 
            to="/admin/users"
            className={({ isActive }) => `w-20 h-20 flex items-center justify-center cursor-pointer ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </NavLink>
          
          {/* 面试管理图标 */}
          <NavLink 
            to="/admin/interviews"
            className={({ isActive }) => `w-20 h-20 flex items-center justify-center cursor-pointer ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </NavLink>

          {/* 面试尝试管理图标 */}
          <NavLink 
            to="/admin/attempts"
            className={({ isActive }) => `w-20 h-20 flex items-center justify-center cursor-pointer ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </NavLink>
        </div>
        
        <div className="flex flex-col items-center space-y-10">
          {/* 退出登录图标 */}
          <div 
            onClick={handleLogout}
            className="w-20 h-20 flex items-center justify-center cursor-pointer hover:bg-zinc-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 p-10 overflow-auto">
        <Outlet />
        
        {/* 默认显示仪表盘内容 */}
        {window.location.pathname === '/admin' && (
          <div>
            <h1 className="text-3xl font-heiti mb-8">管理员仪表盘</h1>
            
            {statsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : stats ? (
              <div>
                {/* 核心数据卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="text-lg font-heiti font-medium text-black mb-2">用户数</h3>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-medium">{stats.totalUsers}</div>
                      <div className="text-sm text-zinc-500">新增: <span className="text-green-600">+{stats.newUsers}</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="text-lg font-heiti font-medium text-black mb-2">面试数</h3>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-medium">{stats.totalInterviews}</div>
                      <div className="text-sm text-zinc-500">新增: <span className="text-green-600">+{stats.newInterviews}</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="text-lg font-heiti font-medium text-black mb-2">尝试数</h3>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-medium">{stats.totalAttempts}</div>
                      <div className="text-sm text-zinc-500">新增: <span className="text-green-600">+{stats.newAttempts}</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="text-lg font-heiti font-medium text-black mb-2">完成率</h3>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-medium">{stats.completionRate}%</div>
                      <div className="text-sm text-zinc-500">完成: {stats.completedAttempts}/{stats.totalAttempts}</div>
                    </div>
                  </div>
                </div>
                
                {/* 时间序列图表 */}
                <div className="grid grid-cols-1 gap-8 mb-8">
                  {/* 用户注册趋势 */}
                  <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="text-lg font-heiti font-medium text-black mb-4">用户注册趋势 (30天)</h3>
                    <div className="h-80">
                      {stats.timeSeriesData?.users && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={stats.timeSeriesData.users}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => value.substring(5)} // 只显示月-日
                              interval={2} // 每隔两天显示一个刻度
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`${value} 人`, '新注册']}
                              labelFormatter={(label) => `日期: ${label}`}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="count" 
                              name="新注册用户" 
                              stroke="#3b82f6" 
                              fill="#93c5fd" 
                              activeDot={{ r: 6 }} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                  
                  {/* 面试创建趋势 */}
                  <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="text-lg font-heiti font-medium text-black mb-4">面试创建趋势 (30天)</h3>
                    <div className="h-80">
                      {stats.timeSeriesData?.interviews && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={stats.timeSeriesData.interviews}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => value.substring(5)} 
                              interval={2}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`${value} 个`, '新创建']}
                              labelFormatter={(label) => `日期: ${label}`}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              name="新创建面试" 
                              stroke="#10b981" 
                              activeDot={{ r: 6 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                  
                  {/* 面试尝试状态分布 */}
                  <div className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="text-lg font-heiti font-medium text-black mb-4">面试尝试状态分布 (30天)</h3>
                    <div className="h-80">
                      {stats.timeSeriesData?.attempts && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.timeSeriesData.attempts}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => value.substring(5)} 
                              interval={2}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => {
                                const labels = {
                                  completed: '已完成',
                                  inProgress: '进行中',
                                  abandoned: '已放弃',
                                  total: '总计'
                                };
                                return [`${value} 个`, labels[name] || name];
                              }}
                              labelFormatter={(label) => `日期: ${label}`}
                            />
                            <Legend 
                              formatter={(value) => {
                                const labels = {
                                  completed: '已完成',
                                  inProgress: '进行中',
                                  abandoned: '已放弃',
                                  total: '总计'
                                };
                                return labels[value] || value;
                              }}
                            />
                            <Bar dataKey="completed" name="completed" stackId="a" fill="#10b981" />
                            <Bar dataKey="inProgress" name="inProgress" stackId="a" fill="#3b82f6" />
                            <Bar dataKey="abandoned" name="abandoned" stackId="a" fill="#ef4444" />
                            <Line 
                              type="monotone" 
                              dataKey="total" 
                              name="total" 
                              stroke="#000000" 
                              strokeWidth={2}
                              dot={{ r: 3 }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>  
                
                {/* 快速访问卡片 */}
                <h2 className="text-xl font-heiti mb-4">快速访问</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                    <div className="p-6">
                      <h3 className="text-lg font-heiti font-medium text-black mb-2">用户管理</h3>
                      <p className="text-zinc-600 mb-4">查看和管理平台用户，重置密码</p>
                    </div>
                    <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-200">
                      <button 
                        onClick={() => navigate('/admin/users')} 
                        className="text-black hover:underline text-sm flex items-center"
                      >
                        查看用户列表
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                    <div className="p-6">
                      <h3 className="text-lg font-heiti font-medium text-black mb-2">面试管理</h3>
                      <p className="text-zinc-600 mb-4">查看和管理所有面试活动</p>
                    </div>
                    <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-200">
                      <button 
                        onClick={() => navigate('/admin/interviews')} 
                        className="text-black hover:underline text-sm flex items-center"
                      >
                        查看面试列表
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                    <div className="p-6">
                      <h3 className="text-lg font-heiti font-medium text-black mb-2">面试尝试管理</h3>
                      <p className="text-zinc-600 mb-4">查看所有用户的面试尝试记录</p>
                    </div>
                    <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-200">
                      <button 
                        onClick={() => navigate('/admin/attempts')} 
                        className="text-black hover:underline text-sm flex items-center"
                      >
                        查看尝试列表
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 px-6 py-4 rounded-lg">
                <p>无法加载统计数据，请稍后再试</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
