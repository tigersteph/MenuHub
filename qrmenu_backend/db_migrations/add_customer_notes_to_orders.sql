-- Migration pour ajouter la colonne customer_notes à la table orders
-- Cette colonne permet de stocker les notes/commentaires du client lors de la commande

-- Étape 1: Vérifier si la colonne existe déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_notes'
    ) THEN
        -- Ajouter la colonne customer_notes
        ALTER TABLE orders ADD COLUMN customer_notes TEXT;
        
        -- Ajouter un commentaire pour documentation
        COMMENT ON COLUMN orders.customer_notes IS 'Notes ou commentaires du client pour cette commande';
        
        RAISE NOTICE 'Colonne customer_notes ajoutée à la table orders';
    ELSE
        RAISE NOTICE 'Colonne customer_notes existe déjà dans la table orders';
    END IF;
END $$;

-- Vérification
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'customer_notes';
