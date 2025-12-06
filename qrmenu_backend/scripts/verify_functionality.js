/**
 * Script de vérification des fonctionnalités critiques
 * Vérifie la cohérence entre backend, base de données et structure frontend
 */

const db = require('../config/db');
const Place = require('../models/place');
const MenuItem = require('../models/menuItem');
const Table = require('../models/table');
const Order = require('../models/order');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.cyan);
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function verifyDatabaseSchema() {
  logSection('VÉRIFICATION DU SCHÉMA DE BASE DE DONNÉES');
  
  const client = await db.getClient();
  try {
    // Vérifier la table places
    const placesColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'places'
      ORDER BY ordinal_position
    `);
    
    log('\n📋 Table PLACES:');
    const requiredPlaceColumns = ['id', 'name', 'user_id', 'created_at'];
    const placeColumns = placesColumns.rows.map(r => r.column_name);
    requiredPlaceColumns.forEach(col => {
      if (placeColumns.includes(col)) {
        logSuccess(`Colonne ${col} existe`);
      } else {
        logError(`Colonne ${col} manquante`);
      }
    });
    
    // Vérifier la table menu_items
    const menuItemsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'menu_items'
      ORDER BY ordinal_position
    `);
    
    log('\n📋 Table MENU_ITEMS:');
    const requiredMenuItemColumns = ['id', 'place_id', 'category_id', 'name', 'price', 'is_available'];
    const menuItemColumns = menuItemsColumns.rows.map(r => r.column_name);
    requiredMenuItemColumns.forEach(col => {
      if (menuItemColumns.includes(col)) {
        logSuccess(`Colonne ${col} existe`);
      } else {
        logError(`Colonne ${col} manquante`);
      }
    });
    
    // Vérifier la table tables
    const tablesColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tables'
      ORDER BY ordinal_position
    `);
    
    log('\n📋 Table TABLES:');
    const requiredTableColumns = ['id', 'name', 'place_id', 'status'];
    const tableColumns = tablesColumns.rows.map(r => r.column_name);
    requiredTableColumns.forEach(col => {
      if (tableColumns.includes(col)) {
        logSuccess(`Colonne ${col} existe`);
      } else {
        logError(`Colonne ${col} manquante`);
      }
    });
    
    // Vérifier la table orders
    const ordersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `);
    
    log('\n📋 Table ORDERS:');
    const requiredOrderColumns = ['id', 'place_id', 'status', 'total_amount'];
    const orderColumns = ordersColumns.rows.map(r => r.column_name);
    requiredOrderColumns.forEach(col => {
      if (orderColumns.includes(col)) {
        logSuccess(`Colonne ${col} existe`);
      } else {
        logError(`Colonne ${col} manquante`);
      }
    });
    
    // Vérifier table_id dans orders
    if (orderColumns.includes('table_id')) {
      logSuccess('Colonne table_id existe dans orders');
    } else {
      logWarning('Colonne table_id n\'existe pas dans orders (utilise table_number?)');
    }
    
    // Vérifier la table order_items
    const orderItemsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'order_items'
      ORDER BY ordinal_position
    `);
    
    log('\n📋 Table ORDER_ITEMS:');
    const requiredOrderItemColumns = ['id', 'order_id', 'menu_item_id', 'quantity', 'price'];
    const orderItemColumns = orderItemsColumns.rows.map(r => r.column_name);
    requiredOrderItemColumns.forEach(col => {
      if (orderItemColumns.includes(col)) {
        logSuccess(`Colonne ${col} existe`);
      } else {
        logError(`Colonne ${col} manquante`);
      }
    });
    
    // Vérifier les contraintes de clé étrangère
    log('\n🔗 Contraintes de clé étrangère:');
    const foreignKeys = await client.query(`
      SELECT 
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
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('places', 'menu_items', 'tables', 'orders', 'order_items')
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    const expectedFKs = [
      { table: 'menu_items', column: 'place_id', ref: 'places.id', rule: 'CASCADE' },
      { table: 'tables', column: 'place_id', ref: 'places.id', rule: 'CASCADE' },
      { table: 'orders', column: 'place_id', ref: 'places.id', rule: 'CASCADE' },
      { table: 'order_items', column: 'order_id', ref: 'orders.id', rule: 'CASCADE' },
      { table: 'order_items', column: 'menu_item_id', ref: 'menu_items.id', rule: null }
    ];
    
    expectedFKs.forEach(expected => {
      const found = foreignKeys.rows.find(fk => 
        fk.table_name === expected.table && 
        fk.column_name === expected.column &&
        fk.foreign_table_name === expected.ref.split('.')[0] &&
        fk.foreign_column_name === expected.ref.split('.')[1]
      );
      if (found) {
        const ruleMatch = !expected.rule || found.delete_rule === expected.rule;
        if (ruleMatch) {
          logSuccess(`${expected.table}.${expected.column} → ${expected.ref} (${found.delete_rule || 'NO ACTION'})`);
        } else {
          logWarning(`${expected.table}.${expected.column} → ${expected.ref} (règle: ${found.delete_rule}, attendu: ${expected.rule})`);
        }
      } else {
        logError(`Contrainte manquante: ${expected.table}.${expected.column} → ${expected.ref}`);
      }
    });
    
    // Vérifier la contrainte ON DELETE SET NULL pour orders.table_id
    const tableIdFK = foreignKeys.rows.find(fk => 
      fk.table_name === 'orders' && 
      fk.column_name === 'table_id' &&
      fk.foreign_table_name === 'tables'
    );
    if (tableIdFK) {
      if (tableIdFK.delete_rule === 'SET NULL') {
        logSuccess('Contrainte orders.table_id → tables.id avec ON DELETE SET NULL');
      } else {
        logWarning(`Contrainte orders.table_id → tables.id avec ON DELETE ${tableIdFK.delete_rule} (attendu: SET NULL)`);
      }
    } else if (orderColumns.includes('table_id')) {
      logWarning('Contrainte orders.table_id → tables.id manquante');
    }
    
    // Vérifier les index
    log('\n📊 Index:');
    const indexes = await client.query(`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('places', 'menu_items', 'tables', 'orders', 'order_items')
      ORDER BY tablename, indexname
    `);
    
    const importantIndexes = [
      { table: 'places', column: 'user_id' },
      { table: 'menu_items', column: 'place_id' },
      { table: 'menu_items', column: 'category_id' },
      { table: 'tables', column: 'place_id' },
      { table: 'orders', column: 'place_id' },
      { table: 'orders', column: 'created_at' },
      { table: 'order_items', column: 'order_id' }
    ];
    
    importantIndexes.forEach(expected => {
      const found = indexes.rows.find(idx => 
        idx.tablename === expected.table &&
        idx.indexdef.toLowerCase().includes(expected.column.toLowerCase())
      );
      if (found) {
        logSuccess(`Index sur ${expected.table}.${expected.column}`);
      } else {
        logWarning(`Index manquant sur ${expected.table}.${expected.column}`);
      }
    });
    
  } catch (error) {
    logError(`Erreur lors de la vérification du schéma: ${error.message}`);
    console.error(error);
  } finally {
    client.release();
  }
}

