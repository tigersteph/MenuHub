-- Migration 001: Corrections du schéma de base de données
-- Date: 2024-01-01
-- Description: Correction des erreurs de syntaxe et ajout des colonnes manquantes

BEGIN;

-- Correction 1: Nettoyer la syntaxe incorrecte dans menu_items
-- La ligne 54 du db.sql original contient du SQL invalide mélangé avec CREATE TABLE

-- Correction 2: Ajouter updated_at à la table places si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE places ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Correction 3: Ajouter number_of_tables à la table places
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'number_of_tables'
    ) THEN
        ALTER TABLE places ADD COLUMN number_of_tables INTEGER DEFAULT 0 CHECK (number_of_tables >= 0);
    END IF;
END $$;

-- Correction 4: S'assurer que updated_at existe dans menu_items (nettoyer la syntaxe corrompue)
DO $$ 
BEGIN
    -- Vérifier si la colonne updated_at existe déjà dans menu_items
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Correction 5: Ajouter updated_at aux catégories pour traçabilité
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Correction 6: Ajouter un champ order pour réorganiser les catégories
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'display_order'
    ) THEN
        ALTER TABLE categories ADD COLUMN display_order INTEGER DEFAULT 0;
        -- Initialiser avec un ordre basé sur created_at
        UPDATE categories SET display_order = subquery.row_number
        FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY place_id ORDER BY created_at) as row_number
            FROM categories
        ) AS subquery
        WHERE categories.id = subquery.id;
    END IF;
END $$;

-- Correction 7: Ajouter des contraintes CHECK pour valider les données
DO $$ 
BEGIN
    -- Contrainte pour les prix positifs
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'menu_items_price_positive'
    ) THEN
        ALTER TABLE menu_items 
        ADD CONSTRAINT menu_items_price_positive 
        CHECK (price >= 0);
    END IF;

    -- Contrainte pour les statuts de tables valides
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'tables_status_valid'
    ) THEN
        ALTER TABLE tables 
        ADD CONSTRAINT tables_status_valid 
        CHECK (status IN ('active', 'inactive', 'reserved'));
    END IF;

    -- Contrainte pour les noms non vides (au moins 2 caractères)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'categories_name_length'
    ) THEN
        ALTER TABLE categories 
        ADD CONSTRAINT categories_name_length 
        CHECK (LENGTH(TRIM(name)) >= 2);
    END IF;

    -- Contrainte pour les noms de tables non vides
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'tables_name_length'
    ) THEN
        ALTER TABLE tables 
        ADD CONSTRAINT tables_name_length 
        CHECK (LENGTH(TRIM(name)) >= 1);
    END IF;
END $$;

-- Correction 8: Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_places_user_id ON places(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_place_id ON categories(place_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_place_id ON menu_items(place_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_tables_place_id ON tables(place_id);
CREATE INDEX IF NOT EXISTS idx_orders_place_id ON orders(place_id);

COMMIT;

