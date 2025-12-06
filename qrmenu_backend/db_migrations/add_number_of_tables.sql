-- Migration: Ajouter la colonne number_of_tables à la table places
-- Si la colonne n'existe pas déjà

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'places' 
        AND column_name = 'number_of_tables'
    ) THEN
        ALTER TABLE places ADD COLUMN number_of_tables INTEGER DEFAULT 0;
    END IF;
END $$;

