# Diagnostic des Erreurs de Commandes

## 🔍 Problème : Erreur 500 lors de la création de commande publique

### Erreur observée
```
POST http://localhost:8000/api/places/abcd8825-3926-4f21-a478-2c813429d1fb/orders/public 500 (Internal Server Error)
```

## ✅ Corrections Apportées

### 1. Validation des prix dans `createOrderPublic`
- ✅ Ajout de la validation complète des items (identique à `createOrder`)
- ✅ Vérification de l'existence de chaque item
- ✅ Vérification de l'appartenance à l'établissement
- ✅ Vérification de la disponibilité
- ✅ Utilisation du prix de la base de données (sécurité)

### 2. Gestion robuste de `customer_notes`
- ✅ Vérification dynamique de l'existence de la colonne
- ✅ Fallback si la colonne n'existe pas encore
- ✅ Gestion d'erreur améliorée

### 3. Amélioration du logging
- ✅ Logging détaillé pour chaque item validé
- ✅ Logging des erreurs SQL
- ✅ Messages d'erreur plus clairs

## 🚀 Pour Résoudre l'Erreur 500

### Étape 1 : Vérifier les logs du serveur backend
Consultez les logs du serveur Node.js pour voir l'erreur exacte :
```bash
# Dans le terminal où le serveur backend tourne
# Cherchez les lignes avec "Public order creation failed" ou "Error inserting order"
```

### Étape 2 : Appliquer les migrations SQL (si pas encore fait)
```bash
# 1. Ajouter customer_notes
psql -U postgres -d qrmenu -f qrmenu_backend/db_migrations/add_customer_notes_to_orders.sql

# 2. Ajouter les index
psql -U postgres -d qrmenu -f qrmenu_backend/db_migrations/add_indexes_orders.sql
```

### Étape 3 : Vérifier les données envoyées
Dans la console du navigateur, vérifiez les données envoyées :
```javascript
// Les données doivent être au format :
{
  tableId: "uuid-de-la-table",
  items: [
    {
      menuItemId: "uuid-du-plat",
      quantity: 1,
      unitPrice: 500.00
    }
  ],
  customerNotes: "" // optionnel
}
```

### Étape 4 : Vérifier que les items existent
Assurez-vous que :
- Les `menuItemId` envoyés existent dans la base de données
- Les items appartiennent bien à l'établissement (`place_id`)
- Les items sont disponibles (`is_available = true` ou `null`)

## 🔧 Causes Possibles de l'Erreur 500

### 1. Item inexistant
**Symptôme** : `NotFoundError: Élément de menu avec l'ID ...`
**Solution** : Vérifier que les `menuItemId` dans le panier correspondent à des items existants

### 2. Item non disponible
**Symptôme** : `ValidationError: L'élément "..." n'est plus disponible`
**Solution** : Vérifier que `is_available` n'est pas `false` pour les items commandés

### 3. Item d'un autre établissement
**Symptôme** : `ValidationError: L'élément de menu ... n'appartient pas à cet établissement`
**Solution** : Vérifier que tous les items appartiennent au même `place_id`

### 4. Erreur SQL (colonne manquante)
**Symptôme** : `column "customer_notes" does not exist`
**Solution** : Exécuter la migration `add_customer_notes_to_orders.sql`

### 5. Erreur SQL (contrainte)
**Symptôme** : `foreign key violation` ou `constraint violation`
**Solution** : Vérifier que `tableId` existe dans la table `tables`

## 📝 Test Manuel

### Test 1 : Vérifier qu'un item existe
```sql
SELECT id, name, price, is_available, place_id 
FROM menu_items 
WHERE id = 'uuid-de-l-item';
```

### Test 2 : Vérifier qu'une table existe
```sql
SELECT id, name, place_id 
FROM tables 
WHERE id = 'uuid-de-la-table';
```

### Test 3 : Vérifier la structure de la table orders
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

## 🐛 Debugging

### Activer les logs détaillés
Dans `qrmenu_backend/controllers/orderController.js`, les logs sont déjà activés :
- `logger.request()` : Log chaque requête
- `logger.errorRequest()` : Log chaque erreur
- `logger.warn()` : Log les écarts de prix

### Vérifier les logs en temps réel
```bash
# Si vous utilisez nodemon ou pm2
tail -f logs/app.log

# Ou directement dans la console du serveur
```

## ✅ Checklist de Vérification

- [ ] Les migrations SQL ont été exécutées
- [ ] Les items dans le panier existent dans la base de données
- [ ] Les items appartiennent au bon établissement
- [ ] Les items sont disponibles (`is_available` n'est pas `false`)
- [ ] La table existe et appartient au bon établissement
- [ ] Les logs du serveur sont consultés pour voir l'erreur exacte

---

*Document créé pour le diagnostic de l'erreur 500*
