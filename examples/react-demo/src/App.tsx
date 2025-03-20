import React, { useState, useEffect } from 'react';
import { XfyunASR } from 'xfyun-sdk';

const App: React.FC = () => {
  const [recognizer, setRecognizer] = useState<XfyunASR | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // 初始化语音识别器
    const initRecognizer = async () => {
      try {
        const appId = process.env.REACT_APP_XFYUN_APP_ID;
        const apiKey = process.env.REACT_APP_XFYUN_API_KEY;
        const apiSecret = process.env.REACT_APP_XFYUN_API_SECRET;

        if (!appId || !apiKey || !apiSecret) {
          throw new Error('请设置科大讯飞 API 配置');
        }

        const handlers = {
          onResult: (text: string) => {
            setResult((prev) => prev + text);
          },
          onError: (err: { message: string }) => {
            setError(err.message);
          },
          onStop: () => {
            setIsListening(false);
          }
        };

        const newRecognizer = new XfyunASR({
          appId,
          apiKey,
          apiSecret,
          language: 'zh_cn',
          accent: 'mandarin',
          vadEos: 3000
        }, handlers);

        setRecognizer(newRecognizer);
      } catch (err) {
        setError(err instanceof Error ? err.message : '初始化失败');
      }
    };

    initRecognizer();

    // 清理函数
    return () => {
      if (recognizer) {
        recognizer.stop();
      }
    };
  }, []);

  const startListening = async () => {
    if (!recognizer) return;
    
    try {
      setResult('');
      setError('');
      await recognizer.start();
      setIsListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '启动失败');
    }
  };

  const stopListening = () => {
    if (!recognizer) return;
    recognizer.stop();
    setIsListening(false);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>科大讯飞语音识别示例</h1>
        <p>点击"开始识别"按钮开始语音识别，点击"停止识别"按钮结束识别</p>
      </div>

      <div className="recognition-box">
        <div className="controls">
          <button
            className="button"
            onClick={startListening}
            disabled={isListening}
          >
            开始识别
          </button>
          <button
            className="button"
            onClick={stopListening}
            disabled={!isListening}
          >
            停止识别
          </button>
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            错误: {error}
          </div>
        )}

        <div className="result">
          {result || '识别结果将显示在这里...'}
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>使用说明：</p>
        <ol>
          <li>请确保您的浏览器支持 WebSocket 和麦克风访问</li>
          <li>首次使用时需要允许浏览器访问麦克风</li>
          <li>说话时请保持安静的环境，避免背景噪音</li>
          <li>建议使用 Chrome 或 Firefox 浏览器</li>
        </ol>
      </div>
    </div>
  );
};

export default App; 