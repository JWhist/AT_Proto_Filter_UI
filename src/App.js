import React, { useState, useCallback } from 'react';
import useWebSocket from './useWebSocket';
import FilterForm from './FilterForm';
import EventStream from './EventStream';
import ConnectionStatus from './ConnectionStatus';
import './App.css';

// Get backend URL from environment variable
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

function App() {
  const [filterKey, setFilterKey] = useState('');
  const [currentFilter, setCurrentFilter] = useState({
    repository: '',
    pathPrefix: '',
    keyword: ''
  });

  const {
    connectionStatus,
    events,
    eventCount,
    isPaused,
    clearEvents,
    togglePause
  } = useWebSocket(filterKey);

  const testConnectionDirect = useCallback(async () => {
    try {
      console.log('🧪 Testing direct WebSocket connection...');
      
      // Create a simple test filter for immediate connection testing
      const testResponse = await fetch('/api/filters/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          options: { 
            pathPrefix: 'app.bsky.feed.post',
            keyword: 'test'
          } 
        }),
      });
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('Setting filter key to:', testData.filterKey);
        setFilterKey(testData.filterKey);
      } else {
        throw new Error('Failed to create test filter');
      }
      
    } catch (error) {
      console.error('Direct connection test failed:', error);
      alert(`Direct connection test failed: ${error.message}`);
    }
  }, []);

  const testConnection = useCallback(async () => {
    try {
      console.log('Testing backend connection...');
      
      // Test the status endpoint
      const statusResponse = await fetch('/api/status');
      const statusData = await statusResponse.json();
      console.log('Backend status:', statusData);
      
      // Test creating a simple filter
      const testFilter = {
        pathPrefix: 'app.bsky.feed.post',
        keyword: 'the'
      };
      
      const filterResponse = await fetch('/api/filters/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options: testFilter })
      });
      
      const filterData = await filterResponse.json();
      console.log('Test filter created:', filterData);
      
      alert(`Backend connection test:\n✅ Status: ${statusData.data?.status}\n✅ Filter created: ${filterData.filterKey}\n\nCheck console for details.`);
      
    } catch (error) {
      console.error('Connection test failed:', error);
      alert(`Backend connection test failed: ${error.message}`);
    }
  }, []);

  const createFilter = useCallback(async (filterOptions) => {
    try {
      console.log('Creating filter with options:', filterOptions);
      
      // Try the proxied request first, fallback to direct if needed
      let response;
      try {
        response = await fetch('/api/filters/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ options: filterOptions }),
        });
      } catch (proxyError) {
        console.log('Proxy request failed, trying direct connection:', proxyError);
        response = await fetch(`${backendUrl}/api/filters/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ options: filterOptions }),
        });
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Filter created successfully:', data);
      return data.filterKey;
    } catch (error) {
      console.error('Error creating filter:', error);
      alert(`Failed to create filter: ${error.message}\n\nPlease check:\n1. Backend server is running on localhost:8080\n2. Check browser console for more details`);
      throw error;
    }
  }, []);

  const handleApplyFilter = useCallback(async (newFilter) => {
    try {
      // Only create a new filter if the options have actually changed
      const hasChanges = Object.keys(newFilter).some(
        key => newFilter[key] !== currentFilter[key]
      );

      if (!hasChanges && filterKey) {
        return; // No changes, keep current connection
      }

      setCurrentFilter(newFilter);
      
      // Check if all filter fields are empty
      const hasAnyFilter = Object.values(newFilter).some(value => value.trim() !== '');
      
      if (!hasAnyFilter) {
        setFilterKey(''); // This will disconnect the WebSocket
        return;
      }

      // Create filter object with only non-empty values
      const filterOptions = {};
      Object.keys(newFilter).forEach(key => {
        if (newFilter[key].trim() !== '') {
          filterOptions[key] = newFilter[key].trim();
        }
      });

      const newFilterKey = await createFilter(filterOptions);
      setFilterKey(newFilterKey);
    } catch (error) {
      console.error('Failed to apply filter:', error);
      alert(`Failed to create filter: ${error.message}\n\nPlease check:\n1. Backend server is running on localhost:8080\n2. Check browser console for more details`);
    }
  }, [currentFilter, filterKey, createFilter]);

  const handleClearFilter = useCallback(() => {
    setFilterKey('');
    setCurrentFilter({
      repository: '',
      pathPrefix: '',
      keyword: ''
    });
    clearEvents();
  }, [clearEvents]);

  return (
    <div className="app">
      <header className="header">
        <h1>AT Protocol Filter UI</h1>
        <p className="subtitle">Real-time filtered event streaming from the AT Protocol firehose</p>
        <p className="debug-note" style={{fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem'}}>
          💡 Open browser console (F12) to see connection logs
        </p>
      </header>

      <div className="main-content">
        <div className="filter-section">
          <FilterForm
            onApplyFilter={handleApplyFilter}
            onClearFilter={handleClearFilter}
            initialValues={currentFilter}
          />
          
          <ConnectionStatus
            status={connectionStatus}
            filterKey={filterKey}
            onTestConnection={testConnection}
            onTestDirect={testConnectionDirect}
          />
        </div>

        <div className="stream-section">
          <EventStream
            events={events}
            eventCount={eventCount}
            isPaused={isPaused}
            onClearEvents={clearEvents}
            onTogglePause={togglePause}
            connectionStatus={connectionStatus}
          />
        </div>
      </div>
    </div>
  );
}

export default App;