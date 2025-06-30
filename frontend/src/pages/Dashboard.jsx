import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Outlet, useLocation, NavLink } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role === 'admin') {
      // Redirect admin users to admin dashboard
      navigate('/admin');
    } else {
      setLoading(false);
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 获取当前路径，用于高亮显示当前选中的导航项
  const location = useLocation();
  const currentPath = location.pathname;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex bg-white">
      {/* Left sidebar */}
      <div className="w-28 min-h-screen bg-black flex flex-col items-center justify-between py-10 sticky top-0">
        <div className="flex flex-col items-center space-y-10">
          {/* Home icon - My Attempts */}
          <NavLink 
            to="/"
            end
            className={({ isActive }) => `w-20 h-20 flex items-center justify-center cursor-pointer ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </NavLink>
          
          {/* Interview list icon */}
          <NavLink 
            to="/interviews"
            className={({ isActive }) => `w-20 h-20 flex items-center justify-center cursor-pointer ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </NavLink>
          
          {/* Profile icon */}
          <NavLink 
            to="/profile"
            className={({ isActive }) => `w-20 h-20 flex items-center justify-center cursor-pointer ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </NavLink>
        </div>
        
        <div className="flex flex-col items-center space-y-10">
          {/* Settings icon */}
          <NavLink 
            to="/settings"
            className={({ isActive }) => `w-20 h-20 flex items-center justify-center cursor-pointer ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </NavLink>
          
          {/* Create Interview icon (moved to bottom) */}
          <NavLink 
            to="/create-interview"
            className={({ isActive }) => `w-20 h-20 flex items-center justify-center cursor-pointer ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </NavLink>
          
          {/* Logout icon */}
          <div 
            onClick={handleLogout}
            className="w-20 h-20 flex items-center justify-center cursor-pointer hover:bg-zinc-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
