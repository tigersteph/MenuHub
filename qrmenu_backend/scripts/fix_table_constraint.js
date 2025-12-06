const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Script pour vérifier et corriger la contrainte ON DELETE SET NULL
 * pour orders.table_id référençant tables.id
 */
async function fixTableConstraint() {
  const client = await db.getClient();
  
  try {
    console.log('\n🔧 VÉRIFICATION ET CORRECTION DE LA CONTRAINTE\n');
    console.log('='.repeat(60));
    
    await client.query('BEGIN');
    
    // 1. Vérifier si la contrainte existe
    const constraintCheck = await client.query(
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
         AND tc.constraint_type = 'FOREIGN KEY'`
    );
    
    if (constraintCheck.rows.length > 0) {
      const constraint = constraintCheck.rows[0];
      console.log(`\n✅ Contrainte trouvée: ${constraint.constraint_name}`);
      console.log(`   Table: ${constraint.table_name}.${constraint.column_name}`);
      console.log(`   Référence: ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
      console.log(`   ON DELETE: ${constraint.delete_rule || 'N/A'}`);
      
      if (constraint.delete_rule === 'SET NULL') {
        console.log('\n✅ La contrainte est correctement configurée avec ON DELETE SET NULL');
        await client.query('COMMIT');
        return;
      } else {
        console.log(`\n⚠️  La contrainte existe mais avec ON DELETE: ${constraint.delete_rule}`);
        console.log('   Suppression de l\'ancienne contrainte...');
        
        // Supprimer l'ancienne contrainte
        await client.query(
          `ALTER TABLE orders DROP CONSTRAINT IF EXISTS ${constraint.constraint_name}`
        );
        console.log('   ✅ Ancienne contrainte supprimée');
      }
    } else {
      console.log('\n⚠️  Aucune contrainte trouvée pour orders.table_id');
    }
    
    // 2. Vérifier si la colonne table_id existe
    console.log('\n🔍 Vérification de l\'existence de la colonne table_id...');
    
    const columnCheck = await client.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'orders' AND column_name = 'table_id'`
    );
    
    if (columnCheck.rows.length === 0) {
      console.log('   ⚠️  La colonne table_id n\'existe pas dans la table orders');
      console.log('   🔧 Ajout de la colonne table_id...');
      
      // Ajouter la colonne table_id (sans contrainte d'abord)
      await client.query(
        `ALTER TABLE orders 
         ADD COLUMN IF NOT EXISTS table_id UUID`
      );
      
      console.log('   ✅ Colonne table_id ajoutée');
      
      // Créer un index pour améliorer les performances
      try {
        await client.query(
          `CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id)`
        );
        console.log('   ✅ Index créé sur table_id');
      } catch (idxError) {
        console.log('   ⚠️  Index déjà existant ou erreur (non bloquant)');
      }
      
      // Vérifier si table_number existe et migrer les données si nécessaire
      const tableNumberCheck = await client.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'orders' AND column_name = 'table_number'`
      );
      
      if (tableNumberCheck.rows.length > 0) {
        console.log('   📊 Colonne table_number trouvée, vérification de la migration...');
        // Note: La migration de table_number vers table_id nécessite une logique spécifique
        // car table_number est un INTEGER et table_id est un UUID
        // Pour l'instant, on laisse table_id NULL pour les anciennes commandes
        console.log('   ℹ️  Les anciennes commandes avec table_number garderont table_id = NULL');
      }
    } else {
      console.log('   ✅ La colonne table_id existe déjà');
      console.log(`      Type: ${columnCheck.rows[0].data_type}`);
    }
    
    // 3. Créer la contrainte avec ON DELETE SET NULL
    console.log('\n🔧 Création de la contrainte avec ON DELETE SET NULL...');
    
    try {
      await client.query(
        `ALTER TABLE orders 
         ADD CONSTRAINT orders_table_id_fkey 
         FOREIGN KEY (table_id) 
         REFERENCES tables(id) 
         ON DELETE SET NULL`
      );
      console.log('   ✅ Contrainte créée avec succès');
    } catch (constraintError) {
      // Si la contrainte existe déjà, c'est OK
      if (constraintError.code === '42P07' || constraintError.message.includes('already exists')) {
        console.log('   ℹ️  La contrainte existe déjà, vérification...');
        
        // Vérifier que la contrainte existante a bien ON DELETE SET NULL
        const existingConstraint = await client.query(
          `SELECT 
            tc.constraint_name, 
            rc.delete_rule
           FROM information_schema.table_constraints AS tc
           JOIN information_schema.referential_constraints AS rc
             ON tc.constraint_name = rc.constraint_name
           WHERE tc.table_name = 'orders'
             AND tc.constraint_name = 'orders_table_id_fkey'`
        );
        
        if (existingConstraint.rows.length > 0) {
          const deleteRule = existingConstraint.rows[0].delete_rule;
          if (deleteRule === 'SET NULL') {
            console.log('   ✅ La contrainte existante a déjà ON DELETE SET NULL');
          } else {
            console.log(`   ⚠️  La contrainte existante a ON DELETE = ${deleteRule}`);
            console.log('   🔧 Suppression de l\'ancienne contrainte...');
            await client.query(
              `ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_table_id_fkey`
            );
            // Recréer avec ON DELETE SET NULL
            await client.query(
              `ALTER TABLE orders 
               ADD CONSTRAINT orders_table_id_fkey 
               FOREIGN KEY (table_id) 
               REFERENCES tables(id) 
               ON DELETE SET NULL`
            );
            console.log('   ✅ Contrainte recréée avec ON DELETE SET NULL');
          }
        }
      } else {
        throw constraintError;
      }
    }
    
    // 4. Vérifier que la contrainte est bien créée
    const verifyCheck = await client.query(
      `SELECT 
        tc.constraint_name, 
        rc.delete_rule
       FROM information_schema.table_constraints AS tc
       JOIN information_schema.referential_constraints AS rc
         ON tc.constraint_name = rc.constraint_name
       WHERE tc.table_name = 'orders'
         AND tc.constraint_name = 'orders_table_id_fkey'
         AND rc.delete_rule = 'SET NULL'`
    );
    
    if (verifyCheck.rows.length > 0) {
      console.log('\n✅ Vérification réussie: La contrainte est correctement configurée');
      await client.query('COMMIT');
      console.log('\n✅ Correction terminée avec succès\n');
    } else {
      throw new Error('La contrainte n\'a pas été correctement créée');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Erreur lors de la correction:', error.message);
    logger.error('Erreur lors de la correction de la contrainte', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  fixTableConstraint()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { fixTableConstraint };
