import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the useWebSocket hook
jest.mock('./useWebSocket', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

import useWebSocket from './useWebSocket';

describe('App', () => {
  const mockClearEvents = jest.fn();
  const mockTogglePause = jest.fn();
  
  const mockUseWebSocket = {
    connectionStatus: 'disconnected',
    events: [],
    eventCount: 0,
    isPaused: false,
    clearEvents: mockClearEvents,
    togglePause: mockTogglePause
  };

  beforeEach(() => {
    useWebSocket.mockReturnValue(mockUseWebSocket);
    fetch.mockClear();
    mockClearEvents.mockClear();
    mockTogglePause.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main application components', () => {
    render(<App />);

    expect(screen.getByText(/at protocol filter ui/i)).toBeInTheDocument();
    expect(screen.getByText(/real-time filtered event streaming/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/path prefix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/keyword/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply filter/i })).toBeInTheDocument();
  });

  it('shows default path prefix value', () => {
    render(<App />);

    const pathPrefixInput = screen.getByLabelText(/path prefix/i);
    expect(pathPrefixInput).toHaveValue('app.bsky.feed.post');
  });

  it('creates filter when Apply Filter is clicked', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        filterKey: 'test-filter-key',
        options: {
          pathPrefix: 'app.bsky.feed.post',
          keyword: 'hello'
        }
      })
    });

    render(<App />);

    const keywordInput = screen.getByLabelText(/keyword/i);
    const applyButton = screen.getByRole('button', { name: /apply filter/i });

    await user.type(keywordInput, 'hello');
    await user.click(applyButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/filters/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          options: {
            pathPrefix: 'app.bsky.feed.post',
            keyword: 'hello'
          }
        })
      });
    });
  });

  it('handles filter creation errors gracefully', async () => {
    const user = userEvent.setup();
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    // Mock window.alert
    window.alert = jest.fn();

    render(<App />);

    const applyButton = screen.getByRole('button', { name: /apply filter/i });
    await user.click(applyButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create filter')
      );
    });
  });

  it('tests backend connection when Test Connection is clicked', async () => {
    const user = userEvent.setup();
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { status: 'active' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          filterKey: 'test-filter-key'
        })
      });

    window.alert = jest.fn();

    render(<App />);

    const testButton = screen.getByRole('button', { name: /test backend/i });
    await user.click(testButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/status');
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Backend connection test')
      );
    });
  });

  it('tests direct WebSocket connection', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        filterKey: 'direct-test-filter-key'
      })
    });

    render(<App />);

    const testDirectButton = screen.getByRole('button', { name: /test direct ws/i });
    await user.click(testDirectButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/filters/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          options: {
            pathPrefix: 'app.bsky.feed.post',
            keyword: 'test'
          }
        })
      });
    });
  });

  it('clears filter when Clear is clicked', async () => {
    const user = userEvent.setup();
    
    render(<App />);

    const clearButton = screen.getByRole('button', { name: 'Clear' });
    await user.click(clearButton);

    // Should clear the form
    expect(screen.getByLabelText(/repository/i)).toHaveValue('');
    expect(screen.getByLabelText(/path prefix/i)).toHaveValue('app.bsky.feed.post');
    expect(screen.getByLabelText(/keyword/i)).toHaveValue('');
  });

  it('displays connection status', () => {
    render(<App />);

    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });

  it('displays event count', () => {
    useWebSocket.mockReturnValue({
      ...mockUseWebSocket,
      eventCount: 42
    });

    render(<App />);

    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('handles pause/resume functionality', async () => {
    const user = userEvent.setup();
    
    // Mock the useWebSocket hook to return functions we can track
    useWebSocket.mockReturnValue({
      connectionStatus: 'connected',
      events: [],
      eventCount: 0,
      isPaused: false,
      clearEvents: mockClearEvents,
      togglePause: mockTogglePause
    });
    
    render(<App />);

    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseButton);

    expect(mockTogglePause).toHaveBeenCalled();
  });

  it('handles clear events functionality', async () => {
    const user = userEvent.setup();
    
    // Mock the useWebSocket hook to return functions we can track
    useWebSocket.mockReturnValue({
      connectionStatus: 'connected',
      events: [{ id: 1 }],
      eventCount: 1,
      isPaused: false,
      clearEvents: mockClearEvents,
      togglePause: mockTogglePause
    });
    
    render(<App />);

    const clearEventsButton = screen.getByRole('button', { name: /clear log/i });
    await user.click(clearEventsButton);

    expect(mockClearEvents).toHaveBeenCalled();
  });
});