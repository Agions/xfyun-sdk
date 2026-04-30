import * as CryptoJS from 'crypto-js';
import { Logger } from './logger';

/**
 * 判断是否在浏览器环境
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.btoa === 'function';
}

/**
 * 将字符串转换为 Base64 (浏览器/Node.js 兼容)
 * @remarks
 * 此函数处理 Unicode 字符，确保在不同环境下都能正确编码
 */
export function toBase64(str: string, encoding: 'utf-8' | 'binary' = 'utf-8'): string {
  if (isBrowser()) {
    // btoa 不能直接处理 Unicode 字符串，需要先转换
    const encoded = encoding === 'utf-8'
      ? window.btoa(window.unescape(encodeURIComponent(str)))
      : window.atob(str);
    return encoded;
  }
  // Node.js 环境
  return Buffer.from(str, encoding).toString('base64');
}

/**
 * 生成科大讯飞API请求URL
 * @param apiKey 接口密钥
 * @param apiSecret 接口密钥对应的secret
 * @param host 请求的服务器地址
 * @param path API 路径，默认 /v2/iat
 * @returns 带有签名的完整URL
 */
export function generateAuthUrl(
  apiKey: string,
  apiSecret: string,
  host: string = 'iat-api.xfyun.cn',
  path: string = '/v2/iat'
): string {
  const url = 'wss://' + host + path;
  const date = new Date().toUTCString();
  const algorithm = 'hmac-sha256';

  // 生成签名
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);

  // 生成授权字符串
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="host date request-line", signature="${signature}"`;
  const authorization = isBrowser()
    ? window.btoa(window.unescape(encodeURIComponent(authorizationOrigin)))
    : Buffer.from(authorizationOrigin).toString('base64');

  // 拼接请求URL，确保使用encodeURIComponent进行更安全的编码
  return `${url}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
}

export function detectSupportedMimeType(): string {
  // Check browser environment
  if (typeof MediaRecorder === 'undefined') {
    return 'audio/webm'; // Fallback for Node.js and other environments
  }

  // Check if MediaRecorder.isTypeSupported is available
  if (typeof MediaRecorder.isTypeSupported !== 'function') {
    return 'audio/webm'; // Fallback when method not available
  }

  const mimeTypes = [
    'audio/webm',
    'audio/webm;codecs=opus', 
    'audio/ogg;codecs=opus',
  ];

  for (const type of mimeTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  // Fallback
  return 'audio/webm';
}

/**
 * 创建 AudioContext（兼容 webkit 前缀）
 * @param sampleRate 可选采样率
 * @returns AudioContext 实例
 * 
 * @warning ⚠️ 重要资源管理提示
 * 
 * AudioContext 是重要的浏览器资源，调用方必须在不再使用时显式调用 `close()` 方法：
 * 
 * ```typescript
 * const audioContext = createAudioContext(16000);
 * 
 * // ... 使用 audioContext ...
 * 
 * // 使用完毕后务必调用
 * audioContext.close();
 * 
 * // 最佳实践：在组件销毁或清理时调用
 * function cleanup() {
 *   if (audioContext) {
 *     audioContext.close();
 *     audioContext = null;
 *   }
 * }
 * ```
 * 
 * 未能正确关闭 AudioContext 可能导致：
 * - 浏览器音频设备无法释放
 * - 内存泄漏
 * - 其他音频应用无法使用音频设备
 * 
 * 在 xfyun-sdk 中，所有使用 createAudioContext 的类都在 `destroy()` 方法中正确调用了 `close()`。
 */
export function createAudioContext(sampleRate?: number): AudioContext {
  const AudioContextClass = (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext || window.AudioContext;
  return sampleRate ? new AudioContextClass({ sampleRate }) : new AudioContextClass();
}

/**
 * 计算音频音量
 * @param array 音频数据
 * @returns 音量值
 */
export function calculateVolume(array: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i] * array[i];
  }
  return Math.sqrt(sum / array.length) * 100;
}

/**
 * Convert ArrayBuffer to Base64 string (handles large buffers)
 * @param buffer - ArrayBuffer data
 * @returns Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  
  if (isBrowser()) {
    // Use chunked approach to avoid stack overflow with large audio data
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return window.btoa(binary);
  }
  // Node.js environment
  return Buffer.from(bytes).toString('base64');
}

/**
 * 解析科大讯飞返回的结果
 * @param result 科大讯飞返回的识别结果
 * @param logger 可选的日志记录器，若不提供则使用 console.error
 */
export function parseXfyunResult(result: unknown, logger?: Logger): string {
  if (!result || typeof result !== 'object') {
    return '';
  }

  const resultObj = result as {
    ws?: Array<{
      bg?: number;
      cw?: Array<{
        w?: string;
        sc?: number;
      }>;
    }>;
  };

  if (!Array.isArray(resultObj.ws)) {
    return '';
  }

  try {
    return resultObj.ws.map((ws) => {
      if (!Array.isArray(ws.cw)) {
        return '';
      }
      return ws.cw.map((cw) => cw.w || '').join('');
    }).join('');
  } catch (error) {
    if (logger) {
      logger.error('解析讯飞结果失败:', error, '原始数据:', result);
    } else {
      console.error('[XfyunASR] 解析讯飞结果失败:', error, '原始数据:', result);
    }
    return '';
  }
}
