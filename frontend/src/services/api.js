import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },
};

// User services
export const userService = {
  getProfile: async () => {
    return await api.get('/users/me');
  },
  updateProfile: async (userData) => {
    const response = await api.put('/users/me', userData);
    if (response.data.user) {
      // Update the user in local storage with new data
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
};

// Interview services
export const interviewService = {
  // 获取所有公开面试列表
  getInterviews: async (page = 1, limit = 10, search = '') => {
    return await api.get(`/interviews?page=${page}&limit=${limit}&search=${search}`);
  },
  
  // 获取单个面试详情
  getInterviewById: async (id) => {
    return await api.get(`/interviews/${id}`);
  },
  
  // 创建新面试
  createInterview: async (interviewData) => {
    return await api.post('/interviews', interviewData);
  },
  
  // 更新面试
  updateInterview: async (id, interviewData) => {
    return await api.put(`/interviews/${id}`, interviewData);
  },
  
  // 删除面试
  deleteInterview: async (id) => {
    return await api.delete(`/interviews/${id}`);
  },
  
  // 获取我创建的面试列表
  getMyInterviews: async (page = 1, limit = 10) => {
    return await api.get(`/interviews/my/interviews?page=${page}&limit=${limit}`);
  },
  
  // 获取面试数据看板
  getInterviewDashboard: async (id) => {
    return await api.get(`/interviews/${id}/dashboard`);
  },
};

// Attempt services
export const attemptService = {
  // 开始一次新的面试尝试
  startAttempt: async (interviewId) => {
    return await api.post(`/interviews/${interviewId}/attempts`);
  },
  
  // 提交回答并获取下一个问题
  submitAnswer: async (attemptId, question, answer) => {
    return await api.post(`/attempts/${attemptId}/answer`, { question, answer });
  },
  
  // 获取用户的所有面试尝试记录
  getUserAttempts: async (page = 1, limit = 10) => {
    return await api.get(`/users/me/attempts?page=${page}&limit=${limit}`);
  },
  
  // 获取单个面试尝试记录详情
  getAttemptById: async (id) => {
    return await api.get(`/attempts/${id}`);
  },
  
  // 导出面试报告为PDF
  exportReportPdf: async (id) => {
    return await api.get(`/attempts/${id}/export/pdf`);
  },
};

export default api;
