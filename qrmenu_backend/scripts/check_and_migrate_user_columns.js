/**
 * Script pour vérifier et ajouter les colonnes first_name, last_name, restaurant_name
 * à la table users si elles n'existent pas
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'qrmenu',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

async function checkAndAddColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Vérification des colonnes dans la table users...');
    
    // Vérifier quelles colonnes existent
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('first_name', 'last_name', 'restaurant_name')
    `);
    
    const existingColumns = checkColumns.rows.map(row => row.column_name);
    console.log('Colonnes existantes:', existingColumns);
    
    const columnsToAdd = [];
    if (!existingColumns.includes('first_name')) {
      columnsToAdd.push('first_name VARCHAR(50)');
    }
    if (!existingColumns.includes('last_name')) {
      columnsToAdd.push('last_name VARCHAR(50)');
    }
    if (!existingColumns.includes('restaurant_name')) {
      columnsToAdd.push('restaurant_name VARCHAR(100)');
    }
    
    if (columnsToAdd.length === 0) {
      console.log('✅ Toutes les colonnes nécessaires existent déjà.');
      return;
    }
    
    console.log(`📝 Ajout de ${columnsToAdd.length} colonne(s)...`);
    
    // Ajouter les colonnes manquantes
    for (const columnDef of columnsToAdd) {
      const columnName = columnDef.split(' ')[0];
      console.log(`   Ajout de la colonne ${columnName}...`);
      
      await client.query(`ALTER TABLE users ADD COLUMN ${columnDef}`);
      
      // Mettre à jour les valeurs NULL avec des chaînes vides
      await client.query(`UPDATE users SET ${columnName} = '' WHERE ${columnName} IS NULL`);
      
      // Ajouter la contrainte NOT NULL
      await client.query(`ALTER TABLE users ALTER COLUMN ${columnName} SET NOT NULL`);
      
      console.log(`   ✅ Colonne ${columnName} ajoutée avec succès.`);
    }
    
    console.log('✅ Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter la migration
checkAndAddColumns()
  .then(() => {
    console.log('✅ Script terminé.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });

