import React from 'react';
import EventItem from './EventItem';

const EventStream = ({ 
  events, 
  eventCount, 
  isPaused, 
  onClearEvents, 
  onTogglePause, 
  connectionStatus 
}) => {
  const hasEvents = events.length > 0;
  const isConnected = connectionStatus === 'connected';

  return (
    <div className="event-stream">
      <div className="stream-header">
        <h2>Event Stream</h2>
        <div className="stream-controls">
          <button 
            onClick={onClearEvents}
            className="btn btn-sm"
            disabled={!hasEvents}
          >
            Clear Log
          </button>
          <button 
            onClick={onTogglePause}
            className={`btn btn-sm ${isPaused ? 'btn-warning' : ''}`}
            disabled={!isConnected}
            style={isPaused ? { backgroundColor: '#f59e0b', color: 'white' } : {}}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <span className="event-count">
            Events: <strong>{eventCount}</strong>
            {isPaused && <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>⏸️ PAUSED</span>}
          </span>
        </div>
      </div>

      <div className="event-container">
        {isPaused && isConnected && (
          <div className="pause-overlay">
            <div className="pause-message">
              ⏸️ Stream Paused - Click Resume to continue
            </div>
          </div>
        )}
        
        {!hasEvents ? (
          <div className="event-placeholder">
            <div className="placeholder-icon">📡</div>
            <p>
              {!isConnected 
                ? "Configure filters above and click \"Apply Filter\" to start streaming events"
                : "Waiting for events..."
              }
            </p>
            {isPaused && isConnected && (
              <p className="pause-notice">Stream is paused. Click "Resume" to continue.</p>
            )}
            {isConnected && !isPaused && (
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                <p>✅ Connected to WebSocket</p>
                <p>🔍 Listening for matching events...</p>
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                  <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>💡 Filtering Tips:</p>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem' }}>
                    <li><strong>Path filters work great:</strong> Try <code>app.bsky.feed.post</code> for posts</li>
                    <li><strong>Repository filters:</strong> Use specific user DIDs</li>
                    <li><strong>Keyword filters:</strong> May be limited due to firehose data structure</li>
                  </ul>
                </div>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>📊 Check browser console (F12) for raw message logs</p>
              </div>
            )}
          </div>
        ) : (
          <div className="event-list">
            {events.map((event, index) => (
              <EventItem 
                key={`${event.timestamp}-${index}`} 
                event={event} 
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventStream;