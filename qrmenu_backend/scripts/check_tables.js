const db = require('../config/db');
require('dotenv').config();

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables dans la base de données...\n');
    
    // Récupérer l'utilisateur
    const userResult = await db.query(
      'SELECT id, email, username FROM users WHERE email = $1',
      ['gervaistibe77@gmail.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Utilisateur trouvé: ${userResult.rows[0].email} (ID: ${userId})\n`);
    
    // Récupérer le restaurant
    const placeResult = await db.query(
      'SELECT id, name, user_id FROM places WHERE name = $1 AND user_id = $2',
      ['demo bistro', userId]
    );
    
    if (placeResult.rows.length === 0) {
      console.log('❌ Restaurant "demo bistro" non trouvé pour cet utilisateur');
      return;
    }
    
    const placeId = placeResult.rows[0].id;
    console.log(`✅ Restaurant trouvé: ${placeResult.rows[0].name} (ID: ${placeId})\n`);
    
    // Récupérer toutes les tables du restaurant
    const tablesResult = await db.query(
      'SELECT id, name, status, created_at FROM tables WHERE place_id = $1 ORDER BY name',
      [placeId]
    );
    
    console.log(`📊 Tables trouvées: ${tablesResult.rows.length}\n`);
    
    for (const table of tablesResult.rows) {
      console.log(`  - ${table.name} (ID: ${table.id}, Status: ${table.status})`);
      
      // Vérifier les commandes associées
      const ordersResult = await db.query(
        'SELECT COUNT(*) as count, COUNT(CASE WHEN table_id IS NOT NULL THEN 1 END) as with_table_id FROM orders WHERE place_id = $1 AND (table_id = $2 OR table_id IS NULL)',
        [placeId, table.id]
      );
      
      const ordersCount = parseInt(ordersResult.rows[0].count, 10) || 0;
      const ordersWithTableId = parseInt(ordersResult.rows[0].with_table_id, 10) || 0;
      
      // Vérifier spécifiquement les commandes avec cette table_id
      const specificOrdersResult = await db.query(
        'SELECT id, status, total_amount, created_at FROM orders WHERE table_id = $1',
        [table.id]
      );
      
      console.log(`    └─ Commandes associées: ${specificOrdersResult.rows.length} (total: ${ordersCount})`);
      
      if (specificOrdersResult.rows.length > 0) {
        console.log(`    └─ Détails des commandes:`);
        specificOrdersResult.rows.forEach(order => {
          console.log(`       • Commande ${order.id.substring(0, 8)}... (${order.status}, ${order.total_amount} FCFA)`);
        });
      }
      
      // Vérifier les contraintes de clé étrangère
      const constraintsResult = await db.query(`
        SELECT 
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
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'tables'
          AND ccu.column_name = 'id'
      `);
      
      if (constraintsResult.rows.length > 0) {
        console.log(`    └─ Contraintes FK trouvées:`);
        constraintsResult.rows.forEach(constraint => {
          console.log(`       • ${constraint.table_name}.${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name} (ON DELETE: ${constraint.delete_rule})`);
        });
      }
      
      console.log('');
    }
    
    // Vérifier spécifiquement "table 1" et "table 01"
    const specificTables = tablesResult.rows.filter(t => 
      t.name.toLowerCase() === 'table 1' || 
      t.name.toLowerCase() === 'table 01' ||
      t.name === 'table 1' ||
      t.name === 'table 01'
    );
    
    if (specificTables.length > 0) {
      console.log('🎯 Tables spécifiques trouvées:\n');
      for (const table of specificTables) {
        console.log(`  📋 ${table.name} (ID: ${table.id})`);
        
        // Tenter une simulation de suppression (sans vraiment supprimer)
        try {
          const testQuery = await db.query(
            'SELECT COUNT(*) as count FROM orders WHERE table_id = $1',
            [table.id]
          );
          const ordersCount = parseInt(testQuery.rows[0].count, 10) || 0;
          console.log(`    └─ Commandes avec table_id: ${ordersCount}`);
          
          if (ordersCount > 0) {
            const ordersDetails = await db.query(
              'SELECT id, status, total_amount FROM orders WHERE table_id = $1 LIMIT 5',
              [table.id]
            );
            console.log(`    └─ Détails (max 5):`);
            ordersDetails.rows.forEach(order => {
              console.log(`       • ${order.id.substring(0, 8)}... (${order.status})`);
            });
          }
        } catch (err) {
          console.log(`    └─ ❌ Erreur lors de la vérification: ${err.message}`);
        }
        console.log('');
      }
    }
    
    console.log('✅ Vérification terminée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkTables();
