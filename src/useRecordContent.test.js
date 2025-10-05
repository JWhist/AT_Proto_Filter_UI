import { renderHook } from '@testing-library/react';
import { useRecordContent } from './useRecordContent';

describe('useRecordContent', () => {
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
          cid: 'bafyreibbc5xnl6bs4x6vpprqu4mg4uz...',
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

  it('should extract record content from event', () => {
    const { result } = renderHook(() => useRecordContent(mockEvent));

    expect(result.current.recordContent).toEqual({
      $type: 'app.bsky.feed.post',
      text: 'Hello world! This is my first post.',
      createdAt: '2025-10-05T14:30:14.500Z',
      langs: ['en']
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should return null for events without ops', () => {
    const eventWithoutOps = {
      type: 'event',
      data: {
        event: 'commit',
        did: 'did:plc:abc123xyz456'
      }
    };

    const { result } = renderHook(() => useRecordContent(eventWithoutOps));

    expect(result.current.recordContent).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should return null for events without record', () => {
    const eventWithoutRecord = {
      type: 'event',
      data: {
        event: 'commit',
        did: 'did:plc:abc123xyz456',
        ops: [
          {
            action: 'delete',
            path: 'app.bsky.feed.post/3k2j5h8n9m1',
            cid: 'bafyreibbc5xnl6bs4x6vpprqu4mg4uz...'
          }
        ]
      }
    };

    const { result } = renderHook(() => useRecordContent(eventWithoutRecord));

    expect(result.current.recordContent).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should update when event changes', () => {
    const { result, rerender } = renderHook(
      ({ event }) => useRecordContent(event),
      { initialProps: { event: mockEvent } }
    );

    // Initial state
    expect(result.current.recordContent?.text).toBe('Hello world! This is my first post.');

    // New event
    const newEvent = {
      ...mockEvent,
      data: {
        ...mockEvent.data,
        ops: [
          {
            ...mockEvent.data.ops[0],
            record: {
              $type: 'app.bsky.feed.post',
              text: 'This is a different post.',
              createdAt: '2025-10-05T14:35:14.500Z',
              langs: ['en']
            }
          }
        ]
      }
    };

    rerender({ event: newEvent });

    expect(result.current.recordContent?.text).toBe('This is a different post.');
  });
});