-- Migration: Ajouter les colonnes first_name, last_name et restaurant_name à la table users
-- Date: 2024-01-XX
-- Description: Ajoute les colonnes pour le prénom, nom et nom du restaurant si elles n'existent pas

BEGIN;

-- Ajouter first_name si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(50);
        -- Mettre à jour les valeurs existantes avec une valeur par défaut si nécessaire
        UPDATE users SET first_name = '' WHERE first_name IS NULL;
        ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
    END IF;
END $$;

-- Ajouter last_name si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(50);
        -- Mettre à jour les valeurs existantes avec une valeur par défaut si nécessaire
        UPDATE users SET last_name = '' WHERE last_name IS NULL;
        ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;
    END IF;
END $$;

-- Ajouter restaurant_name si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'restaurant_name'
    ) THEN
        ALTER TABLE users ADD COLUMN restaurant_name VARCHAR(100);
        -- Mettre à jour les valeurs existantes avec une valeur par défaut si nécessaire
        UPDATE users SET restaurant_name = '' WHERE restaurant_name IS NULL;
        ALTER TABLE users ALTER COLUMN restaurant_name SET NOT NULL;
    END IF;
END $$;

COMMIT;

