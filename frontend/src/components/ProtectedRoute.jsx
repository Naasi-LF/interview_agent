import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }
  
  // 如果没有用户，重定向到登录页
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // 如果有用户，渲染子路由
  return <Outlet />;
};

export default ProtectedRoute;
