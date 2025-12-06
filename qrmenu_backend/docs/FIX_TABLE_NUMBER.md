# Correction de l'Erreur table_number NOT NULL

## 🔍 Problème

L'erreur suivante se produisait lors de la création d'une commande :
```
une valeur NULL viole la contrainte NOT NULL de la colonne « table_number » dans la relation « orders »
```

## ✅ Solution

### 1. Migration SQL pour rendre `table_number` nullable

La colonne `table_number` est dépréciée au profit de `table_id` (UUID). Elle doit être nullable pour permettre la transition.

**Fichier créé** : `db_migrations/fix_table_number_nullable.sql`

**Pour appliquer** :
```bash
psql -U postgres -d qrmenu -f qrmenu_backend/db_migrations/fix_table_number_nullable.sql
```

### 2. Modification du modèle `Order.create()`

Le code vérifie maintenant :
- Si la colonne `table_number` existe
- Si elle a une contrainte NOT NULL
- Si oui, récupère le nom de la table et extrait un numéro
- Sinon, n'inclut pas `table_number` dans l'INSERT

**Fichier modifié** : `qrmenu_backend/models/order.js`

## 🚀 Actions Requises

### Étape 1 : Exécuter la migration (IMMÉDIAT)
```bash
psql -U postgres -d qrmenu -f qrmenu_backend/db_migrations/fix_table_number_nullable.sql
```

### Étape 2 : Redémarrer le serveur backend
Après la migration, redémarrer le serveur pour que les changements prennent effet.

### Étape 3 : Tester la création de commande
Essayer de créer une commande depuis le menu public pour vérifier que l'erreur est résolue.

## 📝 Notes Techniques

### Pourquoi cette erreur ?
- La colonne `table_number` a été créée avec `NOT NULL` dans le schéma initial
- Mais avec la migration vers `table_id` (UUID), `table_number` devient optionnel
- Le code n'insérait que `table_id`, laissant `table_number` à NULL
- La contrainte NOT NULL empêchait l'insertion

### Solution appliquée
1. **Migration SQL** : Rend `table_number` nullable (recommandé)
2. **Code robuste** : Gère les deux cas (nullable et NOT NULL) avec extraction du numéro depuis le nom de la table

---

*Document créé pour résoudre l'erreur table_number NOT NULL*
