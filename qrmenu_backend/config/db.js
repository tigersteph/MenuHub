const { Pool } = require('pg');
require('dotenv').config();

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
  allowExitOnIdle: false,
  // Forcer IPv4 pour éviter les problèmes de connexion IPv6 sur Render
  // family: 4 force l'utilisation d'IPv4 uniquement
  ...(process.env.NODE_ENV === 'production' && { family: 4 })
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