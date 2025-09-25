const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Configure le timeout pour éviter les fuites de connexion
    const timeout = setTimeout(() => {
      console.error('Un client est resté connecté trop longtemps !');
    }, 5000);
    
    client.release = () => {
      clearTimeout(timeout);
      client.release = release;
      return release.apply(client);
    };
    
    return client;
  }
};