async function verifyModels() {
  logSection('VÉRIFICATION DES MODÈLES');
  
  try {
    // Vérifier Place model
    log('\n📦 Modèle Place:');
    const placeMethods = ['create', 'findById', 'findByUserId', 'update', 'delete', 'isOwner'];
    placeMethods.forEach(method => {
      if (typeof Place[method] === 'function') {
        logSuccess(`Méthode Place.${method}() existe`);
      } else {
        logError(`Méthode Place.${method}() manquante`);
      }
    });
    
    // Vérifier MenuItem model
    log('\n📦 Modèle MenuItem:');
    const menuItemMethods = ['create', 'findById', 'findByPlaceId', 'update', 'delete', 'updateAvailability'];
    menuItemMethods.forEach(method => {
      if (typeof MenuItem[method] === 'function') {
        logSuccess(`Méthode MenuItem.${method}() existe`);
      } else {
        logError(`Méthode MenuItem.${method}() manquante`);
      }
    });
    
    // Vérifier Table model
    log('\n📦 Modèle Table:');
    const tableMethods = ['create', 'findById', 'findByPlace', 'update', 'delete'];
    tableMethods.forEach(method => {
      if (typeof Table[method] === 'function') {
        logSuccess(`Méthode Table.${method}() existe`);
      } else {
        logError(`Méthode Table.${method}() manquante`);
      }
    });
    
    // Vérifier Order model
    log('\n📦 Modèle Order:');
    const orderMethods = ['create', 'findById', 'findByPlaceId', 'updateStatus', 'addOrderItem'];
    orderMethods.forEach(method => {
      if (typeof Order[method] === 'function') {
        logSuccess(`Méthode Order.${method}() existe`);
      } else {
        logError(`Méthode Order.${method}() manquante`);
      }
    });
    
  } catch (error) {
    logError(`Erreur lors de la vérification des modèles: ${error.message}`);
    console.error(error);
  }
}

