-- Migration pour ajouter le support de la réinitialisation de mot de passe
-- À exécuter si les colonnes n'existent pas déjà

-- Ajouter les colonnes pour le reset de mot de passe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Créer un index sur reset_token pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Commentaires
COMMENT ON COLUMN users.reset_token IS 'Token de réinitialisation de mot de passe';
COMMENT ON COLUMN users.reset_token_expiry IS 'Date d''expiration du token de réinitialisation';

