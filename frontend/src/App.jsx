import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import CreateInterview from './pages/CreateInterview';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />}>
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;