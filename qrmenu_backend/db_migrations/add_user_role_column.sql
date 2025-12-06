-- Migration: Ajouter la colonne role à la table users
-- Date: 2024-01-XX
-- Description: Ajoute la colonne role si elle n'existe pas

BEGIN;

-- Ajouter role si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        -- Mettre à jour les valeurs existantes
        UPDATE users SET role = 'user' WHERE role IS NULL;
    END IF;
END $$;

COMMIT;

