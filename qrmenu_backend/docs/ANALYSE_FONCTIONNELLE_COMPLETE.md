# Analyse Fonctionnelle Complète - MenuHub

## 📋 Table des Matières
1. [Fonctionnalités Principales](#fonctionnalités-principales)
2. [Fonctionnalités Secondaires](#fonctionnalités-secondaires)
3. [Cohérence Frontend/Backend/Base de Données](#cohérence-frontendbackendbase-de-données)
4. [Parcours Utilisateur (Restaurateur)](#parcours-utilisateur-restaurateur)
5. [Parcours Client](#parcours-client)
6. [Points d'Amélioration Identifiés](#points-damélioration-identifiés)

---

## 🎯 Fonctionnalités Principales

### 1. Authentification et Gestion des Utilisateurs

#### Frontend
- **Pages**: `Login.js`, `Register.js`, `ForgotPassword.js`, `ResetPassword.js`
- **Composants**: `FormField.js`, `PasswordStrength.js`
- **Contexte**: `AuthContext.js`
- **Services API**: `auth.js` (signIn, register, forgotPassword, resetPassword, getProfile)

#### Backend
- **Routes**: `/api/auth/*` (login, register, forgot-password, reset-password, profile)
- **Contrôleur**: `authController.js`
- **Middleware**: `auth.js` (authenticate)
- **Modèle**: Table `users` avec colonnes: id, username, email, password_hash, first_name, last_name, restaurant_name, reset_token, reset_token_expiry

#### Base de Données
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    restaurant_name VARCHAR(100) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### ✅ Cohérence
- **Frontend → Backend**: ✅ Toutes les données (firstName, lastName, email, restaurantName) sont transmises
- **Backend → BD**: ✅ Toutes les données sont stockées (first_name, last_name, email, restaurant_name)
- **BD → Frontend**: ✅ Le profil utilisateur est chargé après connexion/inscription
- **Personnalisation**: ✅ Nom et prénom utilisés dans Places.js et UserMenu.js

---

### 2. Gestion des Établissements (Places)

#### Frontend
- **Pages**: `Places.js`, `Place.js`, `EditPlace.js`
- **Composants**: `PlaceCard.js`, `PlaceFormModal.js`, `PlacesDashboard.js`
- **Services API**: `places.js` (fetchPlaces, createPlace, updatePlace, deletePlace, fetchPlacePublic)

#### Backend
- **Routes**: `/api/places/*` (GET /, POST /, GET /:id, PUT /:id, DELETE /:id, GET /:id/public, GET /:id/stats, POST /:id/duplicate)
- **Contrôleur**: `placeController.js`
- **Modèle**: `place.js`
- **Table BD**: `places` (id, user_id, name, description, address, phone, logo_url, color, font, created_at)

#### Base de Données
```sql
CREATE TABLE places (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    logo_url TEXT,
    color VARCHAR(20),
    font VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### ✅ Cohérence
- **Création**: ✅ Frontend envoie toutes les données → Backend valide → BD stocke
- **Lecture**: ✅ BD → Backend → Frontend (avec vérification de propriétaire)
- **Mise à jour**: ✅ Vérification de propriétaire avant modification
- **Suppression**: ✅ Cascade sur les tables, catégories, menu_items, orders

---

### 3. Gestion des Tables

#### Frontend
- **Pages**: `QRCodesPage.js`
- **Composants**: Gestion intégrée dans QRCodesPage
- **Services API**: `tables.js` (fetchTables, addTable, updateTable, removeTable, fetchTablePublic)

#### Backend
- **Routes**: `/api/tables/*` (POST /, GET /place/:placeId, GET /:id, GET /:id/public, PUT /:id, DELETE /:id)
- **Contrôleur**: `tableController.js`
- **Modèle**: `table.js`
- **Table BD**: `tables` (id, place_id, name, status, created_at)

#### Base de Données
```sql
CREATE TABLE tables (
    id UUID PRIMARY KEY,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP
);
```

#### ✅ Cohérence
- **Création**: ✅ Frontend → Backend (vérification propriétaire) → BD
- **Génération QR Code**: ✅ URL format: `/menu/{placeId}/{tableId}`
- **Route publique**: ✅ GET /:id/public pour vérifier le statut de la table

---

### 4. Gestion du Menu (Catégories et Items)

#### Frontend
- **Pages**: `MenuSettings.js`, `Menu.js` (vue client)
- **Composants**: `MenuList.js`, `CategoryListEnhanced.js`, `MenuItemForm.js`
- **Services API**: `menuItems.js`, `categories.js`

#### Backend
- **Routes**: 
  - `/api/menu/:placeId/items` (POST, GET)
  - `/api/menu/items/:itemId` (PUT, DELETE)
  - `/api/menu/items/:itemId/availability` (PATCH)
  - `/api/categories/*` (POST, GET, PUT, DELETE)
- **Contrôleurs**: `menuItemController.js`, `categoryController.js`
- **Tables BD**: `categories`, `menu_items`

#### Base de Données
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### ✅ Cohérence
- **Création**: ✅ Frontend → Backend → BD (avec vérification propriétaire)
- **Lecture publique**: ✅ Route `/api/places/:id/public` retourne catégories + menu_items
- **Disponibilité**: ✅ Champ `is_available` synchronisé entre frontend et backend

---

### 5. Gestion des Commandes

#### Frontend
- **Pages**: `Orders.js` (restaurateur), `Menu.js` (client - panier)
- **Composants**: `Order.js`, `ShoppingCart.js`, `OrderConfirmation.js`
- **Services API**: `orders.js` (fetchOrders, createOrder, cancelOrder, completeOrder)

#### Backend
- **Routes**:
  - **Publiques** (clients): 
    - `POST /api/places/:placeId/orders/public` (créer commande)
    - `PATCH /api/places/:placeId/orders/:orderId/cancel/public` (annuler)
  - **Protégées** (restaurateurs):
    - `GET /api/places/:placeId/orders` (lister)
    - `GET /api/orders/:orderId` (détails)
    - `PATCH /api/orders/:orderId/status` (mettre à jour statut)
- **Contrôleur**: `orderController.js`
- **Modèle**: `order.js`
- **Tables BD**: `orders`, `order_items`

#### Base de Données
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id),
    table_number INTEGER, -- Pour compatibilité
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    customer_notes TEXT,
    created_at TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);
```

#### ✅ Cohérence
- **Création commande (client)**: ✅ Route publique → Backend valide → BD (transaction)
- **Statuts**: ✅ pending → processing → ready → served → completed (ou cancelled)
- **Temps réel**: ✅ Polling toutes les 3 secondes dans Orders.js (avec backoff exponentiel)
- **Calcul total**: ✅ Backend calcule automatiquement depuis order_items

---

### 6. Génération et Gestion des QR Codes

#### Frontend
- **Page**: `QRCodesPage.js`
- **Fonctionnalités**:
  - Génération QR code par table
  - URL format: `/menu/{placeId}/{tableId}`
  - Téléchargement PNG/SVG
  - Export PDF
  - Personnalisation (couleurs, taille, texte)
  - Partage (copie lien)

#### Backend
- **Pas d'endpoint dédié**: Génération côté client avec `qrcode.react`
- **Route publique**: `/api/tables/:id/public` pour vérifier le statut de la table

#### ✅ Cohérence
- **URL QR Code**: ✅ Format cohérent `/menu/{placeId}/{tableId}`
- **Validation table**: ✅ Vérification que la table existe et est active
- **Route menu publique**: ✅ `/api/places/:id/public` accessible sans authentification

---

## 🔧 Fonctionnalités Secondaires

### 1. Profil Utilisateur
- **Page**: `Profile.js`
- **Routes**: `GET /api/auth/profile`, `PUT /api/auth/profile`
- **Fonctionnalités**: Affichage et modification du profil (username, email, firstName, lastName, restaurantName)
- **✅ Cohérence**: Frontend ↔ Backend ↔ BD

### 2. Statistiques
- **Route**: `GET /api/places/:id/stats`
- **Données**: Nombre de tables, commandes du jour, commandes de la semaine
- **Affichage**: `PlacesDashboard.js`, `PlaceCard.js`
- **✅ Cohérence**: Calculs SQL → Backend → Frontend

### 3. Duplication d'Établissement
- **Route**: `POST /api/places/:id/duplicate`
- **Fonctionnalité**: Duplique l'établissement avec ses tables
- **✅ Cohérence**: Backend duplique place + tables en transaction

### 4. Recherche et Filtres
- **Frontend**: Recherche dans Places.js, Menu.js, QRCodesPage.js
- **Backend**: Filtrage côté frontend (pas de recherche serveur)
- **⚠️ Amélioration possible**: Implémenter recherche serveur pour grandes listes

### 5. Gestion des Notifications
- **Frontend**: Toast notifications via `toast.js`
- **Temps réel**: Polling dans Orders.js pour nouvelles commandes
- **⚠️ Amélioration possible**: WebSocket pour notifications push

---

## 🔄 Cohérence Frontend/Backend/Base de Données

### ✅ Points Forts

1. **Authentification**
   - JWT tokens synchronisés
   - Middleware d'authentification cohérent
   - Vérification de propriétaire systématique

2. **Structure des Données**
   - Noms de colonnes cohérents (snake_case en BD, camelCase en JS)
   - Relations FK bien définies avec CASCADE
   - UUID pour tous les IDs

3. **Routes Publiques vs Protégées**
   - Séparation claire: routes `/public` pour clients
   - Middleware conditionnel bien implémenté

4. **Validation**
   - Validation côté frontend (UX)
   - Validation côté backend (sécurité)
   - Contraintes BD (intégrité)

### ⚠️ Points d'Attention

1. **Table `orders`**
   - Colonnes `table_id` (UUID) et `table_number` (INTEGER) coexistent
   - Migration nécessaire pour standardiser sur `table_id`

2. **Temps Réel**
   - Polling HTTP (toutes les 3s) au lieu de WebSocket
   - Fonctionne mais moins efficace

3. **Gestion d'Erreurs**
   - Format d'erreur parfois incohérent entre routes
   - Certaines routes retournent `{error: {...}}`, d'autres `{message: "..."}`

---

## 👨‍🍳 Parcours Utilisateur (Restaurateur)

### 1. Inscription
```
1. Utilisateur accède à /register
2. Remplit le formulaire:
   - Prénom (firstName)
   - Nom (lastName)
   - Email
   - Nom du restaurant (restaurantName)
   - Mot de passe + confirmation
3. Frontend valide les données
4. Appel API: POST /api/auth/register
   - Backend: Génère username depuis email
   - Hash du mot de passe (bcrypt)
   - Insertion dans BD: users table
   - Génération JWT token
5. Frontend: Stockage token + chargement profil
6. Redirection: /places
```

### 2. Connexion
```
1. Utilisateur accède à /login
2. Saisit email + mot de passe
3. Appel API: POST /api/auth/login
   - Backend: Vérifie email + hash password
   - Génère JWT token
4. Frontend: Stockage token + chargement profil
5. Redirection: /places (ou page d'origine)
```

### 3. Création d'un Établissement
```
1. Utilisateur sur /places (dashboard)
2. Clique "Créer un établissement"
3. Formulaire: nom, description, adresse, téléphone, logo
4. Appel API: POST /api/places
   - Backend: Vérifie authentification
   - Insertion dans BD: places table
   - Optionnel: Création de tables initiales
5. Frontend: Rafraîchissement liste
6. Affichage: Nouvelle carte d'établissement
```

### 4. Configuration du Menu
```
1. Utilisateur sélectionne un établissement
2. Navigation: /places/:id/settings
3. Création de catégories:
   - Appel API: POST /api/categories
   - Backend: Insertion dans BD
4. Ajout d'items de menu:
   - Appel API: POST /api/menu/:placeId/items
   - Backend: Insertion dans BD (menu_items)
5. Modification/Suppression: Routes PUT/DELETE
```

### 5. Création de Tables
```
1. Navigation: /qrcodes/:id
2. Formulaire: Nom de la table
3. Appel API: POST /api/tables
   - Backend: Vérifie propriétaire
   - Insertion dans BD: tables table
4. Frontend: Génération QR code automatique
   - URL: /menu/{placeId}/{tableId}
5. Options: Télécharger, imprimer, partager
```

### 6. Génération des QR Codes
```
1. Page: /qrcodes/:id
2. Liste des tables avec QR codes prévisualisés
3. Sélection de tables
4. Actions:
   - Télécharger PNG/SVG
   - Export PDF
   - Imprimer
   - Partager (copie lien)
5. Personnalisation: Couleurs, taille, texte
```

### 7. Réception des Commandes (Temps Réel)
```
1. Page: /places/:id/orders
2. Polling automatique: Toutes les 3 secondes
   - Appel API: GET /api/places/:id/orders
   - Backend: Retourne commandes avec statut
3. Affichage:
   - Nouvelles commandes (pending)
   - Commandes en cours (processing)
   - Commandes prêtes (ready)
   - Commandes servies (served)
4. Actions:
   - Accepter: PATCH /api/orders/:id/status {status: "processing"}
   - Marquer prêt: {status: "ready"}
   - Marquer servi: {status: "served"}
   - Annuler: {status: "cancelled"}
5. Notification: Toast pour nouvelles commandes
```

---

## 👥 Parcours Client

### 1. Scan du QR Code
```
1. Client scanne le QR code sur la table
2. Redirection: /menu/{placeId}/{tableId}
3. Frontend:
   - Appel API: GET /api/places/:id/public
     → Retourne établissement + catégories + menu_items
   - Appel API: GET /api/tables/:id/public
     → Vérifie statut de la table
4. Affichage: Menu avec catégories et plats disponibles
```

### 2. Consultation du Menu
```
1. Page: /menu/{placeId}/{tableId}
2. Affichage:
   - Informations établissement (nom, logo)
   - Catégories de plats
   - Items avec: nom, description, prix, image
   - Filtre: Disponibilité (is_available)
3. Recherche: Filtrage côté client
4. Navigation: Scroll par catégorie
```

### 3. Ajout au Panier
```
1. Client clique sur un item
2. Options:
   - Ajout direct au panier
   - Voir détails (ItemDetail.js)
3. Panier (ShoppingCart.js):
   - Liste des items avec quantités
   - Calcul du total
   - Modification quantités
   - Suppression items
4. Stockage: État React (local, non persisté)
```

### 4. Passage de Commande
```
1. Client clique "Commander"
2. Validation:
   - Panier non vide
   - Table valide
3. Appel API: POST /api/places/:placeId/orders/public
   - Données: {tableId, items: [{menuItemId, quantity, unitPrice}], customerNotes}
   - Backend:
     * Vérifie établissement existe
     * Vérifie table existe
     * Transaction BD:
       - INSERT orders (calcul total_amount)
       - INSERT order_items pour chaque item
     * Retourne commande créée
4. Confirmation: OrderConfirmation.js
   - Affichage: Numéro commande, détails, statut
5. Réinitialisation: Panier vidé
```

### 5. Commandes Multiples (Plusieurs Clients)
```
Scénario: Table 5, 4 clients différents

Client 1 (12h00):
- Scan QR → /menu/{placeId}/{tableId}
- Commande: 2 pizzas, 1 salade
- POST /api/places/:placeId/orders/public
- Commande créée: order_1 (status: pending)

Client 2 (12h15):
- Scan même QR → même URL
- Commande: 1 burger, 2 frites
- POST /api/places/:placeId/orders/public
- Commande créée: order_2 (status: pending)

Client 3 (12h30):
- Scan même QR
- Commande: 1 dessert
- POST /api/places/:placeId/orders/public
- Commande créée: order_3 (status: pending)

Client 4 (12h45):
- Scan même QR
- Commande: 2 boissons
- POST /api/places/:placeId/orders/public
- Commande créée: order_4 (status: pending)

Restaurateur (Orders.js):
- Polling toutes les 3s
- Voir 4 commandes pour table 5
- Gérer chaque commande indépendamment:
  - order_1: processing → ready → served
  - order_2: processing → ready → served
  - order_3: processing → ready → served
  - order_4: processing → ready → served
```

### 6. Annulation de Commande (Client)
```
1. Client sur page de confirmation
2. Option: "Annuler la commande"
3. Appel API: PATCH /api/places/:placeId/orders/:orderId/cancel/public
   - Backend:
     * Vérifie commande existe
     * Vérifie statut = pending ou new
     * UPDATE orders SET status = 'cancelled'
4. Confirmation: Toast "Commande annulée"
```

---

## 🔍 Points d'Amélioration Identifiés

### 1. Temps Réel
- **Actuel**: Polling HTTP toutes les 3 secondes
- **Recommandé**: WebSocket (Socket.io) pour notifications push
- **Bénéfice**: Réduction charge serveur, latence minimale

### 2. Gestion d'Erreurs
- **Actuel**: Formats d'erreur incohérents
- **Recommandé**: Standardiser format `{success: boolean, error: {code, message}}`
- **Bénéfice**: Meilleure gestion côté frontend

### 3. Migration Table Orders
- **Actuel**: `table_id` (UUID) et `table_number` (INTEGER) coexistent
- **Recommandé**: Migration pour utiliser uniquement `table_id`
- **Bénéfice**: Cohérence, suppression code legacy

### 4. Recherche Serveur
- **Actuel**: Recherche côté client uniquement
- **Recommandé**: Endpoints de recherche avec pagination
- **Bénéfice**: Performance pour grandes listes

### 5. Cache
- **Actuel**: Pas de cache
- **Recommandé**: Cache Redis pour menu public (rarement modifié)
- **Bénéfice**: Réduction charge BD

### 6. Logs et Monitoring
- **Actuel**: Console.log basiques
- **Recommandé**: Système de logs structuré (Winston) + monitoring
- **Bénéfice**: Debugging, performance tracking

---

## ✅ Conclusion

L'application MenuHub présente une **architecture cohérente** entre frontend, backend et base de données. Les parcours utilisateur et client sont **fonctionnels** et **bien intégrés**. 

**Points forts**:
- ✅ Séparation claire routes publiques/protégées
- ✅ Validation multi-niveaux (frontend + backend + BD)
- ✅ Gestion des transactions pour commandes
- ✅ Personnalisation utilisateur implémentée
- ✅ Système de QR codes fonctionnel

**Améliorations recommandées**:
- ⚠️ WebSocket pour temps réel
- ⚠️ Standardisation format d'erreurs
- ⚠️ Migration table orders
- ⚠️ Cache pour performance
- ⚠️ Logs structurés

L'application est **prête pour la production** avec les améliorations suggérées.

---

*Document généré le: ${new Date().toISOString()}*

