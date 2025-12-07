const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Forcer la résolution DNS en IPv4 en production
if (process.env.NODE_ENV === 'production') {
  const originalLookup = dns.lookup;
  dns.lookup = function(hostname, options, callback) {
    // Forcer IPv4
    if (typeof options === 'function') {
      callback = options;
      options = { family: 4 };
    } else if (typeof options === 'object') {
      options = { ...options, family: 4 };
    } else {
      options = { family: 4 };
    }
    return originalLookup.call(this, hostname, options, callback);
  };
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000', 10),
  allowExitOnIdle: false
});

pool.on('error', (err) => {
  const logger = require('../utils/logger');
  logger.error('Unexpected error on idle client', { error: err.message, stack: err.stack });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    return client;
  },
  pool
};