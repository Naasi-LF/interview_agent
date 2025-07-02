import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminInterviews from './pages/AdminInterviews';
import AdminAttempts from './pages/AdminAttempts';
import Settings from './pages/Settings';
import CreateInterview from './pages/CreateInterview';
import Profile from './pages/Profile';
import InterviewList from './pages/InterviewList';
import InterviewDetail from './pages/InterviewDetail';
import InterviewSession from './pages/InterviewSession';
import InterviewReport from './pages/InterviewReport';
import MyAttempts from './pages/MyAttempts';
import TestAuth from './pages/TestAuth';
import ProtectedRoute from './components/ProtectedRoute';

// 自定义路由守卫组件
const RequireAuth = ({ children, requireAdmin = false }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // 检查是否需要管理员权限
  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 受保护的仪表盘路由 */}
          <Route path="/" element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }>
            {/* 仪表盘首页 */}
            <Route index element={<MyAttempts />} />
            <Route path="profile" element={<Profile />} />
            <Route path="create-interview" element={<CreateInterview />} />
            <Route path="settings" element={<Settings />} />
            
            {/* 面试相关路由 */}
            <Route path="interviews" element={<InterviewList />} />
            <Route path="interviews/:id" element={<InterviewDetail />} />
            <Route path="attempts/:id" element={<InterviewReport />} />
          </Route>
          
          {/* 面试进行页面（全屏模式，不需要导航栏） */}
          <Route path="/interviews/:id/session" element={
            <RequireAuth>
              <InterviewSession />
            </RequireAuth>
          } />
          
          {/* 测试身份验证页面 */}
          <Route path="/test-auth" element={
            <RequireAuth>
              <TestAuth />
            </RequireAuth>
          } />
          
          {/* 管理员路由 */}
          <Route path="/admin" element={
            <RequireAuth requireAdmin={true}>
              <AdminDashboard />
            </RequireAuth>
          }>
            <Route index element={<></>} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="interviews" element={<AdminInterviews />} />
            <Route path="interviews/:id" element={<InterviewDetail />} />
            <Route path="attempts" element={<AdminAttempts />} />
            <Route path="attempts/:id" element={<InterviewReport />} />
          </Route>
          
          <Route path="/dashboard" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;