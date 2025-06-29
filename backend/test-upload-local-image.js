const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// 本地图片路径
const IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

// API基础URL
const API_URL = 'http://localhost:8080/api';

// 测试用户凭据
const TEST_USER = {
  username: 'localimageuser',
  password: 'testpassword123',
  nickname: '本地图片测试用户'
};

// 将图片转换为base64
const imageToBase64 = (filePath) => {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error(`文件不存在: ${filePath}`);
      return null;
    }
    
    // 读取文件并转换为base64
    const fileData = fs.readFileSync(filePath);
    const fileExtension = path.extname(filePath).substring(1); // 获取扩展名（不带点）
    const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
    const base64Image = `data:${mimeType};base64,${fileData.toString('base64')}`;
    
    console.log(`图片已转换为base64，长度: ${base64Image.length} 字符`);
    return base64Image;
  } catch (error) {
    console.error('转换图片到base64时出错:', error);
    return null;
  }
};

// 主测试函数
const testLocalImageUpload = async () => {
  try {
    console.log('开始本地图片上传测试...');
    console.log(`使用图片: ${IMAGE_PATH}`);
    
    // 步骤1: 将图片转换为base64
    const base64Image = imageToBase64(IMAGE_PATH);
    if (!base64Image) {
      throw new Error('图片转换失败');
    }
    
    // 步骤2: 注册或登录
    let authToken;
    
    try {
      // 尝试注册
      console.log('尝试注册测试用户...');
      const registerResponse = await axios.post(`${API_URL}/auth/register`, TEST_USER);
      authToken = registerResponse.data.token;
      console.log('用户注册成功');
    } catch (registerError) {
      // 如果注册失败（可能是因为用户已存在），尝试登录
      if (registerError.response && registerError.response.status === 400) {
        console.log('用户已存在，尝试登录...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          username: TEST_USER.username,
          password: TEST_USER.password
        });
        authToken = loginResponse.data.token;
        console.log('用户登录成功');
      } else {
        throw registerError;
      }
    }
    
    // 步骤3: 更新用户资料，使用本地图片的base64编码
    console.log('更新用户资料，使用本地图片...');
    const updateData = {
      nickname: '已更新的本地图片测试用户',
      bio: '这是一个使用本地图片的测试简介',
      avatarUrl: base64Image
    };
    
    console.log('发送更新请求...');
    
    const updateResponse = await axios.put(
      `${API_URL}/users/me`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        // 增加超时时间，因为图片上传可能需要更长时间
        timeout: 60000 // 60秒
      }
    );
    
    // 步骤4: 验证响应
    const updatedUser = updateResponse.data.user;
    console.log('资料更新响应:', JSON.stringify(updatedUser, null, 2));
    
    if (updatedUser.avatarUrl && updatedUser.avatarUrl.includes('cloudinary.com')) {
      console.log('成功: 本地图片已上传到Cloudinary!');
      console.log('Cloudinary URL:', updatedUser.avatarUrl);
    } else {
      console.log('失败: 图片未上传到Cloudinary');
      console.log('返回的头像URL:', updatedUser.avatarUrl);
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
      console.error('响应状态:', error.response.status);
    } else {
      console.error('完整错误:', error);
    }
  }
};

// 运行测试
testLocalImageUpload();
