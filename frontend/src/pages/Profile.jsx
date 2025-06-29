import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();

  return (
    <div className="w-full">
      <h2 className="text-3xl font-heiti mb-6">个人资料</h2>
      
      <div className="border border-gray-200 rounded-md p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-fangyuan mb-2">基本信息</h3>
            <p className="font-kaiti">用户名: {currentUser?.username || '未设置'}</p>
            <p className="font-kaiti">昵称: {currentUser?.nickname || '未设置'}</p>
          </div>
          
          <div>
            <h3 className="text-xl font-fangyuan mb-2">个人简介</h3>
            <p className="font-kaiti">{currentUser?.bio || '暂无个人简介'}</p>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 font-kaiti">
              您可以在设置页面更新您的个人资料信息
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
