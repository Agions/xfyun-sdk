/**
 * 错误分类与处理系统
 * @description 统一的错误分类、错误码管理和恢复策略
 */

import { XfyunError } from './types';

// ============================================================================
// 错误类别定义
// ============================================================================

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  LOW = 1,      // 可忽略，不影响功能
  MEDIUM = 2,   // 需要处理，但可继续运行
  HIGH = 3,     // 需要立即处理，可能影响功能
  CRITICAL = 4, // 严重错误，需要终止操作
}

/**
 * 错误可恢复性
 */
export enum ErrorRecoverability {
  RECOVERABLE = 'recoverable',      // 可自动恢复（如网络抖动）
  PARTIALLY_RECOVERABLE = 'partial', // 部分恢复（如重连但丢失数据）
  UNRECOVERABLE = 'unrecoverable',   // 不可恢复（如认证失败）
}

/**
 * 错误类别
 */
export enum ErrorCategory {
  // 网络相关
  NETWORK_CONNECTION = 'network_connection',
  NETWORK_TIMEOUT = 'network_timeout',
  NETWORK_DISCONNECT = 'network_disconnect',
  
  // 认证相关
  AUTH_INVALID = 'auth_invalid',
  AUTH_EXPIRED = 'auth_expired',
  AUTH_FORBIDDEN = 'auth_forbidden',
  
  // 资源相关
  RESOURCE_MICROPHONE = 'resource_microphone',
  RESOURCE_AUDIO_CONTEXT = 'resource_audio_context',
  RESOURCE_WEB_SOCKET = 'resource_web_socket',
  
  // 业务逻辑
  BUSINESS_INVALID_PARAM = 'business_invalid_param',
  BUSINESS_STATE_ERROR = 'business_state_error',
  BUSINESS_LIMIT_EXCEEDED = 'business_limit_exceeded',
  
  // 系统错误
  SYSTEM_BROWSER_UNSUPPORTED = 'system_browser_unsupported',
  SYSTEM_INTERNAL = 'system_internal',
}

// ============================================================================
// 讯飞 API 错误码映射
// ============================================================================

/**
 * 讯飞 API 错误码分类
 * @see https://www.xfyun.cn/doc/common/error-code.html
 */
export const XFUN_ERROR_CODES: Record<number, { category: ErrorCategory; severity: ErrorSeverity; recoverable: ErrorRecoverability; message: string }> = {
  // 认证错误 (10000-10999)
  10000: { category: ErrorCategory.AUTH_INVALID, severity: ErrorSeverity.CRITICAL, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '通用错误' },
  10001: { category: ErrorCategory.SYSTEM_BROWSER_UNSUPPORTED, severity: ErrorSeverity.CRITICAL, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '浏览器不支持' },
  10002: { category: ErrorCategory.AUTH_INVALID, severity: ErrorSeverity.CRITICAL, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '签名验证失败' },
  10003: { category: ErrorCategory.AUTH_INVALID, severity: ErrorSeverity.CRITICAL, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '认证失败' },
  10004: { category: ErrorCategory.BUSINESS_INVALID_PARAM, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '参数错误' },
  10005: { category: ErrorCategory.NETWORK_TIMEOUT, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.RECOVERABLE, message: '连接超时' },
  10006: { category: ErrorCategory.AUTH_EXPIRED, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE, message: '授权过期' },
  10007: { category: ErrorCategory.AUTH_FORBIDDEN, severity: ErrorSeverity.CRITICAL, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '无权限' },
  10008: { category: ErrorCategory.BUSINESS_LIMIT_EXCEEDED, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '配额超限' },
  10009: { category: ErrorCategory.RESOURCE_MICROPHONE, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE, message: '录音错误' },
  10010: { category: ErrorCategory.NETWORK_DISCONNECT, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.RECOVERABLE, message: '连接断开' },
  
  // TTS 错误 (20000-20999)
  20001: { category: ErrorCategory.BUSINESS_INVALID_PARAM, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '文本为空' },
  20002: { category: ErrorCategory.NETWORK_CONNECTION, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.RECOVERABLE, message: '连接错误' },
  20003: { category: ErrorCategory.NETWORK_TIMEOUT, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.RECOVERABLE, message: '超时' },
  20004: { category: ErrorCategory.SYSTEM_INTERNAL, severity: ErrorSeverity.CRITICAL, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '内部错误' },
  
  // 翻译错误 (30000-30999)
  30000: { category: ErrorCategory.AUTH_INVALID, severity: ErrorSeverity.CRITICAL, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '通用错误' },
  30001: { category: ErrorCategory.BUSINESS_INVALID_PARAM, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '参数错误' },
  30002: { category: ErrorCategory.NETWORK_CONNECTION, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.RECOVERABLE, message: '连接错误' },
  30003: { category: ErrorCategory.SYSTEM_INTERNAL, severity: ErrorSeverity.CRITICAL, recoverable: ErrorRecoverability.UNRECOVERABLE, message: '翻译失败' },
  30004: { category: ErrorCategory.NETWORK_TIMEOUT, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.RECOVERABLE, message: '超时' },
  30005: { category: ErrorCategory.RESOURCE_MICROPHONE, severity: ErrorSeverity.HIGH, recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE, message: '初始化失败' },
};

