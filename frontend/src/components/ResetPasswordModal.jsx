import React, { useState } from 'react';

const ResetPasswordModal = ({ isOpen, onClose, onSubmit, userId, username }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证密码
    if (!password) {
      setError('请输入新密码');
      return;
    }
    
    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(userId, password);
      setPassword('');
      setConfirmPassword('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.message || '重置密码失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-heiti mb-4">重置密码</h3>
        <p className="mb-4 text-zinc-600">
          您正在为用户 <span className="font-medium">{username}</span> 重置密码
        </p>
        
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-zinc-600 mb-1">新密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="请输入新密码"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm text-zinc-600 mb-1">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="请再次输入新密码"
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 rounded-md hover:bg-zinc-50"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
              disabled={loading}
            >
              {loading ? '提交中...' : '确认重置'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
