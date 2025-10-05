// Utility functions for AT Protocol record resolution

export const fetchRecordContent = async (did, collection, rkey) => {
  try {
    // Use the AT Protocol's com.atproto.repo.getRecord method
    const url = `https://bsky.social/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=${collection}&rkey=${rkey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch record: ${response.status}`);
    }
    
    const data = await response.json();
    return data.value; // The actual record content
  } catch (error) {
    console.error('Error fetching record content:', error);
    return null;
  }
};

export const parsePathInfo = (path) => {
  // Parse path like "app.bsky.feed.post/3m2hkl5gtl22a"
  const parts = path.split('/');
  if (parts.length !== 2) return null;
  
  return {
    collection: parts[0],
    rkey: parts[1]
  };
};

export const shouldFetchContent = (action, collection) => {
  // Only fetch content for create actions on posts, likes, reposts, etc.
  return action === 'create' && (
    collection === 'app.bsky.feed.post' ||
    collection === 'app.bsky.feed.like' ||
    collection === 'app.bsky.feed.repost' ||
    collection === 'app.bsky.graph.follow'
  );
};