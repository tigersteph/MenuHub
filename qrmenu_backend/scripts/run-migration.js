/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runSqlFile(filePath) {
  const abs = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Migration introuvable: ${abs}`);
  }
  const sql = fs.readFileSync(abs, 'utf8');
  console.log(`\n=== Exécution migration: ${filePath} ===`);
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`✔ Migration OK: ${filePath}`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(`✖ Erreur migration ${filePath}:`, e.message);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('Usage: node scripts/run-migration.js <path/to.sql> [more.sql ...]');
    process.exit(1);
  }
  for (const f of files) {
    // les chemins sont relatifs à qrmenu_backend/
    await runSqlFile(f);
  }
  // Fermer le pool proprement
  setTimeout(() => process.exit(process.exitCode || 0), 50);
}

main();


