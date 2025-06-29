import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

  const handleNavigate = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex bg-white">
      {/* Left sidebar */}
      <div className="w-28 h-full bg-zinc-900 flex flex-col items-center">
        {/* Home icon */}
        <div className="w-20 h-20 mt-14 flex items-center justify-center cursor-pointer">
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
        
        {/* Settings icon */}
        <div 
          className="w-20 h-20 mt-auto mb-10 flex items-center justify-center cursor-pointer"
          onClick={() => handleNavigate('/settings')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-10">Dashboard</h1>
          
          {/* Empty content area - placeholder for future implementation */}
          <div className="bg-gray-50 rounded-lg p-10 flex items-center justify-center h-[600px]">
            <p className="text-xl text-gray-500">Dashboard content will be implemented in future updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
