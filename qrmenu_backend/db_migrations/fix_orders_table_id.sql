-- Migration pour standardiser l'utilisation de table_id dans la table orders
-- Supprime la colonne table_number qui est redondante

-- Étape 1: S'assurer que toutes les commandes ont un table_id valide
-- Si table_number existe mais pas table_id, créer une table temporaire ou utiliser table_number comme référence

-- Étape 2: Ajouter la colonne table_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'table_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN table_id UUID REFERENCES tables(id);
    END IF;
END $$;

-- Étape 3: Migrer les données de table_number vers table_id si nécessaire
-- Note: Cette étape nécessite que les tables existent dans la table 'tables'
-- Si table_number est un INTEGER, il faudra créer les tables correspondantes ou mapper manuellement

-- Étape 4: Rendre table_id NOT NULL après migration (optionnel, à faire après vérification)
-- ALTER TABLE orders ALTER COLUMN table_id SET NOT NULL;

-- Étape 5: Supprimer table_number après migration complète (optionnel, à faire après vérification)
-- ALTER TABLE orders DROP COLUMN IF EXISTS table_number;

-- Créer un index sur table_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);

-- Commentaire
COMMENT ON COLUMN orders.table_id IS 'Référence à la table (UUID) - remplace table_number';
