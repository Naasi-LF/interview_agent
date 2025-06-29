import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !nickname || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(username, password, nickname);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white">
      <div className="flex w-full max-w-[1440px]">
        {/* Left side - Registration form */}
        <div className="w-full md:w-1/2 p-8 flex justify-center">
          <Card className="w-[505px] h-auto border-zinc-500 shadow-[0px_4px_64px_0px_rgba(0,0,0,0.05)] rounded-[10px]">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light font-['Poppins']">Welcome!</h2>
                  <h1 className="text-3xl font-medium font-['Poppins'] mt-4">Sign up to</h1>
                  <p className="text-base font-normal font-['Poppins'] mt-4">AI Interview Platform</p>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-14 pl-6"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="nickname"
                        type="text"
                        placeholder="Enter your nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="h-14 pl-6"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 pl-6 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        tabIndex="-1"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-14 pl-6 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        tabIndex="-1"
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-black text-white rounded-md mt-4"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </Button>

                  <div className="text-center mt-4">
                    <span className="text-zinc-500 text-base font-light font-['Poppins']">
                      Already have an Account?{' '}
                    </span>
                    <Link to="/login" className="text-black text-base font-semibold font-['Poppins']">
                      Login
                    </Link>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Illustration */}
        <div className="hidden md:block md:w-1/2">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-[827px] h-[650px] relative overflow-hidden">
              <img 
                src="/src/assets/images/back.svg" 
                alt="Registration illustration" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
