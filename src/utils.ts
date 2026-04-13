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
 * 将ArrayBuffer转换为Base64
 * @param buffer ArrayBuffer数据
 * @returns Base64字符串
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (isBrowser()) {
    return window.btoa(binary);
  }
  // Node.js 环境
  return Buffer.from(binary, 'binary').toString('base64');
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
