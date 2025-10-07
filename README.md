# AT Protocol Filter UI

A modern React-based Single Page Application (SPA) for real-time filtering and visualization of AT Protocol events from the firehose.

## Features

- **Real-time Event Streaming**: WebSocket connection to the AT Protocol backend for live event updates
- **Dynamic Filtering**: Filter by repository DID, path prefix, and keywords
- **Smart Reconnection**: Automatic WebSocket reconnection with exponential backoff
- **Responsive Design**: Modern, mobile-friendly interface
- **Event Details**: Expandable event items with full metadata and timing information
- **Stream Controls**: Pause/resume streaming and clear event log
- **Connection Status**: Visual indicator of WebSocket connection state

## Prerequisites

- Node.js 14 or later
- The AT Protocol backend server (for local development: `localhost:8080`)

## Installation

```bash
# Clone and navigate to the project directory
cd AT_Proto_Filter_UI

# Install dependencies
npm install
```

## Environment Variables

The application uses environment variables for configuration:

- `REACT_APP_BACKEND_URL`: URL of your AT Protocol backend service

For local development, create a `.env` file:

```bash
REACT_APP_BACKEND_URL=http://localhost:8080
```

For production deployment, set this in your hosting platform's environment configuration.

## Usage

### Local Development

### 1. Start the Backend Server

First, ensure your AT Protocol backend server is running on `localhost:8080`. Refer to the `backend.md` file for setup instructions.

### 2. Start the React Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`.

## Deployment

### Netlify Deployment

This project is configured for easy deployment on Netlify:

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository

2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.app)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: `18` (configured in `netlify.toml`)

4. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   - Add: `REACT_APP_BACKEND_URL` = `https://your-backend-url.com`
   - Replace with your actual backend service URL

5. **Deploy**: Click "Deploy site"

The `netlify.toml` file includes:
- Build configuration
- SPA redirect rules
- Caching headers for optimal performance

### Other Hosting Platforms

For other platforms (Vercel, Heroku, etc.):

1. Set the `REACT_APP_BACKEND_URL` environment variable
2. Run `npm run build`
3. Serve the `build` directory
4. Ensure SPA routing is configured (redirect all routes to `index.html`)

### 3. Configure Filters

1. **Repository DID**: Filter events from a specific user/account
2. **Path Prefix**: Filter by operation type (e.g., `app.bsky.feed.post` for posts)
3. **Keyword**: Filter by text content within records (comma-separated list)

### 4. Apply Filters

Click "Apply Filter" to create a new filter and start streaming events. The application will:

- Create a filter via the backend API
- Establish a WebSocket connection
- Display real-time filtered events

## How It Works

### WebSocket Integration

The app uses a custom React hook (`useWebSocket`) that:

- Manages WebSocket connections to `ws://localhost:8080/ws/{filterKey}`
- Handles automatic reconnection with exponential backoff
- Provides connection status updates
- Manages event buffering and display

### Filter Management

When you change filters, the application:

1. Creates a new filter via `POST /api/filters/create`
2. Disconnects from the previous WebSocket
3. Connects to the new WebSocket endpoint
4. Starts streaming filtered events

### Event Display

Events are displayed in a log-style format with:

- **Timestamps**: Formatted for readability
- **Event Types**: Color-coded by operation type
- **Content Preview**: Truncated text content
- **Expandable Details**: Full metadata and timing information

## Components

- **App.js**: Main application component with state management
- **FilterForm.js**: Form component for filter configuration
- **ConnectionStatus.js**: WebSocket connection status indicator
- **EventStream.js**: Event list container with controls
- **EventItem.js**: Individual event display with expand/collapse
- **useWebSocket.js**: Custom hook for WebSocket management

## API Integration

The application integrates with these backend endpoints:

- `POST /api/filters/create`: Create new filters
- `WebSocket /ws/{filterKey}`: Real-time event streaming

## Styling

The application uses modern CSS with:

- **CSS Grid & Flexbox**: Responsive layout
- **CSS Custom Properties**: Consistent theming
- **Smooth Animations**: Hover effects and transitions
- **Mobile-First Design**: Responsive breakpoints

## Development

### Available Scripts

- `npm start`: Start development server
- `npm build`: Create production build
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

### Project Structure

```
src/
├── App.js              # Main application component
├── App.css             # Application styles
├── FilterForm.js       # Filter configuration form
├── ConnectionStatus.js # Connection status indicator
├── EventStream.js      # Event list container
├── EventItem.js        # Individual event component
├── useWebSocket.js     # WebSocket management hook
├── index.js            # React entry point
└── index.css           # Global styles
```

## Troubleshooting

### Backend Connection Issues

If you see connection errors:

1. Ensure the backend server is running on `localhost:8080`
2. Check that the backend is accessible via HTTP and WebSocket
3. Verify no firewall is blocking the connections

### WebSocket Reconnection

The app automatically attempts to reconnect up to 5 times with exponential backoff. If reconnection fails:

1. Check the backend server status
2. Clear filters and try again
3. Refresh the browser page

### Performance

The app limits event history to 100 events to prevent memory issues. Use the "Clear Log" button to reset the event list.

## Customization

### Backend URL Configuration

The backend URL is configured via the `REACT_APP_BACKEND_URL` environment variable:

- **Local Development**: Set in `.env` file or defaults to `http://localhost:8080`
- **Production**: Set in your hosting platform's environment variables

### Event Display

Modify `EventItem.js` to customize how events are displayed:

- Change color coding in `getEventTypeColor()`
- Modify content extraction in `extractEventInfo()`
- Update the expandable details layout

### Styling

Update `App.css` to customize:

- Color scheme and branding
- Layout and spacing
- Component styling
- Responsive breakpoints

## Production Build

```bash
# Create optimized production build
npm run build

# Serve the build (requires a static file server)
npx serve -s build
```

## License

This project is part of the AT Protocol Filter system and follows the same licensing terms.
