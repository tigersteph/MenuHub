# Ordre d'exécution des migrations SQL

Ce document liste l'ordre exact dans lequel les migrations doivent être exécutées après avoir créé le schéma de base avec `db_supabase.sql`.

## Ordre d'exécution

1. **001_fix_schema.sql** - Corrections du schéma de base et ajout de colonnes manquantes
2. **add_user_name_columns.sql** - Ajout des colonnes first_name, last_name, restaurant_name
3. **add_user_role_column.sql** - Ajout de la colonne role (si pas déjà présente)
4. **add_password_reset.sql** - Ajout des colonnes pour la réinitialisation de mot de passe
5. **add_number_of_tables.sql** - Ajout de la colonne number_of_tables (si pas déjà présente)
6. **add_customer_notes_to_orders.sql** - Ajout de la colonne customer_notes
7. **fix_tables_delete_constraint.sql** - Correction des contraintes de suppression
8. **fix_orders_table_id.sql** - Correction de la référence table_id dans orders
9. **fix_table_number_nullable.sql** - Rendre table_number nullable
10. **add_indexes_orders.sql** - Ajout d'index sur la table orders
11. **create_indexes.sql** - Ajout d'index supplémentaires

## Instructions

Pour chaque migration :

1. Ouvrir le SQL Editor dans Supabase
2. Créer une nouvelle requête
3. Copier le contenu du fichier de migration
4. Exécuter la requête
5. Vérifier qu'il n'y a pas d'erreurs
6. Passer à la migration suivante

## Vérification après migrations

Exécuter cette requête pour vérifier que toutes les tables existent :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Vous devriez voir :
- categories
- menu_items
- order_items
- orders
- places
- tables
- users

## Notes

- Les migrations utilisent `IF NOT EXISTS` pour éviter les erreurs si elles sont exécutées plusieurs fois
- Certaines migrations peuvent être redondantes si le schéma initial (`db_supabase.sql`) contient déjà certaines colonnes
- En cas d'erreur, vérifier les logs dans Supabase

