import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost/',
    origin: 'http://localhost',
    protocol: 'http:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Linux; x64) AppleWebKit/537.36',
  writable: true,
});

// Mock crypto
if (!window.crypto) {
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      },
    },
    writable: true,
  });
}

// Mock AudioContext
class MockAudioContext {
  state = 'running';
  sampleRate = 44100;
  currentTime = 0;
  
  createBufferSource() {
    return {
      buffer: null,
      connect: () => {},
      start: () => {},
      stop: () => {},
      onended: null,
    };
  }
  
  createMediaStreamSource() {
    return {
      connect: () => {},
      disconnect: () => {},
    };
  }
  
  createScriptProcessor() {
    return {
      connect: () => {},
      disconnect: () => {},
      onaudioprocess: null,
    };
  }
  
  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
  
  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }
  
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
}

Object.defineProperty(window, 'AudioContext', {
  value: MockAudioContext,
  writable: true,
});

// Mock WebSocket - auto-connect to simulate real behavior
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  
  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  
  constructor(url: string, protocols?: string | string[]) {
    // Auto-connect after a short delay to simulate real WebSocket behavior
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }
  
  send(data: string | ArrayBuffer | Blob): void {}
  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }
}

Object.defineProperty(window, 'WebSocket', {
  value: MockWebSocket,
  writable: true,
});

// Mock MediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [],
      stop: vi.fn(),
    }),
  },
  writable: true,
});

// Mock FileReader
class MockFileReader {
  static EMPTY = 0;
  static LOADING = 1;
  static DONE = 2;
  
  readyState = MockFileReader.EMPTY;
  result: ArrayBuffer | string | null = null;
  error = null;
  onload: ((event: ProgressEvent) => void) | null = null;
  onloadend: ((event: ProgressEvent) => void) | null = null;
  
  readAsArrayBuffer(file: File) {
    this.readyState = MockFileReader.LOADING;
    setTimeout(() => {
      this.result = new ArrayBuffer(0);
      this.readyState = MockFileReader.DONE;
      if (this.onload) this.onload({} as ProgressEvent);
      if (this.onloadend) this.onloadend({} as ProgressEvent);
    }, 10);
  }
  
  readAsDataURL(file: File) {
    this.readyState = MockFileReader.LOADING;
    setTimeout(() => {
      this.result = 'data:application/octet-stream;base64,';
      this.readyState = MockFileReader.DONE;
      if (this.onload) this.onload({} as ProgressEvent);
      if (this.onloadend) this.onloadend({} as ProgressEvent);
    }, 10);
  }
  
  abort() {
    this.readyState = MockFileReader.EMPTY;
  }
}

Object.defineProperty(window, 'FileReader', {
  value: MockFileReader,
  writable: true,
});

// Mock performance
if (!window.performance) {
  Object.defineProperty(window, 'performance', {
    value: {
      now: () => performance.now(),
      timeOrigin: Date.now(),
    },
    writable: true,
  });
}

// Mock requestAnimationFrame
if (!window.requestAnimationFrame) {
  Object.defineProperty(window, 'requestAnimationFrame', {
    value: (cb: FrameRequestCallback) => setTimeout(cb, 16),
    writable: true,
  });
}

if (!window.cancelAnimationFrame) {
  Object.defineProperty(window, 'cancelAnimationFrame', {
    value: (id: number) => clearTimeout(id),
    writable: true,
  });
}
