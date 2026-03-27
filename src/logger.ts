/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 统一的日志工具类
 */
export class Logger {
  private level: LogLevel = LogLevel.INFO;
  private prefix: string;

  constructor(prefix: string = '[XfyunASR]') {
    this.prefix = prefix;
  }

  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    switch (level) {
      case 'debug': this.level = LogLevel.DEBUG; break;
      case 'info': this.level = LogLevel.INFO; break;
      case 'warn': this.level = LogLevel.WARN; break;
      case 'error': this.level = LogLevel.ERROR; break;
    }
  }

  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.prefix, ...args);
    }
  }

  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.prefix, ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.prefix, ...args);
    }
  }

  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.prefix, ...args);
    }
  }
}
