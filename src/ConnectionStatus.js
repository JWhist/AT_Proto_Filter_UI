import React from 'react';

const ConnectionStatus = ({ status, filterKey, onTestConnection, onTestDirect }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#10b981'; // green
      case 'connecting':
      case 'reconnecting':
        return '#f59e0b'; // yellow
      case 'disconnected':
        return '#6b7280'; // gray
      case 'error':
        return '#ef4444'; // red
      default:
        return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="connection-status">
      <div className="status-indicator">
        <div 
          className="status-dot" 
          style={{ backgroundColor: getStatusColor() }}
        />
        <span className="status-text">{getStatusText()}</span>
      </div>
      {filterKey && (
        <div className="filter-info">
          <span className="filter-key-label">Filter Key:</span>
          <code className="filter-key">{filterKey}</code>
        </div>
      )}
      {onTestConnection && (
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={onTestConnection} 
            className="btn btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            Test Backend
          </button>
          {onTestDirect && (
            <button 
              onClick={onTestDirect} 
              className="btn btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Test Direct WS
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;