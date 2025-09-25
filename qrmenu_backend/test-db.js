const db = require('./models');

async function testConnection() {
  try {
    const res = await db.query('SELECT $1::text as message', ['Connexion à la base de données réussie !']);
    console.log(res.rows[0].message);
    process.exit(0);
  } catch (err) {
    console.error('Erreur de connexion à la base de données :', err);
    process.exit(1);
  }
}

testConnection();