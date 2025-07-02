import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminAttempts = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchUsername, setSearchUsername] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAttempts();
  }, [page, searchUsername, statusFilter]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      
      const response = await adminService.getAttempts(page, 10, searchUsername, statusFilter);
      
      setAttempts(response.data.attempts);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (error) {
      console.error('Error fetching attempts:', error);
      setError('获取面试尝试列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAttempts();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 计算录取概率
  const calculateHiringProbability = (attempt) => {
    if (!attempt.result || attempt.result.overallScore === undefined) {
      return '-';
    }
    
    const score = attempt.result.overallScore;
    
    // 简单算法：基于总分计算录取概率
    // 分数低于60，概率很低
    // 分数在60-75之间，概率中等
    // 分数在75-90之间，概率较高
    // 分数在90以上，概率非常高
    let probability;
    
    if (score < 60) {
      probability = score / 2;
    } else if (score < 75) {
      probability = 30 + (score - 60) * 2;
    } else if (score < 90) {
      probability = 60 + (score - 75) * 1.5;
    } else {
      probability = 85 + (score - 90) * 1.5;
    }
    
    // 确保概率在0-100之间
    probability = Math.min(Math.max(probability, 0), 100);
    
    const probRounded = Math.round(probability);
    
    // 根据概率返回不同颜色的标签
    let className;
    if (probRounded < 30) {
      className = 'bg-red-50 text-red-700 border-red-200';
    } else if (probRounded < 60) {
      className = 'bg-yellow-50 text-yellow-700 border-yellow-200';
    } else if (probRounded < 85) {
      className = 'bg-blue-50 text-blue-700 border-blue-200';
    } else {
      className = 'bg-green-50 text-green-700 border-green-200';
    }
    
    return (
      <Badge variant="outline" className={className}>
        {probRounded}%
      </Badge>
    );
  };

  // 这些函数已经不再需要，因为我们直接在表格中使用Badge组件

  return (
    <div>
      <h1 className="text-3xl font-heiti mb-6">面试尝试管理</h1>
      
      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-heiti">搜索和筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-sm text-zinc-500">用户名</label>
              <Input
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="搜索用户名"
                className="w-[200px]"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-zinc-500">状态</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="in_progress">进行中</SelectItem>
                  <SelectItem value="abandoned">已放弃</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="bg-black hover:bg-zinc-800">
              搜索
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* 面试尝试列表 */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !attempts || attempts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-zinc-500">没有找到符合条件的面试尝试</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">面试标题</TableHead>
                <TableHead>参与者</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>完成问题</TableHead>
                <TableHead>得分</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>预测录取率</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((attempt) => (
                <TableRow key={attempt._id}>
                  <TableCell className="font-medium">
                    {attempt.interviewId?.title || '未知面试'}
                  </TableCell>
                  <TableCell>{attempt.userId?.username || '未知用户'}</TableCell>
                  <TableCell>
                    {attempt.status === 'completed' ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">已完成</Badge>
                    ) : attempt.status === 'in_progress' ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">进行中</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">已放弃</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {attempt.qaLog?.length || 0}/{attempt.interviewId?.settings?.questionsToAsk || 0}
                  </TableCell>
                  <TableCell>
                    {attempt.result?.overallScore !== undefined && attempt.result?.overallScore !== null ? (
                      <Badge 
                        variant="outline" 
                        className={`${attempt.result.overallScore >= 90 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : attempt.result.overallScore >= 70 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : attempt.result.overallScore >= 60 
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                              : 'bg-red-50 text-red-700 border-red-200'}`}
                      >
                        {attempt.result.overallScore}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{formatDate(attempt.result?.startedAt || attempt.createdAt)}</TableCell>
                  <TableCell>
                    {calculateHiringProbability(attempt)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/attempts/${attempt._id}`)}
                    >
                      查看报告
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* 分页 */}
      {!loading && attempts && attempts.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">上一页</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            {[...Array(Math.min(totalPages, 5)).keys()].map((i) => {
              // 显示当前页附近的页码
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-8 w-8 p-0 ${page === pageNum ? 'bg-black hover:bg-zinc-800' : ''}`}
                >
                  <span>{pageNum}</span>
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">下一页</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttempts;
