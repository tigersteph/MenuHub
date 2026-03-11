# Configuration Supabase - MenuHub QR

## Étapes de configuration

### 1. Créer le projet Supabase

1. Aller sur https://supabase.com
2. Créer un compte (si nécessaire)
3. Créer un nouveau projet
4. Choisir une région proche
5. Noter le mot de passe de la base de données (il ne sera plus affiché)

### 2. Récupérer les credentials

Dans le dashboard Supabase, aller dans **Settings** → **Database** :

- **Host** : `db.xxxxx.supabase.co` (DB_HOST)
- **Port** : `5432` (DB_PORT)
- **Database name** : `postgres` (DB_NAME)
- **User** : `postgres` (DB_USER)
- **Password** : Le mot de passe que vous avez noté (DB_PASSWORD)

**Connection String** (format) :
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 3. Exécuter le schéma SQL

1. Aller dans **SQL Editor** dans le dashboard Supabase
2. Créer une nouvelle requête
3. **Option recommandée** : Copier le contenu de `db_supabase.sql` (déjà adapté pour Supabase)
   - **OU** copier le contenu de `db.sql` **MAIS** :
     - **IGNORER** les lignes `CREATE DATABASE qrmenu;` et `\c qrmenu;` (Supabase crée déjà la base)
     - Commencer directement par `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
4. Exécuter la requête

### 4. Exécuter les migrations dans l'ordre

Exécuter chaque fichier de migration dans l'ordre suivant :

1. `001_fix_schema.sql`
2. `add_user_name_columns.sql`
3. `add_user_role_column.sql`
4. `add_password_reset.sql`
5. `add_number_of_tables.sql`
6. `add_customer_notes_to_orders.sql`
7. `fix_tables_delete_constraint.sql`
8. `fix_orders_table_id.sql`
9. `fix_table_number_nullable.sql`
10. `add_indexes_orders.sql`
11. `create_indexes.sql`

**Note :** Pour chaque migration, copier le contenu dans le SQL Editor et exécuter.

### 5. Vérifier le schéma

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

### 6. Vérifier les extensions

```sql
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
```

L'extension `uuid-ossp` doit être activée.

### 7. Configurer les variables d'environnement Render

Utiliser les credentials récupérés pour configurer les variables dans Render :

- `DB_HOST` : Le host Supabase
- `DB_PORT` : 5432
- `DB_NAME` : postgres
- `DB_USER` : postgres
- `DB_PASSWORD` : Le mot de passe Supabase

## Notes importantes

- Supabase utilise PostgreSQL 15+
- La base de données est déjà créée, pas besoin de `CREATE DATABASE`
- Les migrations doivent être exécutées dans l'ordre
- Surveiller l'utilisation de stockage (limite gratuite : 500MB)