// ============================================================================
// 增强型错误类型
// ============================================================================

/**
 * 增强型错误接口
 * 包含原始错误信息 + 分类信息 + 恢复建议
 */
export interface EnhancedXfyunError extends XfyunError {
  /** 错误类别 */
  category: ErrorCategory;
  /** 严重程度 */
  severity: ErrorSeverity;
  /** 是否可恢复 */
  recoverable: ErrorRecoverability;
  /** 恢复建议 */
  recoveryHint?: string;
  /** 原始错误（如果有） */
  originalError?: unknown;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 错误处理结果
 */
export interface ErrorHandlingResult {
  /** 是否已处理 */
  handled: boolean;
  /** 是否可恢复 */
  canRecover: boolean;
  /** 恢复操作建议 */
  recoveryAction?: 'retry' | 'reconnect' | 'reinitialize' | 'notify_user' | 'none';
  /** 错误信息 */
  error: EnhancedXfyunError;
}

// ============================================================================
// 错误处理工具函数
// ============================================================================

/**
 * 分类错误
 * @param error 原始错误
 * @returns 增强型错误
 */
export function classifyError(error: XfyunError | unknown): EnhancedXfyunError {
  // 如果是未知错误，包装成通用错误
  if (!error || typeof error !== 'object') {
    return {
      code: 99999,
      message: String(error ?? '未知错误'),
      category: ErrorCategory.SYSTEM_INTERNAL,
      severity: ErrorSeverity.HIGH,
      recoverable: ErrorRecoverability.UNRECOVERABLE,
      timestamp: Date.now(),
      originalError: error,
    };
  }
  
  const xfError = error as XfyunError;
  const code = xfError.code ?? 99999;
  
  // 查找预定义的错误码映射
  const errorInfo = XFUN_ERROR_CODES[code];
  
  if (errorInfo) {
    return {
      ...xfError,
      category: errorInfo.category,
      severity: errorInfo.severity,
      recoverable: errorInfo.recoverable,
      recoveryHint: getRecoveryHint(errorInfo.category),
      timestamp: Date.now(),
    };
  }
  
  // 未定义的错误码，根据代码范围推断
  if (code >= 10000 && code < 20000) {
    return {
      ...xfError,
      category: ErrorCategory.AUTH_INVALID,
      severity: ErrorSeverity.HIGH,
      recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE,
      recoveryHint: '请检查认证信息是否正确',
      timestamp: Date.now(),
    };
  }
  
  if (code >= 20000 && code < 30000) {
    return {
      ...xfError,
      category: ErrorCategory.SYSTEM_INTERNAL,
      severity: ErrorSeverity.MEDIUM,
      recoverable: ErrorRecoverability.RECOVERABLE,
      recoveryHint: '请稍后重试',
      timestamp: Date.now(),
    };
  }
  
  if (code >= 30000 && code < 40000) {
    return {
      ...xfError,
      category: ErrorCategory.BUSINESS_INVALID_PARAM,
      severity: ErrorSeverity.MEDIUM,
      recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE,
      recoveryHint: '请检查参数配置',
      timestamp: Date.now(),
    };
  }
  
  // 默认处理（未知错误码，给予较高严重程度）
  return {
    ...xfError,
    code: 99999,  // 未知错误码设为 99999
    message: xfError.message ?? String(xfError),  // 确保 message 存在
    category: ErrorCategory.SYSTEM_INTERNAL,
    severity: ErrorSeverity.HIGH,  // 未知错误按 HIGH 处理
    recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE,
    recoveryHint: '未知错误，请检查日志或联系技术支持',
    timestamp: Date.now(),
  };
}

/**
 * 根据错误类别获取恢复建议
 */
function getRecoveryHint(category: ErrorCategory): string {
  const hints: Record<ErrorCategory, string> = {
    [ErrorCategory.NETWORK_CONNECTION]: '网络连接失败，请检查网络后重试',
    [ErrorCategory.NETWORK_TIMEOUT]: '请求超时，请检查网络后重试',
    [ErrorCategory.NETWORK_DISCONNECT]: '连接已断开，尝试重新连接',
    [ErrorCategory.AUTH_INVALID]: '认证信息无效，请检查 appId/apiKey/apiSecret',
    [ErrorCategory.AUTH_EXPIRED]: '授权已过期，请重新获取授权',
    [ErrorCategory.AUTH_FORBIDDEN]: '无权限访问，请检查应用权限',
    [ErrorCategory.RESOURCE_MICROPHONE]: '麦克风访问失败，请检查浏览器权限',
    [ErrorCategory.RESOURCE_AUDIO_CONTEXT]: '音频上下文创建失败，请刷新页面重试',
    [ErrorCategory.RESOURCE_WEB_SOCKET]: 'WebSocket 连接失败，请检查网络',
    [ErrorCategory.BUSINESS_INVALID_PARAM]: '参数错误，请检查配置',
    [ErrorCategory.BUSINESS_STATE_ERROR]: '状态错误，请重新开始',
    [ErrorCategory.BUSINESS_LIMIT_EXCEEDED]: '配额已用尽，请升级套餐或等待重置',
    [ErrorCategory.SYSTEM_BROWSER_UNSUPPORTED]: '浏览器不支持此功能，请使用现代浏览器',
    [ErrorCategory.SYSTEM_INTERNAL]: '系统内部错误，请稍后重试或联系技术支持',
  };
  return hints[category] ?? '未知错误';
}

/**
 * 判断错误是否可自动恢复
 */
export function canAutoRecover(error: EnhancedXfyunError): boolean {
  return error.recoverable === ErrorRecoverability.RECOVERABLE;
}

/**
 * 获取推荐的恢复操作
 */
export function getRecoveryAction(error: EnhancedXfyunError): ErrorHandlingResult['recoveryAction'] {
  switch (error.category) {
    case ErrorCategory.NETWORK_CONNECTION:
    case ErrorCategory.NETWORK_DISCONNECT:
      return 'reconnect';
    case ErrorCategory.NETWORK_TIMEOUT:
    case ErrorCategory.RESOURCE_WEB_SOCKET:
      return 'retry';
    case ErrorCategory.RESOURCE_MICROPHONE:
    case ErrorCategory.RESOURCE_AUDIO_CONTEXT:
      return 'reinitialize';
    case ErrorCategory.AUTH_INVALID:
    case ErrorCategory.AUTH_EXPIRED:
    case ErrorCategory.AUTH_FORBIDDEN:
      return 'notify_user';
    case ErrorCategory.BUSINESS_LIMIT_EXCEEDED:
      return 'notify_user';
    default:
      return 'none';
  }
}

/**
 * 处理错误并返回处理结果
 */
export function handleXfyunError(error: XfyunError | unknown): ErrorHandlingResult {
  const enhanced = classifyError(error);
  
  return {
    handled: true,
    canRecover: canAutoRecover(enhanced),
    recoveryAction: getRecoveryAction(enhanced),
    error: enhanced,
  };
}

/**
 * 错误日志格式化
 */
export function formatErrorLog(error: EnhancedXfyunError): string {
  const severityIcon = {
    [ErrorSeverity.LOW]: 'ℹ️',
    [ErrorSeverity.MEDIUM]: '⚠️',
    [ErrorSeverity.HIGH]: '🔴',
    [ErrorSeverity.CRITICAL]: '💥',
  };
  
  return `[${severityIcon[error.severity]} ${error.category}] ${error.message} (code: ${error.code})`;
}
