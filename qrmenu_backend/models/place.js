const db = require('../config/db');

class Place {
  // Créer un nouvel établissement
  static async create({ name, description, address, phone, userId, color, logo_url, font }) {
    const query = `
      INSERT INTO places (name, description, address, phone, user_id, logo_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const values = [name, description, address, phone, userId, logo_url];
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
  static async update(id, { name, description, address, phone, color, logo_url, font }) {
    const query = `
      UPDATE places 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          address = COALESCE($3, address),
          phone = COALESCE($4, phone),
          color = COALESCE($5, color),
          logo_url = COALESCE($6, logo_url),
          font = COALESCE($7, font),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *`;
    const values = [name, description, address, phone, color, logo_url, font, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  // Supprimer un établissement
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