import React, { useState } from 'react';
import { useRecordContent } from './useRecordContent';
import { parsePathInfo } from './atproto-utils';

const EventItem = ({ event, index, filterKeyword }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to highlight keywords in text
  const highlightKeywords = (text, keywords) => {
    if (!keywords || !text) return text;
    
    // Split keywords by comma and trim whitespace
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    if (keywordList.length === 0) return text;
    
    // Create a regex pattern that matches any of the keywords (case insensitive)
    const pattern = new RegExp(`(${keywordList.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    
    // Split text by the pattern while keeping the matched parts
    const parts = text.split(pattern);
    
    return parts.map((part, i) => {
      // Check if this part matches any keyword (case insensitive)
      const isKeyword = keywordList.some(keyword => 
        part.toLowerCase() === keyword.toLowerCase()
      );
      
      return isKeyword ? (
        <span key={i} style={{ backgroundColor: '#fef08a', padding: '1px 2px', borderRadius: '2px' }}>
          {part}
        </span>
      ) : part;
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getEventTypeColor = (path) => {
    if (path.includes('feed.post')) return '#3b82f6'; // blue
    if (path.includes('graph.follow')) return '#10b981'; // green
    if (path.includes('feed.like')) return '#f59e0b'; // yellow
    if (path.includes('feed.repost')) return '#8b5cf6'; // purple
    return '#6b7280'; // gray
  };

  const extractEventInfo = (eventData) => {
    const ops = eventData.data?.ops || [];
    if (ops.length === 0) return null;

    const op = ops[0];
    
    return {
      action: op.action,
      collection: op.collection || op.path?.split('/')[0] || 'unknown',
      path: op.path,
      record: op.record, // This now contains the full parsed record from the backend
      did: eventData.data?.did,
      cid: op.cid,
      rkey: op.rkey,
      timestamp: eventData.data?.time || eventData.timestamp
    };
  };

  const renderRecordContent = (record, cid, path) => {
    if (record) {
      // Handle different types of records
      if (record.text) {
        // Post record
        return (
          <div className="record-content">
            <div className="record-text">"{highlightKeywords(record.text, filterKeyword)}"</div>
            {record.langs && (
              <div className="record-meta">
                Languages: {record.langs.join(', ')}
              </div>
            )}
            {record.createdAt && (
              <div className="record-meta">
                Created: {new Date(record.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        );
      }

      if (record.subject) {
        // Like/repost record
        return (
          <div className="record-content">
            <div className="record-subject">
              <strong>Subject:</strong> {record.subject.uri}
            </div>
            {record.createdAt && (
              <div className="record-meta">
                Created: {new Date(record.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        );
      }

      // Generic record with any content
      return (
        <div className="record-content">
          <div className="record-raw">
            <strong>Record Data:</strong>
            <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(record, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    // For events without record content (like commit events), show basic info
    if (cid || path) {
      return (
        <div className="record-content">
          <div className="record-meta">
            {path && <div><strong>Path:</strong> {path}</div>}
            {cid && <div><strong>CID:</strong> <code>{cid}</code></div>}
            <div className="record-note">💡 This is a commit event - record content may not be available</div>
          </div>
        </div>
      );
    }

    return null;
  };

  const eventInfo = extractEventInfo(event);
  if (!eventInfo) return null;

  const { action, collection, path, record, did, cid } = eventInfo;
  const eventTypeColor = getEventTypeColor(collection);

  // Create a preview text
  let previewText = '';
  if (record?.text) {
    previewText = record.text; // Show full text, let CSS handle wrapping
  } else if (record?.subject) {
    previewText = `${action} → ${record.subject.uri.split('/').pop()}`;
  } else if (path) {
    previewText = `${action} operation on ${path.split('/').pop()}`;
  } else {
    previewText = `${action} operation`;
  }

  // Highlight keywords in preview text
  const highlightedPreview = highlightKeywords(previewText, filterKeyword);

  return (
    <div className="event-item">
      <div className="event-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="event-time">
          {formatTimestamp(event.timestamp)}
        </div>
        
        <div className="event-summary">
          <div className="event-tags">
            <span 
              className="event-type"
              style={{ backgroundColor: eventTypeColor }}
            >
              {action}
            </span>
            
            <span className="event-collection">
              {collection.replace('app.bsky.', '')}
            </span>
          </div>
          
          <div className="event-preview">
            {highlightedPreview}
          </div>
        </div>

        <div className="event-expand">
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="event-details">
          <div className="event-metadata">
            <div className="metadata-item">
              <span className="metadata-label">DID:</span>
              <code className="metadata-value">{did}</code>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Path:</span>
              <code className="metadata-value">{path}</code>
            </div>
            {cid && (
              <div className="metadata-item">
                <span className="metadata-label">CID:</span>
                <code className="metadata-value">{cid}</code>
              </div>
            )}
            <div className="metadata-item">
              <span className="metadata-label">Created:</span>
              <span className="metadata-value">
                {record?.createdAt ? formatTimestamp(record.createdAt) : 'N/A'}
              </span>
            </div>
          </div>

          {renderRecordContent(record, cid, path)}

          {event.data?.timestamps && (
            <div className="timing-info">
              <h4>Timing Information</h4>
              <div className="timing-grid">
                <div>Original: {formatTimestamp(event.data.timestamps.original)}</div>
                <div>Received: {formatTimestamp(event.data.timestamps.received)}</div>
                <div>Forwarded: {formatTimestamp(event.data.timestamps.forwarded)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventItem;