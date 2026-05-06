/**
 * xfyun-sdk 通用客户端 Hook
 * 
 * 封装了所有 xfyun-sdk 客户端的通用生命周期管理逻辑
 * 包括：初始化、错误处理、状态同步、资源清理
 * 
 * @example
 * ```typescript
 * const clientRef = useXfyunClient(
 *   () => new XfyunASR({ appId, apiKey, apiSecret }),
 *   [appId, apiKey, apiSecret],
 *   {
 *     onStart: () => setState('recording'),
 *     onStop: () => setState('stopped'),
 *     onError: (error) => setState('error'),
 *   }
 * );
 * ```
 */

import { useEffect, useCallback } from 'react';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 客户端选项
 */
export interface XfyunClientOptions<T> {
  /** 客户端实例的引用 */
  clientRef: React.MutableRefObject<T | null>;
  /** 是否已销毁的引用（用于阻止异步回调） */
  isDestroyedRef: React.MutableRefObject<boolean>;
  /** 开始回调 */
  onStart?: () => void;
  /** 停止回调 */
  onStop?: () => void;
  /** 结束回调 */
  onEnd?: () => void;
  /** 错误回调 */
  onError?: (error: unknown) => void;
  /** 状态变化回调 */
  onStateChange?: (state: string) => void;
}

/**
 * Hook 返回类型
 */
export interface UseXfyunClientReturn<T> {
  /** 客户端实例引用 */
  clientRef: React.MutableRefObject<T | null>;
  /** 是否已销毁 */
  isDestroyedRef: React.MutableRefObject<boolean>;
  /** 获取客户端实例（安全访问） */
  getClient: () => T | null;
  /** 销毁客户端 */
  destroy: () => void;
}

// ============================================================================
// Hook 实现
// ============================================================================

/**
 * 通用 xfyun-sdk 客户端 Hook
 * 
 * @param createClient - 创建客户端实例的函数
 * @param deps - useEffect 依赖数组
 * @param options - 客户端选项
 * @returns Hook 返回对象
 */
export function useXfyunClient<T extends { destroy: () => void }>(
  createClient: () => T,
  deps: unknown[],
  options: XfyunClientOptions<T>
): UseXfyunClientReturn<T> {
  const { clientRef, isDestroyedRef } = options;

  useEffect(() => {
    isDestroyedRef.current = false;
    const client = createClient();
    clientRef.current = client;

    return () => {
      // 先标记销毁状态，阻止所有异步回调
      isDestroyedRef.current = true;
      
      // 清理客户端
      if (clientRef.current) {
        try {
          clientRef.current.destroy();
        } catch (e) {
          console.warn('Client destroy error:', e);
        }
        clientRef.current = null;
      }
    };
  }, deps);

  // 安全获取客户端实例
  const getClient = useCallback(() => {
    if (isDestroyedRef.current || !clientRef.current) {
      return null;
    }
    return clientRef.current;
  }, [clientRef, isDestroyedRef]);

  // 销毁客户端
  const destroy = useCallback(() => {
    isDestroyedRef.current = true;
    if (clientRef.current) {
      try {
        clientRef.current.destroy();
      } catch (e) {
        console.warn('Client destroy error:', e);
      }
      clientRef.current = null;
    }
  }, [clientRef, isDestroyedRef]);

  return {
    clientRef,
    isDestroyedRef,
    getClient,
    destroy,
  };
}
