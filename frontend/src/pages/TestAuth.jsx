import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestAuth = () => {
  const { currentUser } = useAuth();
  const [tokenInfo, setTokenInfo] = useState(null);

  useEffect(() => {
    // 获取并解析token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // 解析JWT token (不验证签名)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        setTokenInfo(JSON.parse(jsonPayload));
      } catch (error) {
        console.error('Token parsing error:', error);
      }
    }
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">身份验证测试</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">当前用户信息</h2>
        {currentUser ? (
          <div>
            <p><strong>用户名:</strong> {currentUser.username}</p>
            <p><strong>昵称:</strong> {currentUser.nickname || '未设置'}</p>
            <p><strong>角色:</strong> {currentUser.role || '未知'}</p>
            <p><strong>ID:</strong> {currentUser.id || currentUser._id}</p>
          </div>
        ) : (
          <p>未登录</p>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Token 信息</h2>
        {tokenInfo ? (
          <div>
            <p><strong>用户ID:</strong> {tokenInfo.id}</p>
            <p><strong>角色:</strong> {tokenInfo.role}</p>
            <p><strong>过期时间:</strong> {new Date(tokenInfo.exp * 1000).toLocaleString()}</p>
            <p><strong>签发时间:</strong> {new Date(tokenInfo.iat * 1000).toLocaleString()}</p>
            <pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto max-h-60">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </div>
        ) : (
          <p>无Token或Token无效</p>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">localStorage 内容</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
          {JSON.stringify({
            token: localStorage.getItem('token') ? '存在(已省略显示)' : '不存在',
            user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : '不存在'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestAuth;
