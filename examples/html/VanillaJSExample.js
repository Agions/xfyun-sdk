// 科大讯飞语音识别 - JavaScript 示例
// 需要替换为您的实际应用信息
const APP_ID = '您的 APPID';
const API_KEY = '您的 API Key';
const API_SECRET = '您的 API Secret';

document.addEventListener('DOMContentLoaded', () => {
  // DOM 元素
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const resultContainer = document.getElementById('result');
  const statusContainer = document.getElementById('status');
  const volumeBar = document.getElementById('volumeBar');
  const errorContainer = document.getElementById('error');
  
  // 初始状态
  let recognizer = null;
  stopButton.disabled = true;

  // 检查参数是否已设置
  if (APP_ID === '您的 APPID' || API_KEY === '您的 API Key' || API_SECRET === '您的 API Secret') {
    showError({
      code: 10000,
      message: '请先在 VanillaJSExample.js 文件中设置您的 APPID、API Key 和 API Secret'
    });
    startButton.disabled = true;
    return;
  }
  
  // 更新状态显示
  function updateStatus(state) {
    let statusText = '';
    
    switch (state) {
      case 'idle':
        statusText = '空闲';
        break;
      case 'connecting':
        statusText = '连接中...';
        break;
      case 'connected':
        statusText = '已连接';
        break;
      case 'recording':
        statusText = '录音中...';
        break;
      case 'stopped':
        statusText = '已停止';
        break;
      case 'error':
        statusText = '错误';
        break;
      default:
        statusText = '未知状态';
    }
    
    statusContainer.textContent = `状态: ${statusText}`;
    
    // 根据状态更新按钮
    if (state === 'recording') {
      startButton.disabled = true;
      stopButton.disabled = false;
    } else if (state === 'connecting') {
      startButton.disabled = true;
      stopButton.disabled = true;
    } else {
      startButton.disabled = false;
      stopButton.disabled = true;
    }
  }
  
  // 显示错误信息
  function showError(error) {
    console.error('语音识别错误:', error);
    errorContainer.style.display = 'block';
    errorContainer.innerHTML = `<strong>错误 [${error.code}]:</strong> ${error.message}`;
  }
  
  // 隐藏错误信息
  function hideError() {
    errorContainer.style.display = 'none';
    errorContainer.innerHTML = '';
  }
  
  // 初始化讯飞语音识别
  function initRecognizer() {
    console.log('初始化语音识别器...');
    
    // 如果已经存在实例，先销毁
    if (recognizer) {
      recognizer.stop();
      recognizer = null;
    }
    
    try {
      recognizer = new XfyunSDK.XfyunASR({
        appId: APP_ID,
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        language: 'zh_cn',
        domain: 'iat',
        accent: 'mandarin',
        punctuation: true,
        vadEos: 5000, // 更长的静默检测时间，避免中途停止
      }, {
        // 开始事件
        onStart: () => {
          console.log('语音识别已开始');
          startButton.disabled = true;
          stopButton.disabled = false;
          resultContainer.textContent = '';
          hideError();
        },
        
        // 停止事件
        onStop: () => {
          console.log('语音识别已停止');
          startButton.disabled = false;
          stopButton.disabled = true;
          volumeBar.style.width = '0%';
        },
        
        // 识别结果事件
        onRecognitionResult: (text, isEnd) => {
          console.log(`识别结果: ${text}, 是否最终结果: ${isEnd}`);
          
          if (text) {
            resultContainer.textContent += text;
            // 自动滚动到底部
            resultContainer.scrollTop = resultContainer.scrollHeight;
          }
        },
        
        // 音量处理事件
        onProcess: (volume) => {
          volumeBar.style.width = `${Math.min(100, volume)}%`;
        },
        
        // 错误处理事件
        onError: (error) => {
          console.error('识别错误:', error);
          showError(error);
          startButton.disabled = false;
          stopButton.disabled = true;
        },
        
        // 状态变更事件
        onStateChange: (state) => {
          console.log(`状态变更: ${state}`);
          updateStatus(state);
        }
      });

      console.log('语音识别器初始化成功');
    } catch (error) {
      console.error('初始化识别器失败:', error);
      showError({
        code: 10001,
        message: `初始化失败: ${error.message || error}`
      });
      startButton.disabled = false;
    }
  }
  
  // 绑定按钮事件
  startButton.addEventListener('click', () => {
    hideError();
    initRecognizer();
    
    try {
      recognizer.start().catch(error => {
        console.error('启动识别失败:', error);
        showError({
          code: 10002,
          message: `启动失败: ${error.message || error}`
        });
      });
    } catch (error) {
      console.error('启动识别出错:', error);
      showError({
        code: 10003,
        message: `启动出错: ${error.message || error}`
      });
    }
  });
  
  stopButton.addEventListener('click', () => {
    if (recognizer) {
      try {
        recognizer.stop();
      } catch (error) {
        console.error('停止识别出错:', error);
      }
    }
  });
}); 