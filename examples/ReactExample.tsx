import React, { useState } from 'react';
import { SpeechRecognizer } from '../src';

interface ReactExampleProps {
  appId: string;
  apiKey: string;
  apiSecret: string;
}

const ReactExample: React.FC<ReactExampleProps> = ({ appId, apiKey, apiSecret }) => {
  const [result, setResult] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleResult = (text: string, isEnd: boolean) => {
    setResult(prev => prev + text);
  };

  const handleError = (error: any) => {
    setIsError(true);
    setErrorMessage(`错误码: ${error.code}, 错误信息: ${error.message}`);
    console.error('语音识别错误:', error);
  };

  const handleStart = () => {
    setIsError(false);
    setErrorMessage('');
    setResult('');
    console.log('语音识别开始');
  };

  const handleStop = () => {
    console.log('语音识别结束');
  };

  return (
    <div className="speech-recognition-example">
      <h1>科大讯飞语音识别示例</h1>
      
      <div className="recognizer-container">
        <SpeechRecognizer
          appId={appId}
          apiKey={apiKey} 
          apiSecret={apiSecret}
          onResult={handleResult}
          onError={handleError}
          onStart={handleStart}
          onStop={handleStop}
          buttonStartText="开始语音识别"
          buttonStopText="停止语音识别"
          language="zh_cn"
          domain="iat"
          accent="mandarin"
          punctuation={true}
          showVolume={true}
          showStatus={true}
        />
      </div>
      
      {isError && (
        <div className="error-container">
          <h3>错误信息</h3>
          <p className="error-message">{errorMessage}</p>
        </div>
      )}
      
      <div className="result-container">
        <h2>完整识别结果:</h2>
        <div className="result-box">
          {result || <span className="placeholder">语音识别结果将显示在这里...</span>}
        </div>
      </div>
      
      <style jsx>{`
        .speech-recognition-example {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .recognizer-container {
          margin-bottom: 30px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          background-color: #f9f9f9;
        }
        
        .error-container {
          margin: 20px 0;
          padding: 15px;
          background-color: #ffebee;
          border-left: 5px solid #f44336;
          border-radius: 4px;
        }
        
        .error-message {
          color: #d32f2f;
          font-size: 14px;
          margin: 0;
        }
        
        .result-container {
          margin-top: 30px;
        }
        
        .result-container h2 {
          color: #444;
          margin-bottom: 10px;
        }
        
        .result-box {
          min-height: 150px;
          max-height: 300px;
          overflow-y: auto;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fff;
          line-height: 1.6;
          font-size: 16px;
        }
        
        .placeholder {
          color: #999;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ReactExample; 