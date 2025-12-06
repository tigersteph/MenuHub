# Analyse de Cohérence des Données - Frontend, Backend, Base de Données

## Date: 2024-01-XX
## Objectif: Vérifier la cohérence des noms de champs et des structures de données entre les trois couches

---

## 1. TABLE USERS

### Base de Données (snake_case)
```sql
- id (UUID)
- username (VARCHAR)
- email (VARCHAR)
- password_hash (VARCHAR)
- first_name (VARCHAR) ✅ Ajouté via migration
- last_name (VARCHAR) ✅ Ajouté via migration
- restaurant_name (VARCHAR) ✅ Ajouté via migration
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- role (VARCHAR) - si existe
- reset_token (VARCHAR) - si existe
- reset_token_expiry (TIMESTAMP) - si existe
```

### Backend (Contrôleurs)
**authController.js:**
- ✅ Reçoit: `firstName`, `lastName`, `restaurantName` (camelCase depuis frontend)
- ✅ Convertit en: `first_name`, `last_name`, `restaurant_name` (snake_case pour BD)
- ✅ Retourne: `first_name`, `last_name`, `restaurant_name` (snake_case)

**Problèmes identifiés:**
- ⚠️ Les requêtes `SELECT * FROM users` retournent directement les colonnes snake_case
- ⚠️ Pas de transformation systématique vers camelCase pour le frontend

### Frontend
**AuthContext.js:**
- ✅ Envoie: `firstName`, `lastName`, `restaurantName` (camelCase)
- ✅ Reçoit: `first_name`, `last_name`, `restaurant_name` (snake_case)
- ✅ Utilise: `user.first_name`, `user.last_name` (snake_case)

**Incohérence:**
- ⚠️ Le frontend utilise `user.first_name` (snake_case) au lieu de `user.firstName` (camelCase)
- ⚠️ Pas de normalisation côté frontend

---

## 2. TABLE PLACES

### Base de Données (snake_case)
```sql
- id (UUID)
- user_id (UUID)
- name (VARCHAR)
- description (TEXT) - si existe
- address (TEXT)
- phone (VARCHAR) - si existe
- image_url (TEXT)
- logo_url (TEXT)
- color (VARCHAR)
- font (VARCHAR)
- number_of_tables (INTEGER) - ajouté via migration
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP) - ajouté via migration
```

### Backend
**placeController.js:**
- ✅ Reçoit: données en camelCase ou snake_case (mixte)
- ✅ Retourne: données en snake_case directement depuis BD

**Problèmes identifiés:**
- ⚠️ Pas de transformation systématique
- ⚠️ Le modèle `Place.create()` attend `userId` mais la BD utilise `user_id`

### Frontend
**PlaceForm.js, Places.js:**
- ⚠️ Utilise mixte: `place.name`, `place.image_url`, `place.logo_url`
- ⚠️ Pas de normalisation

---

## 3. TABLE CATEGORIES

### Base de Données (snake_case)
```sql
- id (UUID)
- place_id (UUID)
- name (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP) - ajouté via migration
- display_order (INTEGER) - ajouté via migration
```

### Backend
**categoryController.js:**
- ✅ Reçoit: `name`, `placeId` (camelCase)
- ✅ Convertit: `placeId` → `place_id` pour BD
- ✅ Retourne: snake_case directement

### Frontend
**CategoryListEnhanced.js, Place.js:**
- ✅ Utilise: `category.id`, `category.name`, `category.place_id`
- ⚠️ Mixte entre camelCase et snake_case

---

## 4. TABLE MENU_ITEMS

### Base de Données (snake_case)
```sql
- id (UUID)
- place_id (UUID)
- category_id (UUID)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- image_url (TEXT)
- is_available (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Backend
**menuItemController.js:**
- ✅ Reçoit: `categoryId`, `imageUrl`, `isAvailable` (camelCase)
- ✅ Convertit: `categoryId` → `category_id`, `imageUrl` → `image_url`, `isAvailable` → `is_available`
- ✅ Retourne: snake_case directement depuis BD

**models/menuItem.js:**
- ✅ Méthode `create()`: accepte camelCase, convertit en snake_case pour BD
- ✅ Méthode `update()`: accepte camelCase, convertit en snake_case

### Frontend
**MenuItemForm.js, CategoryWithItems.js:**
- ⚠️ Utilise mixte: `item.name`, `item.price`, `item.image_url`, `item.is_available`
- ⚠️ Envoie: `imageUrl`, `isAvailable` (camelCase)
- ⚠️ Reçoit: `image_url`, `is_available` (snake_case)

**Incohérence majeure:**
- ⚠️ Le frontend doit gérer deux formats: camelCase pour l'envoi, snake_case pour la réception

---

## 5. TABLE ORDERS

### Base de Données (snake_case)
```sql
- id (UUID)
- place_id (UUID)
- table_id (UUID) ✅ Ajouté via migration (peut être NULL)
- table_number (INTEGER) ⚠️ À supprimer après migration complète
- status (VARCHAR)
- total_amount (DECIMAL)
- created_at (TIMESTAMP)
```

### Backend
**orderController.js:**
- ✅ Accepte: `tableId` ou `tableNumber` (pour compatibilité)
- ✅ Utilise: `table_id` dans BD
- ✅ Retourne: `table_id`, `table_number` (les deux pour compatibilité)

**models/order.js:**
- ✅ Méthode `create()`: utilise `tableId` → `table_id`
- ✅ Méthode `findById()`: retourne `table_id`, `table_number`, `table_name`

**Problèmes identifiés:**
- ⚠️ Double colonne `table_id` et `table_number` (transition)
- ⚠️ Le code gère les deux formats pour compatibilité

### Frontend
**Orders.js, PaymentForm.js:**
- ⚠️ Utilise: `order.table`, `order.table_id`, `order.table_number`
- ⚠️ Envoie: `tableId` ou `tableNumber`

---

## 6. TABLE ORDER_ITEMS

### Base de Données (snake_case)
```sql
- id (UUID)
- order_id (UUID)
- menu_item_id (UUID)
- quantity (INTEGER)
- price (DECIMAL)
```

### Backend
**models/order.js:**
- ✅ Reçoit: `menuItemId`, `unitPrice` (camelCase)
- ✅ Convertit: `menuItemId` → `menu_item_id`, `unitPrice` → `price`
- ✅ Retourne: `menuItemId`, `unitPrice` (camelCase dans JSON)

### Frontend
**PaymentForm.js, Menu.js:**
- ✅ Utilise: `item.menuItemId`, `item.quantity`, `item.unitPrice`

---

## 7. TABLE TABLES

### Base de Données (snake_case)
```sql
- id (UUID)
- place_id (UUID)
- name (VARCHAR)
- status (VARCHAR)
- created_at (TIMESTAMP)
```

### Backend
**tableController.js:**
- ✅ Reçoit: `name`, `status`, `placeId` (camelCase)
- ✅ Convertit: `placeId` → `place_id`
- ✅ Retourne: snake_case directement

### Frontend
**TablesManagerModern.js, Place.js:**
- ⚠️ Utilise mixte: `table.id`, `table.name`, `table.status`, `table.place_id`

---

## RÉSUMÉ DES INCOHÉRENCES IDENTIFIÉES

### 🔴 Problèmes Critiques

1. **Format de données incohérent entre couches**
   - Backend retourne snake_case directement depuis BD
   - Frontend doit gérer snake_case et camelCase
   - Pas de normalisation systématique

2. **Table ORDERS - Double colonne**
   - `table_id` (UUID) et `table_number` (INTEGER) coexistent
   - Migration incomplète
   - Code gère les deux formats (complexité)

3. **Transformation des données manquante**
   - Pas de middleware de transformation automatique
   - Chaque contrôleur gère sa propre conversion
   - Risque d'erreurs et d'incohérences

### 🟡 Problèmes Moyens

4. **Noms de champs mixtes dans le frontend**
   - Utilise `user.first_name` (snake_case) au lieu de `user.firstName`
   - Utilise `item.image_url` (snake_case) au lieu de `item.imageUrl`
   - Utilise `item.is_available` (snake_case) au lieu de `item.isAvailable`

5. **Schéma BD incomplet dans db.sql**
   - Ligne 54: syntaxe corrompue (doublon ALTER TABLE)
   - Colonnes manquantes dans le schéma initial
   - Dépendance aux migrations

6. **Modèles backend incohérents**
   - `Place.create()` utilise `userId` mais BD attend `user_id`
   - Pas de transformation automatique dans les modèles

### 🟢 Améliorations Recommandées

7. **Normalisation des données**
   - Créer un middleware de transformation snake_case ↔ camelCase
   - Standardiser les réponses API en camelCase
   - Utiliser camelCase dans tout le frontend

8. **Documentation des formats**
   - Documenter les formats attendus/reçus pour chaque endpoint
   - Créer des types TypeScript ou JSDoc

9. **Tests de cohérence**
   - Tests unitaires pour vérifier les transformations
   - Tests d'intégration pour vérifier le flux complet

---

## RECOMMANDATIONS

### Priorité 1 (Critique)
1. ✅ **FAIT**: Ajouter les colonnes `first_name`, `last_name`, `restaurant_name` à la table users
2. ⚠️ **À FAIRE**: Créer un middleware de transformation automatique snake_case ↔ camelCase
3. ⚠️ **À FAIRE**: Compléter la migration `table_number` → `table_id` dans orders

### Priorité 2 (Important)
4. Standardiser les réponses API en camelCase
5. Normaliser l'utilisation des champs dans le frontend (tout en camelCase)
6. Corriger le schéma db.sql (ligne 54)

### Priorité 3 (Amélioration)
7. Ajouter des types TypeScript ou JSDoc
8. Créer des tests de cohérence
9. Documenter les formats de données

---

## MAPPING DES CHAMPS PAR TABLE

### USERS
| Frontend (camelCase) | Backend (snake_case) | BD (snake_case) | Statut |
|---------------------|---------------------|-----------------|--------|
| firstName | first_name | first_name | ✅ |
| lastName | last_name | last_name | ✅ |
| restaurantName | restaurant_name | restaurant_name | ✅ |
| email | email | email | ✅ |
| username | username | username | ✅ |

### PLACES
| Frontend | Backend | BD | Statut |
|----------|---------|----|--------|
| name | name | name | ✅ |
| imageUrl | image_url | image_url | ⚠️ Mixte |
| logoUrl | logo_url | logo_url | ⚠️ Mixte |
| userId | user_id | user_id | ⚠️ Mixte |
| numberOfTables | number_of_tables | number_of_tables | ⚠️ Mixte |

### MENU_ITEMS
| Frontend | Backend | BD | Statut |
|----------|---------|----|--------|
| categoryId | category_id | category_id | ✅ |
| imageUrl | image_url | image_url | ⚠️ Mixte |
| isAvailable | is_available | is_available | ⚠️ Mixte |
| placeId | place_id | place_id | ⚠️ Mixte |

### ORDERS
| Frontend | Backend | BD | Statut |
|----------|---------|----|--------|
| tableId | table_id | table_id | ⚠️ Transition |
| tableNumber | table_number | table_number | ⚠️ À supprimer |
| placeId | place_id | place_id | ⚠️ Mixte |

---

## CONCLUSION

L'application présente des **incohérences significatives** dans le format des données entre les couches. Le principal problème est l'absence de normalisation systématique :

- **Backend** : Retourne snake_case directement depuis la BD
- **Frontend** : Doit gérer les deux formats (snake_case et camelCase)
- **BD** : Utilise snake_case (standard PostgreSQL)

**Recommandation principale** : Implémenter un middleware de transformation automatique pour normaliser toutes les données en camelCase côté API, permettant au frontend d'utiliser uniquement camelCase.

