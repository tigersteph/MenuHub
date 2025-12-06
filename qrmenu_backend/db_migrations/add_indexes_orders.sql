-- Migration pour ajouter des index sur la table orders pour améliorer les performances
-- Ces index optimisent les requêtes fréquentes

-- Index sur place_id (pour récupérer les commandes d'un établissement)
CREATE INDEX IF NOT EXISTS idx_orders_place_id ON orders(place_id);

-- Index sur status (pour filtrer par statut)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index composite sur place_id et status (pour les requêtes combinées)
CREATE INDEX IF NOT EXISTS idx_orders_place_status ON orders(place_id, status);

-- Index sur created_at (pour trier par date)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Index sur order_items.order_id (pour les jointures)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Index sur order_items.menu_item_id (pour les statistiques)
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);

-- Vérification
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, indexname;
