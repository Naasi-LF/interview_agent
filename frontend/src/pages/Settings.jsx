import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { currentUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    bio: '',
    password: '',
    confirmPassword: '',
    avatarUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  
  // Load user data when component mounts
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        nickname: currentUser.nickname || '',
        bio: currentUser.bio || '',
        password: '',
        confirmPassword: '',
        avatarUrl: currentUser.avatarUrl || ''
      });
      setPreviewAvatar(currentUser.avatarUrl || '');
    }
  }, [currentUser]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewAvatar(event.target.result);
      setFormData(prev => ({
        ...prev,
        avatarUrl: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate password match if password is provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Only send fields that have values
      const updateData = {};
      if (formData.username !== currentUser.username) updateData.username = formData.username;
      if (formData.nickname !== currentUser.nickname) updateData.nickname = formData.nickname;
      if (formData.bio !== currentUser.bio) updateData.bio = formData.bio;
      if (formData.password) {
        updateData.password = formData.password;
        updateData.confirmPassword = formData.confirmPassword;
      }
      if (formData.avatarUrl !== currentUser.avatarUrl) updateData.avatarUrl = formData.avatarUrl;
      
      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateUser(updateData);
        setSuccess('Profile updated successfully');
      } else {
        setSuccess('No changes to save');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out');
    }
  };
  
  const handleCancel = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="w-full h-screen flex bg-white">
      {/* Left sidebar */}
      <div className="w-28 h-full bg-zinc-900 flex flex-col items-center">
        {/* Home icon */}
        <div className="w-20 h-20 mt-14 flex items-center justify-center cursor-pointer" onClick={() => navigate('/dashboard')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        
        {/* Profile icon */}
        <div className="w-20 h-20 mt-10 flex items-center justify-center cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        {/* Add interview icon */}
        <div className="w-20 h-20 mt-40 flex items-center justify-center cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        
        {/* Settings icon (active) */}
        <div className="w-20 h-20 mt-auto mb-10 flex items-center justify-center cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
      
      {/* Settings sidebar */}
      <div className="w-64 h-full border-r border-gray-200 p-8">
        <div className="flex items-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <h2 className="text-xl font-fangyuan">设置</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center text-black font-medium cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="font-kaiti">编辑资料</span>
          </div>
          
          <div className="flex items-center text-gray-500 cursor-pointer" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-kaiti">退出登录</span>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-heiti mb-8">编辑资料</h2>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className="flex justify-end mb-8">
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full overflow-hidden cursor-pointer relative bg-gray-200 flex items-center justify-center"
                onClick={handleAvatarClick}
              >
                {previewAvatar ? (
                  <img 
                    src={previewAvatar} 
                    alt="User avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div 
                className="absolute bottom-0 right-0 bg-black rounded-full p-1 cursor-pointer"
                onClick={handleAvatarClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Username */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-fangyuan" htmlFor="username">
              用户名
            </label>
            <input
              className="border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-gray-500"
              id="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          {/* Nickname */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-fangyuan" htmlFor="nickname">
              昵称
            </label>
            <input
              className="border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-gray-500"
              id="nickname"
              type="text"
              placeholder="Nickname"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-fangyuan" htmlFor="bio">
              个人简介
            </label>
            <textarea
              className="border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-gray-500 h-32"
              id="bio"
              placeholder="Tell us about yourself"
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-fangyuan" htmlFor="password">
              密码
            </label>
            <input
              className="border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-gray-500"
              id="password"
              type="password"
              placeholder="留空以保持当前密码"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-8">
            <label className="block text-gray-700 mb-2 font-fangyuan" htmlFor="confirmPassword">
              确认密码
            </label>
            <input
              className="border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-gray-500"
              id="confirmPassword"
              type="password"
              placeholder="确认您的新密码"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-6 rounded focus:outline-none"
              onClick={() => navigate('/dashboard')}
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded focus:outline-none"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
