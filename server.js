const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Simple router function
function router(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route handling
  try {
    switch (path) {
      case '/':
        handleHome(req, res);
        break;
      case '/api/health':
        handleHealth(req, res);
        break;
      case '/api/time':
        handleTime(req, res);
        break;
      case '/api/echo':
        handleEcho(req, res);
        break;
      default:
        handle404(req, res);
    }
  } catch (error) {
    handleError(error, req, res);
  }
}

// Route handlers
function handleHome(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Simple HTTP Server</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>🚀 Simple Node.js HTTP Server</h1>
        <p>Server is running on port ${PORT}</p>
        
        <h2>Available Endpoints:</h2>
        <div class="endpoint"><strong>GET /</strong> - This homepage</div>
        <div class="endpoint"><strong>GET /api/health</strong> - Health check</div>
        <div class="endpoint"><strong>GET /api/time</strong> - Current server time</div>
        <div class="endpoint"><strong>POST/GET /api/echo</strong> - Echo request data</div>
    </body>
    </html>
  `);
}

function handleHealth(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  }, null, 2));
}

function handleTime(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    currentTime: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }, null, 2));
}

function handleEcho(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const response = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: body || null,
      timestamp: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
  });
}

function handle404(req, res) {
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not Found',
    message: `The endpoint ${req.url} was not found`,
    availableEndpoints: ['/', '/api/health', '/api/time', '/api/echo']
  }, null, 2));
}

function handleError(error, req, res) {
  console.error('Server error:', error);
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  }, null, 2));
}

// Create and start server
const server = http.createServer(router);

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log(`📊 Process ID: ${process.pid}`);
  console.log(`🔧 Node version: ${process.version}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});