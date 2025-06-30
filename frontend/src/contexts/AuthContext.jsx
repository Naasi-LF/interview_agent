import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // 这个loading主要用于整个应用的初始加载
  const [loading, setLoading] = useState(true); 
  // 这个error主要用于登录/注册过程中的错误
  const [error, setError] = useState(null);

  // 组件首次挂载时，检查本地存储中是否已有用户信息
  useEffect(() => {
    // 假设authService可以从localStorage或cookie中同步获取用户信息
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false); // 检查完毕，结束初始加载状态
  }, []);

  // 注册新用户
  const register = async (username, password, nickname) => {
    try {
      setError(null);
      const data = await authService.register({ username, password, nickname });
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // 登录用户
  const login = async (username, password) => {
    try {
      setError(null);
      const data = await authService.login({ username, password });
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // 登出用户
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };
  
  // --- 关键改动 1: 简化 updateUser 函数 ---
  // 这个函数现在只负责调用API并返回结果。
  // 它不再管理 loading 状态或直接更新 currentUser。
  // 错误会向上抛出，由调用它的组件（如Settings.js）去处理。
  const updateUser = async (userData) => {
    try {
      const data = await userService.updateProfile(userData);
      // 只返回更新后的 user 对象
      return data.user; 
    } catch (error) {
      // 将错误抛出，以便 Settings 组件可以捕获并显示它
      throw error;
    }
  };

  // --- 关键改动 2: 在 value 对象中导出 setCurrentUser ---
  // 这样其他组件就可以通过 useAuth() 来获取并使用它。
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    setCurrentUser // <-- 导出 state 更新函数
  };

  return (
    <AuthContext.Provider value={value}>
      {/* 这是一个好习惯：确保在初始用户信息加载完成前，不渲染依赖用户信息的子组件 */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;