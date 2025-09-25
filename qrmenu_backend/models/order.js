const db = require('../config/db');

class Order {
  // Créer une nouvelle commande
  static async create({ placeId, tableNumber, items, customerNotes = '' }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // 1. Créer la commande principale
      const orderResult = await client.query(
        `INSERT INTO orders (place_id, table_number, customer_notes, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [placeId, tableNumber, customerNotes]
      );
      const order = orderResult.rows[0];

      // 2. Ajouter les éléments de la commande
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items 
           (order_id, menu_item_id, quantity, unit_price, special_requests)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            order.id,
            item.menuItemId,
            item.quantity,
            item.unitPrice,
            item.specialRequests || null
          ]
        );
      }

      await client.query('COMMIT');
      return await this.findById(order.id, client);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Trouver une commande par ID
  static async findById(orderId, client = db) {
    const orderResult = await client.query(
      `SELECT o.*, 
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menuItemId', oi.menu_item_id,
                  'name', mi.name,
                  'quantity', oi.quantity,
                  'unitPrice', oi.unit_price,
                  'specialRequests', oi.special_requests
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [orderId]
    );

    if (orderResult.rows.length === 0) return null;
    return orderResult.rows[0];
  }

  // Trouver les commandes d'un établissement
  static async findByPlaceId(placeId, status = null) {
    let query = `
      SELECT o.*, 
             COUNT(oi.id) as item_count,
             SUM(oi.quantity * oi.unit_price) as total_amount
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.place_id = $1
    `;
    
    const queryParams = [placeId];
    
    if (status) {
      query += ` AND o.status = $2`;
      queryParams.push(status);
    }
    
    query += ` GROUP BY o.id ORDER BY o.created_at DESC`;
    
    const { rows } = await db.query(query, queryParams);
    return rows;
  }

  // Mettre à jour le statut d'une commande
  static async updateStatus(orderId, status) {
    const validStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Statut de commande invalide');
    }

    const { rows } = await db.query(
      `UPDATE orders 
       SET status = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, orderId]
    );
    
    return rows[0];
  }

  // Ajouter un élément à une commande existante
  static async addOrderItem(orderId, { menuItemId, quantity, unitPrice, specialRequests = null }) {
    const { rows } = await db.query(
      `INSERT INTO order_items 
       (order_id, menu_item_id, quantity, unit_price, special_requests)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orderId, menuItemId, quantity, unitPrice, specialRequests]
    );
    return rows[0];
  }

  // Supprimer un élément d'une commande
  static async removeOrderItem(orderItemId) {
    const { rowCount } = await db.query(
      'DELETE FROM order_items WHERE id = $1',
      [orderItemId]
    );
    return rowCount > 0;
  }

  // Vérifier si une commande appartient à un établissement
  static async belongsToPlace(orderId, placeId) {
    const { rows } = await db.query(
      'SELECT 1 FROM orders WHERE id = $1 AND place_id = $2',
      [orderId, placeId]
    );
    return rows.length > 0;
  }
}

module.exports = Order;