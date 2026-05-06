/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 统一的日志工具类
 * 
 * 提供 debug、info、warn、error 四个级别的日志方法，
 * 根据设置的日志级别过滤输出。
 */
export class Logger {
  private level: LogLevel = LogLevel.INFO;
  private prefix: string;

  /**
   * 创建日志器实例
   * @param prefix 日志前缀，默认 '[XfyunASR]'
   */
  constructor(prefix: string = '[XfyunASR]') {
    this.prefix = prefix;
  }

  /**
   * 设置日志级别
   * @param level 日志级别 ('debug' | 'info' | 'warn' | 'error')
   */
  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    switch (level) {
      case 'debug': this.level = LogLevel.DEBUG; break;
      case 'info': this.level = LogLevel.INFO; break;
      case 'warn': this.level = LogLevel.WARN; break;
      case 'error': this.level = LogLevel.ERROR; break;
    }
  }

  /**
   * 输出 DEBUG 级别日志
   * @param args 日志内容
   */
  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.prefix, ...args);
    }
  }

  /**
   * 输出 INFO 级别日志
   * @param args 日志内容
   */
  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.prefix, ...args);
    }
  }

  /**
   * 输出 WARN 级别日志
   * @param args 日志内容
   */
  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.prefix, ...args);
    }
  }

  /**
   * 输出 ERROR 级别日志
   * @param args 日志内容
   */
  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.prefix, ...args);
    }
  }
}
