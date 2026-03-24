import '@testing-library/jest-dom';

// Mock window.btoa
if (typeof window !== 'undefined') {
  window.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

// Mock AudioContext
if (typeof window !== 'undefined') {
  const MockAudioContext = class AudioContext {
    createAnalyser() {
      return {
        fftSize: 2048,
        frequencyBinCount: 1024,
        getFloatTimeDomainData: (data: Float32Array) => {
          data.fill(0);
        },
      };
    }
    createMediaStreamSource() {
      return { connect: () => {} };
    }
    close() {
      return Promise.resolve();
    }
  };

  Object.defineProperty(window, 'AudioContext', {
    writable: true,
    value: MockAudioContext,
  });

  Object.defineProperty(window, 'webkitAudioContext', {
    writable: true,
    value: MockAudioContext,
  });
}