async function verifyControllers() {
  logSection('VÉRIFICATION DES CONTROLLERS');
  
  const placeController = require('../controllers/placeController');
  const menuItemController = require('../controllers/menuItemController');
  const tableController = require('../controllers/tableController');
  const orderController = require('../controllers/orderController');
  
  try {
    // Vérifier placeController
    log('\n🎮 PlaceController:');
    const placeControllerMethods = ['createPlace', 'getPlace', 'getUserPlaces', 'updatePlace', 'deletePlace', 'getPlaceStats'];
    placeControllerMethods.forEach(method => {
      if (typeof placeController[method] === 'function') {
        logSuccess(`placeController.${method}() existe`);
      } else {
        logError(`placeController.${method}() manquante`);
      }
    });
    
    // Vérifier menuItemController
    log('\n🎮 MenuItemController:');
    const menuItemControllerMethods = ['createMenuItem', 'getMenuItems', 'updateMenuItem', 'deleteMenuItem', 'updateAvailability'];
    menuItemControllerMethods.forEach(method => {
      if (typeof menuItemController[method] === 'function') {
        logSuccess(`menuItemController.${method}() existe`);
      } else {
        logError(`menuItemController.${method}() manquante`);
      }
    });
    
    // Vérifier tableController
    log('\n🎮 TableController:');
    const tableControllerMethods = ['createTable', 'getTablesByPlace', 'getTable', 'updateTable', 'deleteTable'];
    tableControllerMethods.forEach(method => {
      if (typeof tableController[method] === 'function') {
        logSuccess(`tableController.${method}() existe`);
      } else {
        logError(`tableController.${method}() manquante`);
      }
    });
    
    // Vérifier orderController
    log('\n🎮 OrderController:');
    const orderControllerMethods = ['createOrderPublic', 'createOrder', 'getOrdersByPlace', 'getOrder', 'updateOrderStatus'];
    orderControllerMethods.forEach(method => {
      if (typeof orderController[method] === 'function') {
        logSuccess(`orderController.${method}() existe`);
      } else {
        logError(`orderController.${method}() manquante`);
      }
    });
    
  } catch (error) {
    logError(`Erreur lors de la vérification des controllers: ${error.message}`);
    console.error(error);
  }
}

