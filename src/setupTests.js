// Test setup file
import '@testing-library/jest-dom';

// Mock window.alert to prevent jsdom errors
global.alert = jest.fn();

// Mock WebSocket for testing
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  send(data) {
    // Mock send method
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose({ code: 1000, reason: 'Normal closure' });
  }
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock environment variables
process.env.REACT_APP_BACKEND_URL = 'http://localhost:8080';