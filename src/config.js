// Environment configuration for the AT Protocol Filter UI
// This file centralizes environment variable handling for both development and production

const getBackendUrl = () => {
  // In production, REACT_APP_BACKEND_URL should be set in Netlify environment variables
  // In development, it falls back to localhost
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  
  if (envUrl) {
    console.log('Using backend URL from environment:', envUrl);
    return envUrl;
  }
  
  // Development fallback
  const fallbackUrl = 'http://localhost:8080';
  console.log('Using fallback backend URL:', fallbackUrl);
  return fallbackUrl;
};

const backendUrl = getBackendUrl();

// Convert HTTP URL to WebSocket URL
const getWebSocketUrl = (httpUrl) => {
  return httpUrl.replace(/^https?:/, httpUrl.startsWith('https:') ? 'wss:' : 'ws:');
};

const wsUrl = getWebSocketUrl(backendUrl);

export const config = {
  backendUrl,
  wsUrl: `${wsUrl}/ws`,
  httpUrl: backendUrl
};

console.log('Environment configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  computed: config
});

export default config;