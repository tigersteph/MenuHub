-- Indexes pour optimiser les performances en production
-- Date: 2024
-- Description: Création d'indexes sur les colonnes fréquemment utilisées

-- Indexes pour la table orders (optimisés pour les requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_orders_place_id ON orders(place_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_place_status ON orders(place_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_place_created ON orders(place_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_place_status_created ON orders(place_id, status, created_at DESC);

-- Indexes pour la table order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);

-- Indexes pour la table menu_items
CREATE INDEX IF NOT EXISTS idx_menu_items_place_id ON menu_items(place_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_place_category ON menu_items(place_id, category_id);

-- Indexes pour la table categories
CREATE INDEX IF NOT EXISTS idx_categories_place_id ON categories(place_id);

-- Indexes pour la table tables
CREATE INDEX IF NOT EXISTS idx_tables_place_id ON tables(place_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);

-- Indexes pour la table places
CREATE INDEX IF NOT EXISTS idx_places_user_id ON places(user_id);

-- Indexes pour la table users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Vérification des indexes créés
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

