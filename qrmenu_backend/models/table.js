// models/table.js
const db = require('../config/db');

const Table = {
  async create({ name, status = 'active', place_id }) {
    const result = await db.query(
      'INSERT INTO tables (name, status, place_id) VALUES ($1, $2, $3) RETURNING *',
      [name, status, place_id]
    );
    return result.rows[0];
  },

  async findByPlace(place_id) {
    const result = await db.query(
      'SELECT * FROM tables WHERE place_id = $1',
      [place_id]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await db.query(
      'SELECT * FROM tables WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async update(id, { name, status }) {
    const result = await db.query(
      'UPDATE tables SET name = $1, status = $2 WHERE id = $3 RETURNING *',
      [name, status, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const logger = require('../utils/logger');
    const client = await db.getClient();
    
    try {
      // Démarrer une transaction
      await client.query('BEGIN');
      
      // Vérifier que la table existe
      const tableResult = await client.query('SELECT * FROM tables WHERE id = $1', [id]);
      if (tableResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new Error('Table non trouvée');
      }

      const table = tableResult.rows[0];
      logger.info('Table found for deletion', { tableId: id, tableName: table.name });

      // Compter les commandes associées avant suppression
      const ordersCheck = await client.query(
        'SELECT COUNT(*) as count FROM orders WHERE table_id = $1',
        [id]
      );
      const ordersCount = parseInt(ordersCheck.rows[0].count, 10) || 0;
      
      logger.info('Orders associated with table', { tableId: id, ordersCount });
      
      // Vérifier que la contrainte ON DELETE SET NULL est bien configurée
      // Si des commandes existent, elles seront automatiquement mises à NULL
      // La contrainte ON DELETE SET NULL dans la base de données gère automatiquement
      // la mise à NULL de table_id dans les commandes. On peut donc supprimer directement.
      
      // Supprimer la table (la contrainte ON DELETE SET NULL gère automatiquement les commandes)
      const deleteResult = await client.query('DELETE FROM tables WHERE id = $1 RETURNING *', [id]);
      
      if (deleteResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new Error('Table non trouvée ou déjà supprimée');
      }
      
      // Vérifier que les commandes ont bien été mises à NULL (si elles existaient)
      // Seulement si la colonne table_id existe
      if (ordersCount > 0) {
        try {
          const nullCheck = await client.query(
            'SELECT COUNT(*) as count FROM orders WHERE table_id = $1',
            [id]
          );
          const remainingOrders = parseInt(nullCheck.rows[0].count, 10) || 0;
          if (remainingOrders > 0) {
            logger.warn('Some orders still reference the table after deletion', { 
              tableId: id, 
              remainingOrders 
            });
          }
        } catch (checkError) {
          // Si la colonne n'existe pas, ignorer cette vérification
          if (checkError.code !== '42703') {
            logger.warn('Error checking remaining orders', { 
              tableId: id, 
              error: checkError.message 
            });
          }
        }
      }
      
      // Commit la transaction
      await client.query('COMMIT');
      
      logger.info('Table deleted successfully', { 
        tableId: id, 
        tableName: table.name,
        ordersAffected: ordersCount 
      });
      
      return { 
        deleted: true, 
        ordersAffected: ordersCount 
      };
    } catch (error) {
      // Rollback en cas d'erreur
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        logger.error('Error during rollback', { 
          tableId: id,
          error: rollbackError.message 
        });
      }
      
      // Logger l'erreur avec tous les détails
      logger.error('Erreur lors de la suppression de la table', {
        tableId: id,
        error: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
        detail: error.detail,
        hint: error.hint
      });
      
      // Si c'est une erreur de colonne inexistante (table_id n'existe pas)
      if (error.code === '42703' || (error.message && error.message.includes('column') && error.message.includes('does not exist'))) {
        logger.warn('Column table_id does not exist in orders table, attempting deletion without constraint check', { tableId: id });
        // Essayer de supprimer sans vérifier les commandes
        try {
          await client.query('ROLLBACK');
          await client.query('BEGIN');
          const deleteResult = await client.query('DELETE FROM tables WHERE id = $1 RETURNING *', [id]);
          if (deleteResult.rows.length === 0) {
            await client.query('ROLLBACK');
            throw new Error('Table non trouvée ou déjà supprimée');
          }
          await client.query('COMMIT');
          logger.info('Table deleted successfully (without table_id constraint)', { tableId: id });
          return { 
            deleted: true, 
            ordersAffected: 0 
          };
        } catch (retryError) {
          await client.query('ROLLBACK');
          throw retryError;
        }
      }
      
      // Si c'est une erreur de contrainte de clé étrangère, donner un message plus clair
      if (error.code === '23503' || 
          (error.message && (error.message.includes('foreign key') || error.message.includes('constraint')))) {
        throw new Error('Impossible de supprimer la table : elle est référencée par d\'autres données. Veuillez d\'abord supprimer ou modifier les commandes associées.');
      }
      
      // Propager l'erreur avec un message plus clair
      const errorMessage = error.message || 'Erreur inconnue lors de la suppression de la table';
      throw new Error(errorMessage);
    } finally {
      // Toujours libérer le client
      if (client && typeof client.release === 'function') {
        try {
          client.release();
        } catch (releaseError) {
          logger.error('Erreur lors de la libération du client', { 
            tableId: id, 
            error: releaseError.message 
          });
        }
      }
    }
  }
};

module.exports = Table;
