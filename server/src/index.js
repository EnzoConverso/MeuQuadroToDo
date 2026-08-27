const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDB } = require('./db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

async function start() {
  try {
    console.log('[SERVER] Initializing database...');
    await initDB();
    
    app.listen(PORT, () => {
      console.log(`[SERVER] Ready & running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[SERVER FATAL] Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
