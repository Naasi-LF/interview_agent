import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import CreateInterview from './pages/CreateInterview';
import Profile from './pages/Profile';
import InterviewList from './pages/InterviewList';
import InterviewDetail from './pages/InterviewDetail';
import InterviewSession from './pages/InterviewSession';
import InterviewReport from './pages/InterviewReport';
import MyAttempts from './pages/MyAttempts';
import ProtectedRoute from './components/ProtectedRoute';

// 自定义路由守卫组件
const RequireAuth = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
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
          
          <Route path="/admin" element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          } />
          
          <Route path="/dashboard" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;