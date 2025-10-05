import { useState, useEffect, useRef } from 'react';

// Get backend URL from environment variable
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

// Convert HTTP URL to WebSocket URL
const wsUrl = backendUrl.replace(/^https?:/, backendUrl.startsWith('https:') ? 'wss:' : 'ws:');

// Configuration using environment variables
const config = {
  wsUrl: `${wsUrl}/ws`,
  httpUrl: backendUrl
};

const currentConfig = config;

const useWebSocket = (filterKey) => {
  const socket = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [events, setEvents] = useState([]);
  const [eventCount, setEventCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Use ref to track pause state so it's accessible in WebSocket callbacks
  const isPausedRef = useRef(false);
  
  // Update ref whenever isPaused changes
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (!filterKey) {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');

    const connect = () => {
      const wsUrl = `${currentConfig.wsUrl}/${filterKey}`;
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setConnectionStatus('connected');
        socket.current = ws;
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        console.log('Raw WebSocket message received:', event.data);
        
        if (isPausedRef.current) {
          console.log('Message ignored - stream is paused');
          return;
        }

        try {
          const message = JSON.parse(event.data);
          console.log('Parsed WebSocket message:', message);
          
          // Log the full structure so we can see what's available
          if (message.type === 'event' && message.data) {
            console.log('Event data structure:', {
              ops: message.data.ops,
              hasRecord: message.data.ops?.[0]?.record ? 'YES' : 'NO',
              recordKeys: message.data.ops?.[0]?.record ? Object.keys(message.data.ops[0].record) : 'none'
            });
          }
          
          if (message.type === 'event') {
            console.log('Adding event to stream:', message);
            setEvents(prev => {
              const newEvents = [message, ...prev];
              // Keep only the last 100 events to prevent memory issues
              return newEvents.slice(0, 100);
            });
            setEventCount(prev => prev + 1);
          } else if (message.type === 'connection') {
            console.log('Connection message:', message.data);
          } else {
            console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        console.log('Close event details:', event);
        setConnectionStatus('disconnected');
        socket.current = null;

        // Attempt to reconnect if not a clean close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setConnectionStatus('reconnecting');
          console.log(`🔄 Attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`);
            connect();
          }, 2000 * reconnectAttempts.current); // Exponential backoff
        } else {
          console.log('❌ Max reconnection attempts reached or clean close');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        console.error('Error details:', error);
        setConnectionStatus('error');
      };
    };

    connect();

    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, [filterKey]); // Only depend on filterKey, not socket or isPaused

  const clearEvents = () => {
    setEvents([]);
    setEventCount(0);
  };

  const togglePause = () => {
    setIsPaused(prev => {
      const newPauseState = !prev;
      console.log(`🎛️ Stream ${newPauseState ? 'PAUSED' : 'RESUMED'}`);
      return newPauseState;
    });
  };

  return {
    connectionStatus,
    events,
    eventCount,
    isPaused,
    clearEvents,
    togglePause,
    socketRef: socket
  };
};

export default useWebSocket;