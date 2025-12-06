/**
 * Script pour vérifier et ajouter la colonne role à la table users
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'qrmenu',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

async function checkAndAddRoleColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Vérification de la colonne role dans la table users...');
    
    // Vérifier si la colonne existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ La colonne role existe déjà.');
      return;
    }
    
    console.log('📝 Ajout de la colonne role...');
    
    // Ajouter la colonne
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN role VARCHAR(20) DEFAULT 'user'
    `);
    
    // Mettre à jour les valeurs NULL
    await client.query(`
      UPDATE users 
      SET role = 'user' 
      WHERE role IS NULL
    `);
    
    console.log('✅ Colonne role ajoutée avec succès.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter la migration
checkAndAddRoleColumn()
  .then(() => {
    console.log('✅ Script terminé.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });

