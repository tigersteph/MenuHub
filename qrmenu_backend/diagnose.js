require('dotenv').config();

console.log('=== Diagnostic du Serveur Backend ===\n');

// Vérifier les variables d'environnement
console.log('Variables d\'environnement:');
console.log('  PORT:', process.env.PORT || '8000 (défaut)');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'non défini');
console.log('  DB_HOST:', process.env.DB_HOST || 'non défini');
console.log('  DB_PORT:', process.env.DB_PORT || 'non défini');
console.log('  DB_NAME:', process.env.DB_NAME || 'non défini');
console.log('  DB_USER:', process.env.DB_USER || 'non défini');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'non défini');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'non défini');
console.log('');

// Vérifier la connexion à la base de données
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 5000
});

console.log('Test de connexion à la base de données...');
pool.query('SELECT NOW()')
  .then(result => {
    console.log('✅ Connexion à la base de données réussie');
    console.log('  Heure serveur:', result.rows[0].now);
    pool.end();
    
    // Essayer de démarrer le serveur
    console.log('\nDémarrage du serveur...');
    require('./app.js');
    
    // Attendre un peu pour voir si le serveur démarre
    setTimeout(() => {
      console.log('\n✅ Le serveur devrait être démarré maintenant');
      console.log('   Vérifiez avec: netstat -ano | findstr :8000');
      process.exit(0);
    }, 2000);
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données:');
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
    console.error('\nVérifiez:');
    console.error('  1. PostgreSQL est démarré');
    console.error('  2. Les credentials dans .env sont corrects');
    console.error('  3. La base de données existe: psql -U postgres -d qrmenu');
    pool.end();
    process.exit(1);
  });


