const db = require('../config/db');
const logger = require('../utils/logger');

// Configuration de la base de données
require('dotenv').config();

/**
 * Script de diagnostic pour vérifier l'état des tables dans la base de données
 * et identifier les problèmes potentiels de suppression
 */
async function diagnoseTableDeletion() {
  let client;
  
  try {
    console.log('\n🔍 DIAGNOSTIC DE SUPPRESSION DE TABLES\n');
    console.log('='.repeat(60));
    
    client = await db.getClient();
    
    // 1. Trouver l'utilisateur et son restaurant
    const userResult = await client.query(
      `SELECT id, username, email FROM users WHERE email = $1`,
      ['gervaistibe77@gmail.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Utilisateur non trouvé: gervaistibe77@gmail.com');
      console.log('\n💡 Vérification de tous les utilisateurs...');
      const allUsers = await client.query('SELECT id, username, email FROM users LIMIT 10');
      if (allUsers.rows.length > 0) {
        console.log('   Utilisateurs trouvés:');
        allUsers.rows.forEach(u => console.log(`      - ${u.email} (${u.username})`));
      }
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log(`\n✅ Utilisateur trouvé: ${userResult.rows[0].username} (${userResult.rows[0].email})`);
    console.log(`   ID: ${userId}`);
    
    // 2. Trouver le restaurant "demo bistro"
    const placeResult = await client.query(
      `SELECT id, name, user_id FROM places WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
      [userId, 'demo bistro']
    );
    
    if (placeResult.rows.length === 0) {
      console.log('\n❌ Restaurant "demo bistro" non trouvé pour cet utilisateur');
      console.log('\n💡 Vérification des restaurants de cet utilisateur...');
      const userPlaces = await client.query(
        'SELECT id, name FROM places WHERE user_id = $1',
        [userId]
      );
      if (userPlaces.rows.length > 0) {
        console.log('   Restaurants trouvés:');
        userPlaces.rows.forEach(p => console.log(`      - ${p.name} (${p.id})`));
      }
      return;
    }
    
    const placeId = placeResult.rows[0].id;
    console.log(`\n✅ Restaurant trouvé: ${placeResult.rows[0].name}`);
    console.log(`   ID: ${placeId}`);
    
    // 3. Trouver toutes les tables de ce restaurant
    const allTablesResult = await client.query(
      `SELECT id, name, status, place_id, created_at 
       FROM tables 
       WHERE place_id = $1
       ORDER BY name`,
      [placeId]
    );
    
    console.log(`\n📊 Toutes les tables du restaurant: ${allTablesResult.rows.length}`);
    if (allTablesResult.rows.length > 0) {
      allTablesResult.rows.forEach((t, idx) => {
        console.log(`   ${idx + 1}. "${t.name}" (${t.id.substring(0, 8)}...) - ${t.status}`);
      });
    }
    
    // 4. Trouver spécifiquement les tables "table 1" et "table 01"
    const tablesResult = await client.query(
      `SELECT id, name, status, place_id, created_at 
       FROM tables 
       WHERE place_id = $1 AND (LOWER(TRIM(name)) = LOWER($2) OR LOWER(TRIM(name)) = LOWER($3))
       ORDER BY name`,
      [placeId, 'table 1', 'table 01']
    );
    
    console.log(`\n📋 Tables spécifiques trouvées: ${tablesResult.rows.length}`);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ Aucune table "table 1" ou "table 01" trouvée');
      console.log('\n💡 Recherche avec des variations...');
      const variationsResult = await client.query(
        `SELECT id, name, status 
         FROM tables 
         WHERE place_id = $1 AND (
           name ILIKE '%table%1%' OR 
           name ILIKE '%table%01%'
         )
         ORDER BY name`,
        [placeId]
      );
      if (variationsResult.rows.length > 0) {
        console.log('   Tables similaires trouvées:');
        variationsResult.rows.forEach(t => {
          console.log(`      - "${t.name}" (${t.id.substring(0, 8)}...) - ${t.status}`);
        });
      }
      return;
    }
    
    // 4. Pour chaque table, vérifier les contraintes et les commandes associées
    for (const table of tablesResult.rows) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`\n📋 Table: "${table.name}"`);
      console.log(`   ID: ${table.id}`);
      console.log(`   Status: ${table.status}`);
      console.log(`   Créée le: ${table.created_at}`);
      
      // Vérifier les commandes associées
      const ordersResult = await client.query(
        `SELECT id, status, total_amount, created_at, table_id 
         FROM orders 
         WHERE table_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [table.id]
      );
      
      console.log(`\n   📦 Commandes associées: ${ordersResult.rows.length}`);
      if (ordersResult.rows.length > 0) {
        console.log('   Détails des commandes:');
        ordersResult.rows.forEach((order, idx) => {
          console.log(`      ${idx + 1}. Commande ${order.id.substring(0, 8)}... - ${order.status} - ${order.total_amount} FCFA - ${order.created_at}`);
        });
      }
      
      // Vérifier les contraintes de clé étrangère
      const constraintResult = await client.query(
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
           AND kcu.column_name = 'table_id'
           AND tc.constraint_type = 'FOREIGN KEY'`,
        []
      );
      
      console.log(`\n   🔗 Contraintes de clé étrangère:`);
      if (constraintResult.rows.length > 0) {
        constraintResult.rows.forEach(constraint => {
          console.log(`      - ${constraint.constraint_name}`);
          console.log(`        Table: ${constraint.table_name}.${constraint.column_name}`);
          console.log(`        Référence: ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
          console.log(`        ON DELETE: ${constraint.delete_rule || 'N/A'}`);
        });
      } else {
        console.log('      ⚠️  Aucune contrainte trouvée (problème potentiel)');
      }
      
      // Tester la suppression (simulation)
      console.log(`\n   🧪 Test de suppression (simulation)...`);
      try {
        // Vérifier si la table peut être supprimée
        const hasCorrectConstraint = constraintResult.rows.length > 0 && 
          constraintResult.rows[0].delete_rule === 'SET NULL';
        const canDelete = ordersResult.rows.length === 0 || hasCorrectConstraint;
        
        if (canDelete) {
          if (ordersResult.rows.length > 0) {
            console.log(`      ✅ La table peut être supprimée`);
            console.log(`         ${ordersResult.rows.length} commande(s) seront automatiquement mises à NULL`);
            console.log(`         (Contrainte ON DELETE SET NULL active)`);
          } else {
            console.log(`      ✅ La table peut être supprimée (aucune commande associée)`);
          }
        } else {
          console.log(`      ❌ PROBLÈME DÉTECTÉ: La table ne peut pas être supprimée`);
          console.log(`         Raison: ${ordersResult.rows.length} commande(s) associée(s)`);
          if (constraintResult.rows.length === 0) {
            console.log(`         ⚠️  Aucune contrainte ON DELETE SET NULL trouvée`);
            console.log(`         💡 Solution: Exécuter "npm run fix:table-constraint"`);
          } else if (constraintResult.rows[0].delete_rule !== 'SET NULL') {
            console.log(`         ⚠️  Contrainte incorrecte: ON DELETE = ${constraintResult.rows[0].delete_rule}`);
            console.log(`         💡 Solution: Exécuter "npm run fix:table-constraint"`);
          }
        }
      } catch (err) {
        console.log(`      ❌ Erreur lors du test: ${err.message}`);
      }
    }
    
    // 5. Vérifier les permissions et les verrous
    console.log(`\n${'='.repeat(60)}`);
    console.log('\n🔐 Vérification des permissions...');
    
    const permissionsResult = await client.query(
      `SELECT 
        grantee, privilege_type 
      FROM information_schema.role_table_grants 
      WHERE table_name = 'tables' 
      ORDER BY grantee, privilege_type`,
      []
    );
    
    if (permissionsResult.rows.length > 0) {
      console.log('   Permissions sur la table "tables":');
      permissionsResult.rows.forEach(perm => {
        console.log(`      - ${perm.grantee}: ${perm.privilege_type}`);
      });
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('\n✅ Diagnostic terminé\n');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du diagnostic:', error);
    if (error.message) {
      console.error('   Message:', error.message);
    }
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    if (logger) {
      logger.error('Erreur diagnostic suppression table', {
        error: error.message,
        stack: error.stack
      });
    }
  } finally {
    if (client && typeof client.release === 'function') {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Erreur lors de la libération du client:', releaseError.message);
      }
    }
  }
}

if (require.main === module) {
  diagnoseTableDeletion()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { diagnoseTableDeletion };
