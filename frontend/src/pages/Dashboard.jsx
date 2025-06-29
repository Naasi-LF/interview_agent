import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AI Interview Platform</h1>
          <div className="flex items-center gap-4">
            <span className="font-medium">Welcome, {currentUser.nickname || currentUser.username}</span>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">View and manage interviews you've created</p>
              <Button onClick={() => navigate('/my-interviews')}>View Interviews</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">Browse and participate in available interviews</p>
              <Button onClick={() => navigate('/browse-interviews')}>Browse Interviews</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">Update your profile information</p>
              <Button onClick={() => navigate('/profile')}>Edit Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
