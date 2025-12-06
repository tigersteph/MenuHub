-- Migration pour rendre table_number nullable dans la table orders
-- Cette colonne est dépréciée au profit de table_id (UUID)
-- Permettre NULL permet la transition progressive

-- Étape 1: Vérifier si la colonne existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'table_number'
    ) THEN
        -- Modifier la colonne pour permettre NULL
        ALTER TABLE orders ALTER COLUMN table_number DROP NOT NULL;
        
        RAISE NOTICE 'Contrainte NOT NULL supprimée de orders.table_number';
    ELSE
        RAISE NOTICE 'Colonne table_number n''existe pas dans orders';
    END IF;
END $$;

-- Vérification
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'table_number';
