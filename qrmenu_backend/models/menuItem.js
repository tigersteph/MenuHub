const db = require('../config/db');

class MenuItem {
  // Créer un nouvel élément de menu
  static async create({ placeId, categoryId, name, description, price, imageUrl, isAvailable = true }) {
    // S'assurer que placeId et categoryId sont bien des UUID (string)
    if (!placeId || !categoryId) {
      throw new Error('placeId et categoryId sont requis pour créer un plat');
    }
    const query = `
      INSERT INTO menu_items 
      (place_id, category_id, name, description, price, image_url, is_available)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`;
    const values = [placeId.toString(), categoryId.toString(), name, description, price, imageUrl, isAvailable];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  // Trouver un élément par ID
  static async findById(id) {
    const { rows } = await db.query(`
      SELECT mi.*, c.name as category_name 
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.id = $1`, 
      [id]
    );
    return rows[0];
  }

  // Trouver tous les éléments d'un établissement
  static async findByPlaceId(placeId) {
    const { rows } = await db.query(`
      SELECT mi.*, c.name as category_name 
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.place_id = $1
      ORDER BY c.name, mi.name`,
      [placeId]
    );
    return rows;
  }

  // Mettre à jour un élément
  static async update(id, { categoryId, name, description, price, imageUrl, isAvailable }) {
    const query = `
      UPDATE menu_items 
      SET category_id = COALESCE($1, category_id),
          name = COALESCE($2, name),
          description = COALESCE($3, description),
          price = COALESCE($4, price),
          image_url = COALESCE($5, image_url),
          is_available = COALESCE($6, is_available),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *`;
    
    // Convertir isAvailable (camelCase) en boolean si nécessaire
    const isAvailableValue = isAvailable !== undefined ? Boolean(isAvailable) : undefined;
    const values = [categoryId, name, description, price, imageUrl, isAvailableValue, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  // Supprimer un élément
  static async delete(id) {
    const { rowCount } = await db.query('DELETE FROM menu_items WHERE id = $1', [id]);
    return rowCount > 0;
  }

  // Vérifier si l'élément appartient à un établissement
  static async belongsToPlace(itemId, placeId) {
    const { rows } = await db.query(
      'SELECT 1 FROM menu_items WHERE id = $1 AND place_id = $2',
      [itemId, placeId]
    );
    return rows.length > 0;
  }

  // Mettre à jour la disponibilité
  static async updateAvailability(id, isAvailable) {
    const { rows } = await db.query(
      'UPDATE menu_items SET is_available = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [isAvailable, id]
    );
    return rows[0];
  }
}

module.exports = MenuItem;