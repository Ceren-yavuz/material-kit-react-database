const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 4000; // Gateway port

// Enable CORS for all origins
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'http://localhost:3000',
      postgresql: 'http://localhost:3001'
    }
  });
});

// MongoDB backend proxy
app.use('/api/mongodb', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/mongodb': '', // remove /api/mongodb from the request
  },
  onError: (err, req, res) => {
    console.error('MongoDB proxy error:', err.message);
    res.status(503).json({ 
      error: 'MongoDB backend unavailable',
      message: err.message 
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying to MongoDB: ${req.method} ${req.url}`);
  }
}));

// PostgreSQL backend proxy
app.use('/api/postgresql', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/postgresql': '', // remove /api/postgresql from the request
  },
  onError: (err, req, res) => {
    console.error('PostgreSQL proxy error:', err.message);
    res.status(503).json({ 
      error: 'PostgreSQL backend unavailable',
      message: err.message 
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying to PostgreSQL: ${req.method} ${req.url}`);
  }
}));

// Fallback for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      '/health',
      '/api/mongodb/*',
      '/api/postgresql/*'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Proxying:`);
  console.log(`   • MongoDB:    /api/mongodb/* -> http://localhost:3000`);
  console.log(`   • PostgreSQL: /api/postgresql/* -> http://localhost:3001`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});