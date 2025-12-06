const db = require('../config/db');
require('dotenv').config();

/**
 * Script pour vérifier la structure réelle de la table orders
 */
async function checkOrdersSchema() {
  const client = await db.getClient();
  
  try {
    console.log('\n🔍 VÉRIFICATION DU SCHÉMA DE LA TABLE ORDERS\n');
    console.log('='.repeat(60));
    
    // 1. Vérifier les colonnes de la table orders
    const columnsResult = await client.query(
      `SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
       FROM information_schema.columns 
       WHERE table_name = 'orders' 
       ORDER BY ordinal_position`
    );
    
    console.log('\n📋 Colonnes de la table "orders":');
    if (columnsResult.rows.length === 0) {
      console.log('   ❌ Table "orders" non trouvée');
      return;
    }
    
    columnsResult.rows.forEach((col, idx) => {
      console.log(`   ${idx + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
    });
    
    // 2. Vérifier les contraintes de clé étrangère existantes
    const constraintsResult = await client.query(
      `SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
       FROM information_schema.table_constraints AS tc
       JOIN information_schema.key_column_usage AS kcu
         ON tc.constraint_name = kcu.constraint_name
       JOIN information_schema.constraint_column_usage AS ccu
         ON ccu.constraint_name = tc.constraint_name
       LEFT JOIN information_schema.referential_constraints AS rc
         ON rc.constraint_name = tc.constraint_name
       WHERE tc.table_name = 'orders' 
         AND tc.constraint_type = 'FOREIGN KEY'`
    );
    
    console.log('\n🔗 Contraintes de clé étrangère sur "orders":');
    if (constraintsResult.rows.length === 0) {
      console.log('   ⚠️  Aucune contrainte de clé étrangère trouvée');
    } else {
      constraintsResult.rows.forEach((constraint, idx) => {
        console.log(`   ${idx + 1}. ${constraint.constraint_name}`);
        console.log(`      Colonne: ${constraint.column_name}`);
        console.log(`      Référence: ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
        console.log(`      ON DELETE: ${constraint.delete_rule || 'N/A'}`);
      });
    }
    
    // 3. Vérifier si table_id existe ou si c'est table_number
    const hasTableId = columnsResult.rows.some(col => col.column_name === 'table_id');
    const hasTableNumber = columnsResult.rows.some(col => col.column_name === 'table_number');
    
    console.log('\n📊 Analyse:');
    console.log(`   Colonne "table_id" existe: ${hasTableId ? '✅ Oui' : '❌ Non'}`);
    console.log(`   Colonne "table_number" existe: ${hasTableNumber ? '✅ Oui' : '❌ Non'}`);
    
    if (!hasTableId && hasTableNumber) {
      console.log('\n⚠️  ATTENTION: La colonne s\'appelle "table_number" et non "table_id"');
      console.log('   Il faudra peut-être migrer vers "table_id" ou adapter le code.');
    }
    
    // 4. Vérifier quelques exemples de données
    const sampleResult = await client.query(
      `SELECT * FROM orders LIMIT 5`
    );
    
    if (sampleResult.rows.length > 0) {
      console.log('\n📦 Exemples de données (5 premières commandes):');
      sampleResult.rows.forEach((order, idx) => {
        console.log(`   ${idx + 1}. Commande ${order.id?.substring(0, 8) || 'N/A'}...`);
        if (order.table_id) {
          console.log(`      table_id: ${order.table_id}`);
        }
        if (order.table_number) {
          console.log(`      table_number: ${order.table_number}`);
        }
      });
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('\n✅ Vérification terminée\n');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } finally {
    if (client && typeof client.release === 'function') {
      client.release();
    }
  }
}

if (require.main === module) {
  checkOrdersSchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { checkOrdersSchema };
