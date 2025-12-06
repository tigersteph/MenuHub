-- Migration pour s'assurer que la contrainte ON DELETE SET NULL est correctement configurée
-- pour orders.table_id référençant tables.id

-- Étape 1: Vérifier si la contrainte existe déjà
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_table_id_fkey'
        AND table_name = 'orders'
    ) INTO constraint_exists;
    
    -- Si la contrainte existe, la supprimer pour la recréer avec ON DELETE SET NULL
    IF constraint_exists THEN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_table_id_fkey;
    END IF;
END $$;

-- Étape 2: Recréer la contrainte avec ON DELETE SET NULL
ALTER TABLE orders 
ADD CONSTRAINT orders_table_id_fkey 
FOREIGN KEY (table_id) 
REFERENCES tables(id) 
ON DELETE SET NULL;

-- Étape 3: Vérifier que la contrainte est bien créée
DO $$
DECLARE
    constraint_check BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.referential_constraints rc 
            ON tc.constraint_name = rc.constraint_name
        WHERE tc.table_name = 'orders'
        AND tc.constraint_name = 'orders_table_id_fkey'
        AND rc.delete_rule = 'SET NULL'
    ) INTO constraint_check;
    
    IF NOT constraint_check THEN
        RAISE EXCEPTION 'La contrainte ON DELETE SET NULL n''a pas été correctement créée';
    END IF;
    
    RAISE NOTICE 'Contrainte ON DELETE SET NULL correctement configurée pour orders.table_id';
END $$;

COMMENT ON CONSTRAINT orders_table_id_fkey ON orders IS 
'Contrainte de clé étrangère: table_id référence tables(id) avec ON DELETE SET NULL - permet la suppression des tables même avec des commandes associées';

