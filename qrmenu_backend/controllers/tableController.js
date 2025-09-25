// controllers/tableController.js
const Table = require('../models/table');

const tableController = {
  async createTable(req, res) {
    try {
      const { name, status, place_id } = req.body;
      const table = await Table.create({ name, status, place_id });
      res.status(201).json(table);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getTablesByPlace(req, res) {
    try {
      const { placeId } = req.params;
      const tables = await Table.findByPlace(placeId);
      res.json(tables);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getTable(req, res) {
    try {
      const { id } = req.params;
      const table = await Table.findById(id);
      if (!table) return res.status(404).json({ error: 'Table not found' });
      res.json(table);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateTable(req, res) {
    try {
      const { id } = req.params;
      const { name, status } = req.body;
      const table = await Table.update(id, { name, status });
      res.json(table);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteTable(req, res) {
    try {
      const { id } = req.params;
      await Table.delete(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = tableController;