async function verifyRoutes() {
  logSection('VÉRIFICATION DES ROUTES');
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Vérifier les fichiers de routes
    const routesDir = path.join(__dirname, '../routes');
    const routeFiles = ['places.js', 'menuItems.js', 'tables.js', 'orders.js'];
    
    routeFiles.forEach(file => {
      const filePath = path.join(routesDir, file);
      if (fs.existsSync(filePath)) {
        logSuccess(`Fichier de route ${file} existe`);
      } else {
        logError(`Fichier de route ${file} manquant`);
      }
    });
    
    // Vérifier les routes dans places.js
    log('\n🛣️  Routes Places:');
    const placesRoutes = fs.readFileSync(path.join(routesDir, 'places.js'), 'utf8');
    const expectedPlaceRoutes = [
      'POST /',
      'GET /',
      'GET /:id',
      'GET /:id/public',
      'GET /:id/stats',
      'PUT /:id',
      'DELETE /:id'
    ];
    expectedPlaceRoutes.forEach(route => {
      if (placesRoutes.includes(route.split(' ')[1])) {
        logSuccess(`Route ${route} trouvée`);
      } else {
        logWarning(`Route ${route} non vérifiée`);
      }
    });
    
    // Vérifier les routes dans menuItems.js
    log('\n🛣️  Routes MenuItems:');
    const menuRoutes = fs.readFileSync(path.join(routesDir, 'menuItems.js'), 'utf8');
    const expectedMenuRoutes = [
      'POST /:placeId/items',
      'GET /:placeId/items',
      'PUT /items/:itemId',
      'DELETE /items/:itemId',
      'PATCH /items/:itemId/availability'
    ];
    expectedMenuRoutes.forEach(route => {
      if (menuRoutes.includes(route.split(' ')[1])) {
        logSuccess(`Route ${route} trouvée`);
      } else {
        logWarning(`Route ${route} non vérifiée`);
      }
    });
    
    // Vérifier les routes dans tables.js
    log('\n🛣️  Routes Tables:');
    const tablesRoutes = fs.readFileSync(path.join(routesDir, 'tables.js'), 'utf8');
    const expectedTableRoutes = [
      'POST /',
      'GET /place/:placeId',
      'GET /:id',
      'GET /:id/public',
      'PUT /:id',
      'DELETE /:id'
    ];
    expectedTableRoutes.forEach(route => {
      if (tablesRoutes.includes(route.split(' ')[1])) {
        logSuccess(`Route ${route} trouvée`);
      } else {
        logWarning(`Route ${route} non vérifiée`);
      }
    });
    
    // Vérifier les routes dans orders.js
    log('\n🛣️  Routes Orders:');
    const ordersRoutes = fs.readFileSync(path.join(routesDir, 'orders.js'), 'utf8');
    const expectedOrderRoutes = [
      'POST /places/:placeId/orders/public',
      'POST /places/:placeId/orders',
      'GET /places/:placeId/orders',
      'GET /orders/:orderId',
      'PATCH /orders/:orderId/status'
    ];
    expectedOrderRoutes.forEach(route => {
      if (ordersRoutes.includes(route.split(' ')[1])) {
        logSuccess(`Route ${route} trouvée`);
      } else {
        logWarning(`Route ${route} non vérifiée`);
      }
    });
    
  } catch (error) {
    logError(`Erreur lors de la vérification des routes: ${error.message}`);
    console.error(error);
  }
}

async function main() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║  VÉRIFICATION DES FONCTIONNALITÉS - RESTO QR MENU         ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════════╝', colors.cyan);
  
  try {
    await verifyDatabaseSchema();
    await verifyModels();
    await verifyControllers();
    await verifyRoutes();
    
    logSection('RÉSUMÉ');
    log('\n✅ Vérification terminée. Consultez les résultats ci-dessus.');
    log('⚠️  Les avertissements indiquent des points à vérifier manuellement.');
    log('❌ Les erreurs indiquent des problèmes à corriger.\n');
    
  } catch (error) {
    logError(`Erreur fatale: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Erreur:', error);
    process.exit(1);
  });
}

module.exports = { verifyDatabaseSchema, verifyModels, verifyControllers, verifyRoutes };

