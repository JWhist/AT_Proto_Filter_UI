import { renderHook, act } from '@testing-library/react';
import useWebSocket from './useWebSocket';

// Mock WebSocket more completely
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    
    // Store instance for access in tests
    MockWebSocket.lastInstance = this;
    
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
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
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose({ code: 1000, reason: 'Normal closure' });
  }

  // Helper method to simulate receiving messages
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }

  // Helper method to simulate errors
  simulateError(error) {
    if (this.onerror) {
      this.onerror(error);
    }
  }
}

// Mock the global WebSocket
global.WebSocket = MockWebSocket;

// Suppress console.log for cleaner test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('useWebSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockWebSocket.lastInstance = null;
  });

  it('should initialize with default values when no filterKey provided', () => {
    const { result } = renderHook(() => useWebSocket(''));

    expect(result.current.connectionStatus).toBe('disconnected');
    expect(result.current.events).toEqual([]);
    expect(result.current.eventCount).toBe(0);
    expect(result.current.isPaused).toBe(false);
  });

  it('should attempt to connect when filterKey is provided', async () => {
    const { result } = renderHook(() => useWebSocket('test-filter-key'));

    // Initially connecting
    expect(result.current.connectionStatus).toBe('connecting');

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.connectionStatus).toBe('connected');
  });

  it('should disconnect when filterKey changes to empty', async () => {
    const { result, rerender } = renderHook(
      ({ filterKey }) => useWebSocket(filterKey),
      { initialProps: { filterKey: 'test-filter-key' } }
    );

    // Wait for initial connection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.connectionStatus).toBe('connected');

    // Change to empty filterKey
    act(() => {
      rerender({ filterKey: '' });
    });

    expect(result.current.connectionStatus).toBe('disconnected');
  });

  it('should toggle pause state', () => {
    const { result } = renderHook(() => useWebSocket('test-filter-key'));

    act(() => {
      result.current.togglePause();
    });

    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.togglePause();
    });

    expect(result.current.isPaused).toBe(false);
  });

  it('should clear events', () => {
    const { result } = renderHook(() => useWebSocket('test-filter-key'));

    act(() => {
      result.current.clearEvents();
    });

    expect(result.current.events).toEqual([]);
    expect(result.current.eventCount).toBe(0);
  });

  it('should handle WebSocket messages when not paused', async () => {
    const { result } = renderHook(() => useWebSocket('test-filter-key'));

    // Wait for connection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    const mockEvent = {
      type: 'event',
      data: {
        event: 'commit',
        did: 'did:plc:test123',
        ops: [{ action: 'create', path: 'app.bsky.feed.post/123' }]
      }
    };

    await act(async () => {
      // Simulate receiving a message
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.simulateMessage(mockEvent);
      }
    });

    expect(result.current.events.length).toBeGreaterThan(0);
    expect(result.current.eventCount).toBeGreaterThan(0);
  });

  it('should ignore messages when paused', async () => {
    const { result } = renderHook(() => useWebSocket('test-filter-key'));

    // Pause the stream first
    act(() => {
      result.current.togglePause();
    });

    // Wait for connection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    const mockEvent = {
      type: 'event',
      data: {
        event: 'commit',
        did: 'did:plc:test123'
      }
    };

    await act(async () => {
      // Try to send message while paused
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.simulateMessage(mockEvent);
      }
    });

    // Events should still be empty since stream is paused
    expect(result.current.events).toEqual([]);
    expect(result.current.eventCount).toBe(0);
  });

  it('should reconnect when filterKey changes', async () => {
    const { result, rerender } = renderHook(
      ({ filterKey }) => useWebSocket(filterKey),
      { initialProps: { filterKey: 'filter-1' } }
    );

    // Wait for initial connection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.connectionStatus).toBe('connected');

    // Change filterKey
    act(() => {
      rerender({ filterKey: 'filter-2' });
    });

    // Should trigger reconnection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.connectionStatus).toBe('connected');
  });
});