const db = require('../config/db');

class Order {
  // Créer une nouvelle commande
  static async create({ placeId, tableId, items, customerNotes = '' }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // 1. Créer la commande principale
      // Calculer le total
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      
      // Vérifier si les colonnes existent et leurs contraintes
      let hasCustomerNotes = false;
      let hasTableNumber = false;
      let tableNumberNullable = true;
      
      try {
        const columnCheck = await client.query(`
          SELECT 
            column_name,
            is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'orders' 
          AND column_name IN ('customer_notes', 'table_number')
        `);
        
        hasCustomerNotes = columnCheck.rows.some(row => row.column_name === 'customer_notes');
        const tableNumberCol = columnCheck.rows.find(row => row.column_name === 'table_number');
        hasTableNumber = !!tableNumberCol;
        if (tableNumberCol) {
          tableNumberNullable = tableNumberCol.is_nullable === 'YES';
        }
      } catch (checkError) {
        console.warn('Could not check columns, using defaults:', checkError.message);
      }
      
      // Récupérer les informations de la table pour obtenir table_number si nécessaire
      let tableNumber = null;
      if (hasTableNumber && !tableNumberNullable && tableId) {
        try {
          const tableResult = await client.query(
            'SELECT id, name FROM tables WHERE id = $1',
            [tableId]
          );
          if (tableResult.rows.length > 0) {
            const tableName = tableResult.rows[0].name;
            // Essayer d'extraire un numéro du nom de la table
            const numberMatch = tableName ? tableName.match(/\d+/) : null;
            tableNumber = numberMatch ? parseInt(numberMatch[0], 10) : 0;
          } else {
            // Si la table n'existe pas, utiliser 0 comme valeur par défaut
            tableNumber = 0;
          }
        } catch (tableError) {
          // Si la table n'existe pas, utiliser 0 comme valeur par défaut
          console.warn('Could not fetch table info, using default table_number:', tableError.message);
          tableNumber = 0;
        }
      }
      
      // Construire la requête selon les colonnes disponibles
      let orderResult;
      try {
        const columns = ['place_id', 'table_id', 'status', 'total_amount'];
        const values = [placeId, tableId, 'pending', totalAmount];
        
        // Ajouter table_number seulement si la colonne existe et n'est pas nullable
        if (hasTableNumber && !tableNumberNullable && tableNumber !== null) {
          columns.push('table_number');
          values.push(tableNumber);
        }
        
        // Ajouter customer_notes si la colonne existe
        if (hasCustomerNotes) {
          columns.push('customer_notes');
          values.push(customerNotes || null);
        }
        
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        orderResult = await client.query(
          `INSERT INTO orders (${columns.join(', ')})
           VALUES (${placeholders})
           RETURNING *`,
          values
        );
      } catch (insertError) {
        // Logger l'erreur SQL pour diagnostic
        console.error('Error inserting order:', {
          error: insertError.message,
          code: insertError.code,
          detail: insertError.detail,
          placeId,
          tableId,
          tableNumber,
          totalAmount,
          hasCustomerNotes,
          hasTableNumber,
          tableNumberNullable
        });
        throw insertError;
      }
      const order = orderResult.rows[0];

      // 2. Ajouter les éléments de la commande
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items 
           (order_id, menu_item_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [
            order.id,
            item.menuItemId,
            item.quantity,
            item.unitPrice || item.price
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

  // Helper pour vérifier si une colonne existe
  static async hasColumn(tableName, columnName, client = db) {
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    `, [tableName, columnName]);
    return result.rows.length > 0;
  }

  // Trouver une commande par ID
  static async findById(orderId, client = db) {
    const orderResult = await client.query(
      `SELECT o.*, 
              t.name as table_name,
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menuItemId', oi.menu_item_id,
                  'name', mi.name,
                  'quantity', oi.quantity,
                  'unitPrice', oi.price,
                  'price', oi.price
                )
              ) FILTER (WHERE oi.id IS NOT NULL) as items
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.id = $1
       GROUP BY o.id, t.name`,
      [orderId]
    );

    if (orderResult.rows.length === 0) return null;
    const order = orderResult.rows[0];
    // Ajouter table_id et table_name pour compatibilité
    order.table = order.table_name || order.table_id || order.table_number;
    order.table_name = order.table_name;
    // Ajouter customerNotes en camelCase si customer_notes existe
    if (order.customer_notes !== undefined) {
      order.customerNotes = order.customer_notes;
    }
    return order;
  }

  // Trouver les commandes d'un établissement
  static async findByPlaceId(placeId, status = null) {
    try {
      // Vérifier si customer_notes existe
      const hasCustomerNotes = await this.hasColumn('orders', 'customer_notes');
      
      let query = `
        SELECT o.id,
               o.place_id,
               o.table_id,
               o.status,
               o.total_amount,
               o.created_at,
               ${hasCustomerNotes ? 'o.customer_notes,' : ''}
               t.name as table_name,
               COALESCE(COUNT(oi.id), 0) as item_count,
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'menuItemId', oi.menu_item_id,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'name', mi.name
                 )
               ) FILTER (WHERE oi.id IS NOT NULL) as items
        FROM orders o
        LEFT JOIN tables t ON o.table_id = t.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE o.place_id = $1
      `;
      
      const queryParams = [placeId];
      
      if (status) {
        query += ` AND o.status = $2`;
        queryParams.push(status);
      }
      
      query += ` GROUP BY o.id, o.place_id, o.table_id, o.status, o.total_amount, o.created_at${hasCustomerNotes ? ', o.customer_notes' : ''}, t.name ORDER BY o.created_at DESC LIMIT 1000`;
      
      const { rows } = await db.query(query, queryParams);
      
      // Format the response to match frontend expectations
      return rows.map(row => ({
        id: row.id,
        place_id: row.place_id,
        table: row.table_name || row.table_id || row.table_number, // Use table name if available, otherwise ID or number
        table_id: row.table_id,
        table_name: row.table_name,
        status: row.status,
        total_amount: parseFloat(row.total_amount || 0),
        created_at: row.created_at,
        createdAt: row.created_at,
        ...(hasCustomerNotes && row.customer_notes !== undefined ? {
          customer_notes: row.customer_notes,
          customerNotes: row.customer_notes // camelCase pour compatibilité frontend
        } : {}),
        detail: row.items ? JSON.stringify(row.items) : '[]',
        items: row.items || []
      }));
    } catch (error) {
      console.error('Erreur dans findByPlaceId:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'une commande
  static async updateStatus(orderId, status) {
    const validStatuses = ['pending', 'new', 'processing', 'in_progress', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Statut de commande invalide');
    }

    const { rows } = await db.query(
      `UPDATE orders 
       SET status = $1
       WHERE id = $2 
       RETURNING *`,
      [status, orderId]
    );
    
    return rows[0];
  }

  // Ajouter un élément à une commande existante
  static async addOrderItem(orderId, { menuItemId, quantity, unitPrice }) {
    const { rows } = await db.query(
      `INSERT INTO order_items 
       (order_id, menu_item_id, quantity, price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [orderId, menuItemId, quantity, unitPrice]
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

  // Supprimer une commande (et ses items via CASCADE)
  static async delete(orderId) {
    const { rowCount } = await db.query(
      'DELETE FROM orders WHERE id = $1',
      [orderId]
    );
    return rowCount > 0;
  }
}

module.exports = Order;