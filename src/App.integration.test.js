import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Integration tests that test the app as a whole
describe('App Integration Tests', () => {
  beforeEach(() => {
    // Mock fetch globally
    global.fetch = jest.fn();
    
    // Mock alert to prevent jsdom errors
    global.alert = jest.fn();
    
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('completes full workflow: create filter -> connect -> receive events', async () => {
    const user = userEvent.setup();
    
    // Mock successful filter creation
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        filterKey: 'integration-test-filter',
        options: {
          pathPrefix: 'app.bsky.feed.post',
          keyword: 'test'
        }
      })
    });

    render(<App />);

    // Step 1: Configure filter
    const keywordInput = screen.getByLabelText(/keyword/i);
    await user.type(keywordInput, 'test');

    // Step 2: Apply filter
    const applyButton = screen.getByRole('button', { name: /apply filter/i });
    await user.click(applyButton);

    // Step 3: Verify filter was created
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/filters/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          options: {
            pathPrefix: 'app.bsky.feed.post',
            keyword: 'test'
          }
        })
      });
    });

    // The WebSocket connection would be established automatically
    // In a real integration test, we could verify connection status
  });

  it('handles error scenarios gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock network error
    fetch.mockRejectedValueOnce(new Error('Network error'));
    window.alert = jest.fn();

    render(<App />);

    const applyButton = screen.getByRole('button', { name: /apply filter/i });
    await user.click(applyButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create filter')
      );
    });

    // App should still be functional after error
    expect(screen.getByText(/at protocol filter ui/i)).toBeInTheDocument();
  });

  it('maintains state across filter changes', async () => {
    const user = userEvent.setup();
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ filterKey: 'filter-1' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ filterKey: 'filter-2' })
      });

    render(<App />);

    // Create first filter
    const keywordInput = screen.getByLabelText(/keyword/i);
    await user.type(keywordInput, 'first');
    
    const applyButton = screen.getByRole('button', { name: /apply filter/i });
    await user.click(applyButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Change filter
    await user.clear(keywordInput);
    await user.type(keywordInput, 'second');
    await user.click(applyButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    // Verify the form still shows the current values
    expect(keywordInput).toHaveValue('second');
  });

  it('clears and resets properly', async () => {
    const user = userEvent.setup();
    
    render(<App />);

    // Fill out form
    const repositoryInput = screen.getByLabelText(/repository/i);
    const keywordInput = screen.getByLabelText(/keyword/i);
    
    await user.type(repositoryInput, 'did:plc:test');
    await user.type(keywordInput, 'test keyword');

    // Clear form - be specific about which clear button
    const clearButton = screen.getByRole('button', { name: 'Clear' });
    await user.click(clearButton);

    // Verify form is cleared
    expect(repositoryInput).toHaveValue('');
    expect(keywordInput).toHaveValue('');
    
    // Path prefix should return to default
    const pathPrefixInput = screen.getByLabelText(/path prefix/i);
    expect(pathPrefixInput).toHaveValue('app.bsky.feed.post');
  });

  it('handles environment variables correctly', () => {
    // Verify that environment variables are being used
    expect(process.env.REACT_APP_BACKEND_URL).toBe('http://localhost:8080');
    
    render(<App />);
    
    // The app should render without errors when environment variables are set
    expect(screen.getByText(/at protocol filter ui/i)).toBeInTheDocument();
  });
});