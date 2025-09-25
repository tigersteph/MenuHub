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
    await db.query('DELETE FROM tables WHERE id = $1', [id]);
    return true;
  }
};

module.exports = Table;
