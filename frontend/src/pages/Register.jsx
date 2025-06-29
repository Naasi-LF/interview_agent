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
      setError('请填写所有必填字段');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('密码不匹配');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(username, password, nickname);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || '注册失败。请重试。');
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
                  <h2 className="text-2xl font-fangyuan">欢迎!</h2>
                  <h1 className="text-3xl font-heiti mt-4">注册到</h1>
                  <p className="text-base font-kaiti mt-4">AI 面试平台</p>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="font-fangyuan">用户名 <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        placeholder="请输入您的用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-14 pl-6"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="font-fangyuan">昵称 <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="nickname"
                        type="text"
                        placeholder="请输入您的昵称"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="h-14 pl-6"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-fangyuan">密码 <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="请输入您的密码"
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
                    <Label htmlFor="confirmPassword" className="font-fangyuan">确认密码 <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="请确认您的密码"
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
                    {loading ? '注册中...' : '注册'}
                  </Button>

                  <div className="text-center mt-4">
                    <span className="text-zinc-500 text-base font-kaiti">
                      已有账号?{' '}
                    </span>
                    <Link to="/login" className="text-black text-base font-heiti">
                      登录
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
                alt="注册插图" 
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
