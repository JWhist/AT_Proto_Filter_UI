import { render, screen, fireEvent } from '@testing-library/react';
import EventItem from './EventItem';

// Mock the useRecordContent hook
jest.mock('./useRecordContent', () => ({
  useRecordContent: jest.fn()
}));

import { useRecordContent } from './useRecordContent';

describe('EventItem', () => {
  const mockEvent = {
    type: 'event',
    timestamp: '2025-10-05T14:30:15.123Z',
    data: {
      event: 'commit',
      did: 'did:plc:abc123xyz456',
      time: '2025-10-05T14:30:14.500Z',
      ops: [
        {
          action: 'create',
          path: 'app.bsky.feed.post/3k2j5h8n9m1',
          cid: 'bafyreibbc5xnl6bs4x6vpprqu4mg4uz',
          collection: 'app.bsky.feed.post',
          rkey: '3k2j5h8n9m1',
          record: {
            $type: 'app.bsky.feed.post',
            text: 'Hello world! This is my first post.',
            createdAt: '2025-10-05T14:30:14.500Z',
            langs: ['en']
          }
        }
      ]
    }
  };

  beforeEach(() => {
    useRecordContent.mockReturnValue({
      recordContent: {
        $type: 'app.bsky.feed.post',
        text: 'Hello world! This is my first post.',
        createdAt: '2025-10-05T14:30:14.500Z',
        langs: ['en']
      },
      isLoading: false,
      error: null
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders event item with basic information', () => {
    render(<EventItem event={mockEvent} />);

    expect(screen.getByText('create')).toBeInTheDocument();
    expect(screen.getByText('feed.post')).toBeInTheDocument(); // Note: 'app.bsky.' is stripped
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });

  it('displays record text when available', () => {
    render(<EventItem event={mockEvent} />);

    // Check for the preview text in the header
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });

  it('shows loading state when record is loading', () => {
    useRecordContent.mockReturnValue({
      recordContent: null,
      isLoading: true,
      error: null
    });

    render(<EventItem event={mockEvent} />);

    // Even when loading, basic event info should still be displayed
    expect(screen.getByText('create')).toBeInTheDocument();
    expect(screen.getByText('feed.post')).toBeInTheDocument();
  });

  it('shows error state when record loading fails', () => {
    useRecordContent.mockReturnValue({
      recordContent: null,
      isLoading: false,
      error: 'Failed to load record'
    });

    render(<EventItem event={mockEvent} />);

    // Basic event info should still be displayed
    expect(screen.getByText('create')).toBeInTheDocument();
    expect(screen.getByText('feed.post')).toBeInTheDocument();
  });

  it('can expand and collapse event details', () => {
    render(<EventItem event={mockEvent} />);

    const eventHeader = screen.getByText('create').closest('.event-header');
    
    // Initially collapsed - detailed info not visible
    expect(screen.queryByText(/repository:/i)).not.toBeInTheDocument();

    // Expand by clicking the header
    fireEvent.click(eventHeader);
    
    // Now expanded - should show more details
    expect(screen.getByText(/did:plc:abc123xyz456/)).toBeInTheDocument();

    // Collapse again
    fireEvent.click(eventHeader);
    
    // Should be collapsed again
    expect(screen.queryByText(/repository:/i)).not.toBeInTheDocument();
  });

  it('handles events without ops gracefully', () => {
    const eventWithoutOps = {
      type: 'event',
      timestamp: '2025-10-05T14:30:15.123Z',
      data: {
        event: 'commit',
        did: 'did:plc:abc123xyz456'
      }
    };

    useRecordContent.mockReturnValue({
      recordContent: null,
      isLoading: false,
      error: null
    });

    render(<EventItem event={eventWithoutOps} />);

    // Component should not render anything for events without ops
    expect(screen.queryByText('create')).not.toBeInTheDocument();
  });

  it('handles different record types - likes', () => {
    const likeEvent = {
      ...mockEvent,
      data: {
        ...mockEvent.data,
        ops: [
          {
            action: 'create',
            path: 'app.bsky.feed.like/abc123',
            collection: 'app.bsky.feed.like',
            record: {
              $type: 'app.bsky.feed.like',
              subject: {
                uri: 'at://did:plc:example/app.bsky.feed.post/123'
              },
              createdAt: '2025-10-05T14:30:14.500Z'
            }
          }
        ]
      }
    };

    useRecordContent.mockReturnValue({
      recordContent: {
        $type: 'app.bsky.feed.like',
        subject: {
          uri: 'at://did:plc:example/app.bsky.feed.post/123'
        },
        createdAt: '2025-10-05T14:30:14.500Z'
      },
      isLoading: false,
      error: null
    });

    render(<EventItem event={likeEvent} />);

    expect(screen.getByText('feed.like')).toBeInTheDocument(); // Stripped prefix
    expect(screen.getByText(/create → 123/)).toBeInTheDocument(); // Preview shows target
  });

  it('formats timestamp correctly', () => {
    render(<EventItem event={mockEvent} />);

    // Check that timestamp is displayed (the component uses toLocaleTimeString)
    // The exact format may vary by locale, so we check for a time-like pattern
    expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('handles delete actions', () => {
    const deleteEvent = {
      ...mockEvent,
      data: {
        ...mockEvent.data,
        ops: [
          {
            action: 'delete',
            path: 'app.bsky.feed.post/3k2j5h8n9m1',
            collection: 'app.bsky.feed.post'
          }
        ]
      }
    };

    useRecordContent.mockReturnValue({
      recordContent: null,
      isLoading: false,
      error: null
    });

    render(<EventItem event={deleteEvent} />);

    expect(screen.getByText('delete')).toBeInTheDocument();
    expect(screen.getByText('feed.post')).toBeInTheDocument();
    expect(screen.getByText(/delete operation on 3k2j5h8n9m1/)).toBeInTheDocument();
  });

  it('displays appropriate colors for different event types', () => {
    render(<EventItem event={mockEvent} />);

    const eventTypeElement = screen.getByText('create');
    expect(eventTypeElement).toHaveStyle('background-color: rgb(59, 130, 246)'); // blue for posts
  });

  it('truncates long preview text', () => {
    const longTextEvent = {
      ...mockEvent,
      data: {
        ...mockEvent.data,
        ops: [
          {
            ...mockEvent.data.ops[0],
            record: {
              ...mockEvent.data.ops[0].record,
              text: 'This is a very long post that should be truncated in the preview because it exceeds the character limit that we have set for preview text display'
            }
          }
        ]
      }
    };

    useRecordContent.mockReturnValue({
      recordContent: {
        text: 'This is a very long post that should be truncated in the preview because it exceeds the character limit that we have set for preview text display',
        createdAt: '2025-10-05T14:30:14.500Z',
        langs: ['en']
      },
      isLoading: false,
      error: null
    });

    render(<EventItem event={longTextEvent} />);

    // Should show truncated text with ellipsis
    expect(screen.getByText(/This is a very long post.*\.\.\./)).toBeInTheDocument();
  });
});