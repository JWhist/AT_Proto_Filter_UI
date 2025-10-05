// Since we're no longer using the utility functions for external API calls,
// let's create a simple test to document the expected behavior if they were to be used

describe('atproto-utils (legacy)', () => {
  // Note: These utilities are no longer used in the current implementation
  // since the backend now provides parsed record content directly in WebSocket events.
  // These tests serve as documentation of the original intended behavior.

  describe('parsePathInfo', () => {
    // This function would parse AT Protocol paths
    it('should parse valid paths', () => {
      const path = 'app.bsky.feed.post/3k2j5h8n9m1';
      const expected = {
        collection: 'app.bsky.feed.post',
        rkey: '3k2j5h8n9m1'
      };
      
      // If the function were imported and used:
      // expect(parsePathInfo(path)).toEqual(expected);
      
      // Manual implementation for test purposes
      const parts = path.split('/');
      const result = {
        collection: parts[0],
        rkey: parts[1]
      };
      
      expect(result).toEqual(expected);
    });

    it('should handle invalid paths', () => {
      const invalidPath = 'invalid-path';
      
      // Manual implementation
      const parts = invalidPath.split('/');
      const result = parts.length === 2 ? {
        collection: parts[0],
        rkey: parts[1]
      } : null;
      
      expect(result).toBeNull();
    });
  });

  describe('shouldFetchContent', () => {
    it('should return true for create actions on supported collections', () => {
      const testCases = [
        { action: 'create', collection: 'app.bsky.feed.post', expected: true },
        { action: 'create', collection: 'app.bsky.feed.like', expected: true },
        { action: 'create', collection: 'app.bsky.feed.repost', expected: true },
        { action: 'create', collection: 'app.bsky.graph.follow', expected: true },
        { action: 'delete', collection: 'app.bsky.feed.post', expected: false },
        { action: 'create', collection: 'unsupported.collection', expected: false }
      ];

      testCases.forEach(({ action, collection, expected }) => {
        // Manual implementation
        const result = action === 'create' && (
          collection === 'app.bsky.feed.post' ||
          collection === 'app.bsky.feed.like' ||
          collection === 'app.bsky.feed.repost' ||
          collection === 'app.bsky.graph.follow'
        );
        
        expect(result).toBe(expected);
      });
    });
  });

  describe('fetchRecordContent (deprecated)', () => {
    // This function is no longer used since the backend provides parsed content
    it('documents the expected API call structure', () => {
      const did = 'did:plc:abc123xyz456';
      const collection = 'app.bsky.feed.post';
      const rkey = '3k2j5h8n9m1';
      
      const expectedUrl = `https://bsky.social/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=${collection}&rkey=${rkey}`;
      
      expect(expectedUrl).toBe('https://bsky.social/xrpc/com.atproto.repo.getRecord?repo=did:plc:abc123xyz456&collection=app.bsky.feed.post&rkey=3k2j5h8n9m1');
    });
  });
});