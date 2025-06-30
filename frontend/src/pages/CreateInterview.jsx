import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import createInterviewSvg from '../assets/images/create_interview.svg';

const defaultCompetencies = [
  "逻辑思维",
  "沟通能力",
  "团队协作",
  "技术深度",
  "抗压能力"
];

const defaultQuestions = [
  "请做一次三分钟的自我介绍。",
  "请谈谈你对我们公司的了解。",
  "在你过去的项目中，遇到的最大挑战是什么",
  "你如何理解团队协作？请举例说明。",
  "你对未来3-5年的职业规划是什么？"
];

const CreateInterview = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    isPublic: true,
    startTime: new Date(),
    endTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    settings: {
      maxAttempts: 3,
      competencyDimensions: [...defaultCompetencies],
      questionsToAsk: 5,
      questionPool: [...defaultQuestions]
    }
  });

  // 新问题输入
  const [newQuestion, setNewQuestion] = useState('');
  // 新能力维度输入
  const [newCompetency, setNewCompetency] = useState('');

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 处理设置变化
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [name]: value
      }
    });
  };

  // 处理公开状态变化
  const handlePublicChange = (checked) => {
    setFormData({ ...formData, isPublic: checked });
  };

  // 添加新问题
  const addQuestion = () => {
    if (newQuestion.trim()) {
      setFormData({
        ...formData,
        settings: {
          ...formData.settings,
          questionPool: [...formData.settings.questionPool, newQuestion.trim()]
        }
      });
      setNewQuestion('');
    }
  };

  // 删除问题
  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.settings.questionPool];
    updatedQuestions.splice(index, 1);
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        questionPool: updatedQuestions
      }
    });
  };

  // 添加新能力维度
  const addCompetency = () => {
    if (newCompetency.trim() && !formData.settings.competencyDimensions.includes(newCompetency.trim())) {
      setFormData({
        ...formData,
        settings: {
          ...formData.settings,
          competencyDimensions: [...formData.settings.competencyDimensions, newCompetency.trim()]
        }
      });
      setNewCompetency('');
    }
  };

  // 删除能力维度
  const removeCompetency = (index) => {
    const updatedCompetencies = [...formData.settings.competencyDimensions];
    updatedCompetencies.splice(index, 1);
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        competencyDimensions: updatedCompetencies
      }
    });
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || formData.settings.questionPool.length === 0) {
      setError('请填写所有必填字段');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/interviews', formData);
      
      setSuccess('面试创建成功！');
      
      // 延迟后跳转到仪表盘
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || '创建面试失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white p-4">
      {/* 错误和成功消息 */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {success}
        </div>
      )}

      <h1 className="text-3xl font-heiti mb-6">创建面试</h1>

      <form id="interview-form" onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4 max-w-full">
        {/* 左侧列 */}
        <div className="flex-1 space-y-5 pr-2">
          <div>
            <Label htmlFor="title" className="font-fangyuan text-lg mb-1 block">面试标题</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="border border-gray-300 h-12 w-full"
              placeholder="例如：XX科技-初级Java后端开发工程师"
              required
            />
          </div>

          <div>
            <Label htmlFor="startTime" className="font-fangyuan text-lg mb-1 block">开始时间</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-normal border border-gray-300"
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {formData.startTime ? format(formData.startTime, "PPP") : <span>选择日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startTime}
                  onSelect={(date) => setFormData({ ...formData, startTime: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="endTime" className="font-fangyuan text-lg mb-1 block">结束时间</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-normal border border-gray-300"
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {formData.endTime ? format(formData.endTime, "PPP") : <span>选择日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.endTime}
                  onSelect={(date) => setFormData({ ...formData, endTime: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="font-fangyuan text-base mb-2 block">考察能力维度</Label>
            {/* 增加容器高度：从 max-h-40 改为 max-h-72 */}
            <div className="space-y-2 mb-4 max-h-80 overflow-y-auto bg-gray-50 p-3 rounded scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {formData.settings.competencyDimensions.map((competency, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                  <span className="font-kaiti">{competency}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto flex-shrink-0 h-6 w-6 p-0"
                    onClick={() => removeCompetency(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newCompetency}
                onChange={(e) => setNewCompetency(e.target.value)}
                placeholder="添加新的能力维度"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addCompetency}
                disabled={!newCompetency.trim()}
              >
                添加
              </Button>
            </div>
          </div>
        </div>

        {/* 中间列 */}
        <div className="flex-1 space-y-10">
          <div>
            <Label htmlFor="description" className="font-fangyuan text-base mb-2 block">面试描述</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="min-h-[200px] border border-gray-300"
              placeholder="请详细描述公司介绍、岗位职责等信息"
              required
            />
          </div>

          <div>
            <Label className="font-fangyuan text-base mb-2 block">面试问题池</Label>
            {/* 增加容器高度：从 max-h-48 改为 max-h-80 */}
            <div className="space-y-2 mb-4 max-h-90 overflow-y-auto bg-gray-50 p-3 rounded scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {formData.settings.questionPool.map((question, index) => (
                <div key={index} className="flex items-start space-x-2 bg-white p-3 rounded border border-gray-100">
                  <span className="font-kaiti flex-1">{question}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto flex-shrink-0 h-6 w-6 p-0"
                    onClick={() => removeQuestion(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="添加新的面试问题"
                className="flex-1 h-12"
                style={{ minHeight: '48px', resize: 'none' }}
              />
              <Button 
                type="button" 
                onClick={addQuestion}
                disabled={!newQuestion.trim()}
                className="h-auto"
              >
                添加
              </Button>
            </div>
          </div>
        </div>

        {/* 右侧列 */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col items-center">
            <img 
              src={createInterviewSvg} 
              alt="创建面试" 
              className="w-full max-w-xs mb-6" 
            />

            <div className="w-full space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic" className="font-fangyuan">是否公开面试？(全局可见)</Label>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={handlePublicChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="maxAttempts" className="font-fangyuan">用户最多尝试次数？</Label>
                <Input
                  id="maxAttempts"
                  name="maxAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.settings.maxAttempts}
                  onChange={handleSettingsChange}
                  className="w-20 text-center"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="questionsToAsk" className="font-fangyuan">面试问题数量？</Label>
                <Input
                  id="questionsToAsk"
                  name="questionsToAsk"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.settings.questionsToAsk}
                  onChange={handleSettingsChange}
                  className="w-20 text-center"
                />
              </div>

              <div className="flex space-x-4 mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black hover:bg-gray-800"
                >
                  {loading ? '创建中...' : '添加'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* 自定义滚动条样式 */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default CreateInterview;