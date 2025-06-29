import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'admin') {
      // Redirect non-admin users to regular dashboard
      navigate('/dashboard');
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
          <h1 className="text-3xl font-bold">AI Interview Platform - Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="font-medium">Welcome, {currentUser.nickname || currentUser.username} (Admin)</span>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">Manage users and their permissions</p>
              <Button onClick={() => navigate('/admin/users')}>Manage Users</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">Create and manage interview templates</p>
              <Button onClick={() => navigate('/admin/templates')}>Manage Templates</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">View platform usage analytics</p>
              <Button onClick={() => navigate('/admin/analytics')}>View Analytics</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
