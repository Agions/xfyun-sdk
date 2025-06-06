import CryptoJS from 'crypto-js';

/**
 * 生成科大讯飞API请求URL
 * @param apiKey 接口密钥
 * @param apiSecret 接口密钥对应的secret
 * @param host 请求的服务器地址
 * @returns 带有签名的完整URL
 */
export function generateAuthUrl(apiKey: string, apiSecret: string, host: string = 'iat-api.xfyun.cn'): string {
  const url = 'wss://' + host + '/v2/iat';
  const date = new Date().toUTCString();
  const algorithm = 'hmac-sha256';

  // 生成签名
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);

  // 生成授权字符串
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="host date request-line", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);

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
  return window.btoa(binary);
}

/**
 * 将科大讯飞返回的结果解析为文本
 * @param result 科大讯飞返回的识别结果
 * @returns 解析后的文本
 */
export function parseXfyunResult(result: any): string {
  if (!result || !Array.isArray(result.ws)) {
    return '';
  }
  
  try {
    return result.ws.map((ws: any) => {
      if (!Array.isArray(ws.cw)) {
        return '';
      }
      return ws.cw.map((cw: any) => cw.w).join('');
    }).join('');
  } catch (error) {
    console.error('解析讯飞结果失败:', error, '原始数据:', result);
    return '';
  }
} 