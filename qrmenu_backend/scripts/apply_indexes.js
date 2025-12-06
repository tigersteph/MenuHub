const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function applyIndexes() {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const sqlFile = path.join(__dirname, '../db_migrations/create_indexes.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        return s.length > 0 && 
               !s.startsWith('--') && 
               !s.startsWith('SELECT') &&
               !s.startsWith('\\c');
      });
    
    for (const statement of statements) {
      if (statement) {
        try {
          await client.query(statement);
          console.log(`✓ Index créé: ${statement.substring(0, 60)}...`);
        } catch (err) {
          if (err.code === '42P07') {
            console.log(`⊘ Index déjà existant: ${statement.substring(0, 60)}...`);
          } else {
            console.error(`✗ Erreur: ${err.message}`);
            throw err;
          }
        }
      }
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Tous les index ont été appliqués avec succès');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de l\'application des index:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  applyIndexes()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { applyIndexes };
