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
          
          {/* 受保护的路由 */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }>
            <Route index element={<div className="w-full">
              <h2 className="text-3xl font-heiti mb-6">仪表盘</h2>
              <div className="bg-gray-50 rounded-lg p-10 flex items-center justify-center h-[600px]">
                <p className="text-xl text-gray-500 font-kaiti">仪表盘内容将在未来更新中实现</p>
              </div>
            </div>} />
            <Route path="profile" element={<Profile />} />
            <Route path="create-interview" element={<CreateInterview />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="/admin" element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;