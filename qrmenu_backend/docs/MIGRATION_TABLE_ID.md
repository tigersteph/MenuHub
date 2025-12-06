# Migration : table_number → table_id

## Problème identifié

La table `orders` utilisait `table_number INTEGER` alors que les tables sont stockées avec un UUID dans la table `tables`. Cela créait une incohérence dans le système.

## Solution implémentée

### 1. Migration SQL
Fichier : `db_migrations/fix_orders_table_id.sql`

- Ajout de la colonne `table_id UUID REFERENCES tables(id)`
- Support de compatibilité avec `table_number` pendant la période de transition

### 2. Modifications Backend

#### `models/order.js`
- ✅ `create()` : Accepte maintenant `tableId` (UUID) au lieu de `tableNumber`
- ✅ `findById()` : Retourne `table_id` et `table_number` (pour compatibilité)
- ✅ `findByPlaceId()` : Retourne `table_id` et `table_number` (pour compatibilité)

#### `controllers/orderController.js`
- ✅ `createOrderPublic()` : Accepte `tableId` ou `tableNumber` (compatibilité)
- ✅ `createOrder()` : Accepte `tableId` ou `tableNumber` (compatibilité)
- ✅ Réponses incluent `table_id` et `table` (pour compatibilité frontend)

### 3. Modifications Frontend

#### `services/api/orders.js`
- ✅ `createOrder()` : Envoie maintenant `tableId` au lieu de `tableNumber: tableId`

#### `pages/Menu.js`
- ✅ Ajout du rafraîchissement automatique du menu toutes les 30 secondes
- ✅ Les modifications du restaurateur sont maintenant visibles côté client automatiquement

## Instructions de déploiement

### Étape 1 : Exécuter la migration SQL
```sql
-- Exécuter le fichier : db_migrations/fix_orders_table_id.sql
psql -U postgres -d qrmenu -f db_migrations/fix_orders_table_id.sql
```

### Étape 2 : Migrer les données existantes (si nécessaire)
Si vous avez des commandes existantes avec `table_number`, exécutez :
```sql
UPDATE orders o
SET table_id = (
  SELECT t.id 
  FROM tables t 
  WHERE t.place_id = o.place_id 
  AND t.name = o.table_number::text
  LIMIT 1
)
WHERE o.table_id IS NULL AND o.table_number IS NOT NULL;
```

### Étape 3 : Rendre table_id NOT NULL (après migration complète)
```sql
-- ATTENTION : Ne pas exécuter si des commandes ont encore table_id NULL
ALTER TABLE orders ALTER COLUMN table_id SET NOT NULL;
ALTER TABLE orders DROP COLUMN table_number;
```

## Compatibilité

Le système supporte actuellement les deux formats (`table_id` et `table_number`) pour permettre une migration en douceur. Une fois toutes les données migrées, vous pouvez supprimer `table_number`.

## Tests recommandés

1. ✅ Créer une nouvelle commande avec `tableId` (UUID)
2. ✅ Vérifier que la commande est correctement liée à la table
3. ✅ Vérifier que les commandes existantes fonctionnent toujours
4. ✅ Vérifier le rafraîchissement automatique du menu côté client

## Notes

- Les nouvelles commandes utilisent uniquement `table_id`
- Les anciennes commandes peuvent encore utiliser `table_number` pendant la période de transition
- Le frontend envoie maintenant `tableId` (UUID) correctement
- Le menu client se rafraîchit automatiquement toutes les 30 secondes

