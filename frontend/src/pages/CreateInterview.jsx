import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
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
  "在你过去的项目中，遇到的最大挑战是什么？你是如何解决的？",
  "你如何理解团队协作？请举例说明。",
  "你对未来3-5年的职业规划是什么？",
  "关于我们公司或者这个岗位，你有什么想问的吗？"
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
    <div className="w-full max-h-screen overflow-y-auto px-6 py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="md:w-1/4 mb-6 md:mb-0 md:sticky md:top-8">
          <img src={createInterviewSvg} alt="创建面试" className="w-full max-w-xs mx-auto" />
          <h2 className="text-3xl font-heiti text-center mt-4">创建面试</h2>
          <div className="flex justify-center space-x-4 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="font-kaiti"
            >
              取消
            </Button>
            <Button 
              type="submit" 
              form="interview-form"
              disabled={loading}
              className="font-kaiti"
            >
              {loading ? '创建中...' : '创建面试'}
            </Button>
          </div>
        </div>
        
        <div className="md:w-3/4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
          
          <form id="interview-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-xl font-fangyuan border-b pb-2">基本信息</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="font-fangyuan">面试标题 <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="例如：XX科技-初级Java后端开发工程师"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="font-fangyuan">面试描述 <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="请详细描述公司介绍、岗位职责等信息"
                    className="mt-1 h-32"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={handlePublicChange}
                  />
                  <Label htmlFor="isPublic" className="font-fangyuan">公开面试（在公共列表可见）</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime" className="font-fangyuan">开始时间 <span className="text-red-500">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !formData.startTime && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
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
                    <Label htmlFor="endTime" className="font-fangyuan">结束时间 <span className="text-red-500">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !formData.endTime && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
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
                </div>
              </div>
            </div>
            
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-fangyuan border-b pb-2">面试设置</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxAttempts" className="font-fangyuan">每个用户最大尝试次数</Label>
                    <Input
                      id="maxAttempts"
                      name="maxAttempts"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.settings.maxAttempts}
                      onChange={handleSettingsChange}
                      className="mt-1 w-24"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="questionsToAsk" className="font-fangyuan">面试问题数量</Label>
                    <Input
                      id="questionsToAsk"
                      name="questionsToAsk"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.settings.questionsToAsk}
                      onChange={handleSettingsChange}
                      className="mt-1 w-24"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="font-fangyuan mb-2 block">考察能力维度 <span className="text-red-500">*</span></Label>
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                    {formData.settings.competencyDimensions.map((competency, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded border border-gray-100">
                        <span className="font-kaiti">{competency}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="ml-auto text-red-500 h-8 w-8 p-0"
                          onClick={() => removeCompetency(index)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
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
                
                <div>
                  <Label className="font-fangyuan mb-2 block">面试问题池 <span className="text-red-500">*</span></Label>
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
                    {formData.settings.questionPool.map((question, index) => (
                      <div key={index} className="flex items-start space-x-2 bg-white p-2 rounded border border-gray-100">
                        <span className="font-kaiti">{question}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="ml-auto text-red-500 h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => removeQuestion(index)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="添加新的面试问题"
                      className="flex-1 h-10"
                      style={{ minHeight: '40px', resize: 'none' }}
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
            </div>
            
            {/* 按钮已移至SVG下方 */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInterview;