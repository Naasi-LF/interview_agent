import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import settingsSvg from '../assets/images/settings.svg';

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
  
  // --- MODIFIED FUNCTION START ---
  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate password match if password is provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false); // Stop loading immediately on validation error
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
        
        // Use setTimeout to delay the success feedback by 1 second
        setTimeout(() => {
          setSuccess('Profile updated successfully');
          // Clear password fields after successful update
          setFormData(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
          }));
          setLoading(false); // Stop loading after the delay
        }, 100);

      } else {
        setSuccess('No changes to save');
        setLoading(false); // If no changes, stop loading immediately
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false); // On error, stop loading immediately
    }
    // We removed the 'finally' block because we now handle setLoading(false) in each specific case (success with delay, no changes, and error).
  };
  // --- MODIFIED FUNCTION END ---
  
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
    <div className="w-full flex gap-8">
      {/* 左侧设置表单 */}
      <div className="flex-1 max-w-2xl">
        <h2 className="text-3xl font-heiti mb-6">设置</h2>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
        
        <div>
          {/* Avatar */}
          <div className="mb-8 flex justify-center">
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
              <div className="absolute bottom-0 right-0 bg-black rounded-full p-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input 
                type="file" 
                id="avatar" 
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
              name="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
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
              name="nickname"
              type="text"
              placeholder="Nickname"
              value={formData.nickname}
              onChange={handleChange}
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
              name="bio"
              placeholder="Tell us about yourself"
              value={formData.bio || ''}
              onChange={handleChange}
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
              name="password"
              type="password"
              placeholder="留空以保持当前密码"
              value={formData.password}
              onChange={handleChange}
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
              name="confirmPassword"
              type="password"
              placeholder="确认您的新密码"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-6 rounded focus:outline-none"
              onClick={handleCancel}
            >
              取消
            </button>
            <button
              type="button"
              className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded focus:outline-none"
              disabled={loading}
              onClick={handleSave}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {/* 右侧大图 */}
      <div className="flex-1 flex items-center justify-center">
        <img 
          src={settingsSvg} 
          alt="设置装饰图" 
          className="w-full max-w-lg h-auto"
        />
      </div>
    </div>
  );
};

export default Settings;