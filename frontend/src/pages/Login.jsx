import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || '登录失败，请检查您的凭据。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white">
      <div className="flex w-full max-w-[1440px]">
        {/* Left side - Login form */}
        <div className="w-full md:w-1/2 p-8 flex justify-center">
          <Card className="w-[505px] h-auto border-zinc-500 shadow-[0px_4px_64px_0px_rgba(0,0,0,0.05)] rounded-[10px]">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-fangyuan">欢迎!</h2>
                  <h1 className="text-3xl font-heiti mt-4">登录到</h1>
                  <p className="text-base font-kaiti mt-4">AI 面试平台</p>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="font-fangyuan">用户名</Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        placeholder="请输入您的用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-14 pl-6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-fangyuan">密码</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="请输入您的密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 pl-6 pr-12"
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="w-3.5 h-3.5 border border-black"
                      />
                      <label htmlFor="remember" className="text-xs font-kaiti">
                        记住我
                      </label>
                    </div>
                    <Link to="/forgot-password" className="text-neutral-600 text-xs font-kaiti">
                      忘记密码?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-black text-white rounded-md"
                  >
                    {loading ? '登录中...' : '登录'}
                  </Button>

                  <div className="text-center">
                    <span className="text-zinc-500 text-base font-kaiti">
                      没有账号?{' '}
                    </span>
                    <Link to="/register" className="text-black text-base font-heiti">
                      注册
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
                alt="登录插图" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
