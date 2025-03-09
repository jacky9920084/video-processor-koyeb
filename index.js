const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 8000;

// 启用CORS和JSON解析
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/', (req, res) => {
  res.send('视频处理服务正常运行中');
});

// 处理视频的端点
app.post('/process-video', async (req, res) => {
  const { videoUrl } = req.body;
  
  if (!videoUrl) {
    return res.status(400).json({ error: '缺少视频URL' });
  }
  
  console.log(`收到处理请求，视频URL: ${videoUrl}`);
  
  try {
    // 获取视频信息
    const videoInfo = await getVideoInfo(videoUrl);
    console.log('视频信息:', videoInfo);
    
    // 如果视频太大，使用分块处理
    if (videoInfo.size > 20 * 1024 * 1024) { // 大于20MB
      console.log('视频较大，启动分块处理');
      return res.json({
        success: true,
        message: `视频大小: ${Math.round(videoInfo.size / 1024 / 1024)}MB，已启动分块处理`,
        videoInfo,
        status: 'processing_chunks'
      });
    } else {
      // 小视频直接处理
      console.log('视频较小，直接处理');
      return res.json({
        success: true,
        message: `视频大小: ${Math.round(videoInfo.size / 1024 / 1024)}MB，直接处理`,
        videoInfo,
        status: 'processing_direct'
      });
    }
  } catch (error) {
    console.error('处理视频时出错:', error);
    return res.status(500).json({ 
      error: '处理视频时出错', 
      message: error.message 
    });
  }
});

// 获取视频信息的函数
async function getVideoInfo(url) {
  try {
    const response = await axios.head(url);
    const contentLength = response.headers['content-length'];
    const contentType = response.headers['content-type'];
    
    return {
      url,
      size: parseInt(contentLength || '0'),
      type: contentType || 'unknown',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('获取视频信息失败:', error.message);
    throw new Error(`获取视频信息失败: ${error.message}`);
  }
}

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${port}`);
});
