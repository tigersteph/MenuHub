const db = require('../config/db');

class Place {
  // Créer un nouvel établissement
  static async create({ name, description, address, phone, userId, color, logo_url, font }) {
    const query = `
      INSERT INTO places (name, description, address, phone, user_id, logo_url, color, font)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`;
    const values = [name, description, address, phone, userId, logo_url || null, color || null, font || null];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  // Trouver un établissement par ID
  static async findById(id) {
    const { rows } = await db.query('SELECT * FROM places WHERE id = $1', [id]);
    return rows[0];
  }

  // Trouver tous les établissements d'un utilisateur
  static async findByUserId(userId) {
    const { rows } = await db.query(
      'SELECT * FROM places WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  // Mettre à jour un établissement
  static async update(id, { name, description, address, phone, color, logo_url, font, number_of_tables }) {
    // Construire dynamiquement la requête selon les champs fournis
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(address);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      values.push(color);
    }
    if (logo_url !== undefined) {
      updates.push(`logo_url = $${paramIndex++}`);
      values.push(logo_url);
    }
    if (font !== undefined) {
      updates.push(`font = $${paramIndex++}`);
      values.push(font);
    }
    if (number_of_tables !== undefined) {
      updates.push(`number_of_tables = $${paramIndex++}`);
      values.push(number_of_tables);
    }

    if (updates.length === 0) {
      // Si aucun champ à mettre à jour, retourner l'établissement tel quel
      return await this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE places 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *`;
    
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  // Obtenir les statistiques de suppression (éléments qui seront supprimés en cascade)
  static async getDeletionStats(id) {
    const stats = {};
    
    // Compter les tables
    const tablesResult = await db.query('SELECT COUNT(*) as count FROM tables WHERE place_id = $1', [id]);
    stats.tablesCount = parseInt(tablesResult.rows[0].count);
    
    // Compter les catégories
    const categoriesResult = await db.query('SELECT COUNT(*) as count FROM categories WHERE place_id = $1', [id]);
    stats.categoriesCount = parseInt(categoriesResult.rows[0].count);
    
    // Compter les éléments de menu
    const menuItemsResult = await db.query('SELECT COUNT(*) as count FROM menu_items WHERE place_id = $1', [id]);
    stats.menuItemsCount = parseInt(menuItemsResult.rows[0].count);
    
    // Compter les commandes
    const ordersResult = await db.query('SELECT COUNT(*) as count FROM orders WHERE place_id = $1', [id]);
    stats.ordersCount = parseInt(ordersResult.rows[0].count);
    
    return stats;
  }

  // Supprimer un établissement
  // Note: Les suppressions en cascade sont gérées par les contraintes de la base de données
  // (ON DELETE CASCADE pour tables, categories, menu_items, orders)
  static async delete(id) {
    const { rowCount } = await db.query('DELETE FROM places WHERE id = $1', [id]);
    return rowCount > 0;
  }

  // Vérifier si l'utilisateur est propriétaire
  static async isOwner(placeId, userId) {
    const { rows } = await db.query(
      'SELECT 1 FROM places WHERE id = $1 AND user_id = $2',
      [placeId, userId]
    );
    return rows.length > 0;
  }
}

module.exports = Place;