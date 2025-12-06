# Guide de Test Complet - MenuHub

## 🧪 Tests à Effectuer Avant Production

### 1. Tests Backend (API)

#### Test de Santé
```bash
curl http://localhost:8000/api/health
```
**Résultat attendu** : `{"status":"OK","timestamp":"...","environment":"development"}`

#### Test d'Authentification
```bash
# Inscription
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "User",
    "restaurantName": "Test Restaurant"
  }'

# Connexion
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```
**Résultat attendu** : Token JWT retourné

#### Test Création Établissement
```bash
curl -X POST http://localhost:8000/api/places \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Restaurant Test",
    "address": "123 Test Street",
    "description": "Un restaurant de test"
  }'
```
**Résultat attendu** : Établissement créé avec UUID

#### Test Création Table
```bash
curl -X POST http://localhost:8000/api/tables \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Table 1",
    "place_id": "PLACE_UUID",
    "status": "active"
  }'
```
**Résultat attendu** : Table créée avec UUID

#### Test Création Commande (Publique)
```bash
curl -X POST http://localhost:8000/api/places/PLACE_UUID/orders/public \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "TABLE_UUID",
    "items": [
      {
        "menuItemId": "ITEM_UUID",
        "quantity": 2,
        "unitPrice": 15.50
      }
    ]
  }'
```
**Résultat attendu** : Commande créée avec `table_id` (UUID)

#### Test Récupération Commandes
```bash
curl -X GET http://localhost:8000/api/places/PLACE_UUID/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Résultat attendu** : Liste de commandes avec `table_name` affiché

### 2. Tests Frontend (Interface)

#### Test Workflow Client

1. **Accès Menu via QR Code**
   - Scanner ou accéder à `/menu/PLACE_UUID/TABLE_UUID`
   - ✅ Menu s'affiche correctement
   - ✅ Nom du restaurant visible
   - ✅ Catégories et plats affichés

2. **Sélection de Plats**
   - ✅ Ajouter des plats au panier
   - ✅ Quantité modifiable
   - ✅ Prix total calculé correctement
   - ✅ Notification toast affichée

3. **Passage de Commande**
   - ✅ Formulaire de commande accessible
   - ✅ Commande créée avec succès
   - ✅ Message de confirmation affiché
   - ✅ Numéro de commande visible

4. **Rafraîchissement Automatique**
   - ✅ Ouvrir le menu client
   - ✅ Modifier un plat côté restaurateur
   - ✅ Attendre 30 secondes
   - ✅ Changement visible automatiquement

#### Test Workflow Restaurateur

1. **Authentification**
   - ✅ Inscription fonctionne
   - ✅ Connexion fonctionne
   - ✅ Redirection après connexion

2. **Gestion Établissements**
   - ✅ Création établissement
   - ✅ Modification établissement
   - ✅ Suppression établissement (avec confirmation)
   - ✅ Affichage liste/grid/dashboard

3. **Gestion Tables**
   - ✅ Création table
   - ✅ Modification nom table
   - ✅ Suppression table
   - ✅ Statut table (active/inactive)

4. **Gestion Menu**
   - ✅ Création catégorie
   - ✅ Création plat
   - ✅ Modification plat
   - ✅ Duplication plat
   - ✅ Disponibilité plat (on/off)
   - ✅ Suppression plat

5. **Génération QR Codes**
   - ✅ QR code généré pour chaque table
   - ✅ URL correcte : `/menu/PLACE_UUID/TABLE_UUID`
   - ✅ Téléchargement PNG/SVG fonctionne
   - ✅ Impression fonctionne

6. **Réception Commandes**
   - ✅ Commandes reçues automatiquement (polling 3s)
   - ✅ Nom de table affiché (pas UUID)
   - ✅ Détails commande visibles
   - ✅ Actions disponibles (Accepter, Refuser, Prête, Terminer)
   - ✅ Statut mis à jour correctement

7. **Traductions**
   - ✅ Tous les textes traduits (FR/EN)
   - ✅ Changement de langue fonctionne
   - ✅ Préférence sauvegardée

### 3. Tests Base de Données

#### Vérification Migration
```sql
-- Vérifier que table_id existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name IN ('table_id', 'table_number');

-- Vérifier que les indexes existent
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('orders', 'menu_items', 'tables', 'categories');
```

#### Vérification Données
```sql
-- Vérifier les commandes avec table_id
SELECT o.id, o.table_id, t.name as table_name, o.status
FROM orders o
LEFT JOIN tables t ON o.table_id = t.id
LIMIT 10;

-- Vérifier que les nouvelles commandes utilisent table_id
SELECT COUNT(*) 
FROM orders 
WHERE table_id IS NOT NULL;
```

### 4. Tests Performance

#### Temps de Réponse API
- ✅ Health check < 50ms
- ✅ Authentification < 200ms
- ✅ Récupération commandes < 500ms
- ✅ Création commande < 300ms

#### Polling
- ✅ Commandes rafraîchies toutes les 3 secondes
- ✅ Menu rafraîchi toutes les 30 secondes
- ✅ Pas de surcharge serveur

### 5. Tests de Sécurité

#### Authentification
- ✅ Routes protégées nécessitent token
- ✅ Routes publiques accessibles sans token
- ✅ Token expire après 7 jours
- ✅ Mots de passe hashés (bcrypt)

#### CORS
- ✅ CORS configuré correctement
- ✅ En production, origine restreinte

#### Validation
- ✅ Données validées côté serveur
- ✅ Injection SQL protégée (paramètres)
- ✅ XSS protégé (React escape automatique)

## 📋 Checklist de Test

### Workflow Complet Client
- [ ] Scan QR code → Menu affiché
- [ ] Sélection plats → Panier mis à jour
- [ ] Passage commande → Confirmation reçue
- [ ] Rafraîchissement menu (30s) → Changements visibles

### Workflow Complet Restaurateur
- [ ] Création compte → Succès
- [ ] Création établissement → Succès
- [ ] Création tables → Succès
- [ ] Création menu → Succès
- [ ] Modification plats → Succès
- [ ] Génération QR codes → Succès
- [ ] Réception commandes (3s) → Succès
- [ ] Traitement commandes → Succès
- [ ] Nom de table affiché → Correct

### Base de Données
- [ ] Migration exécutée → Succès
- [ ] Indexes créés → Succès
- [ ] Nouvelles commandes utilisent `table_id` → Vérifié
- [ ] Nom de table récupéré → Vérifié

### Performance
- [ ] Temps de réponse API → Acceptable
- [ ] Polling fonctionne → Vérifié
- [ ] Pas de fuites mémoire → Vérifié

### Sécurité
- [ ] Authentification → Fonctionne
- [ ] CORS → Configuré
- [ ] Validation → En place

## 🐛 Tests de Régression

### Vérifier que les anciennes fonctionnalités fonctionnent toujours
- [ ] Connexion/Déconnexion
- [ ] Création/Modification/Suppression établissement
- [ ] Création/Modification/Suppression menu
- [ ] Création/Modification/Suppression tables
- [ ] Génération QR codes
- [ ] Réception commandes
- [ ] Traitement commandes

## 📝 Rapport de Test

Après chaque test, noter :
- ✅ Succès
- ❌ Échec (avec description)
- ⚠️ Problème mineur (avec description)

## 🔄 Tests Automatisés (Optionnel)

Pour l'avenir, considérer :
- Tests unitaires (Jest)
- Tests d'intégration (Supertest)
- Tests E2E (Cypress/Playwright)
