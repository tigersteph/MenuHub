# Corrections du Chargement des Données - Page Place.js

## Date: 2024-01-XX

---

## 🎯 OBJECTIF

S'assurer que la page `Place.js` charge uniquement les données des établissements appartenant à l'utilisateur connecté, avec une gestion d'erreur appropriée.

---

## 🔍 PROBLÈMES IDENTIFIÉS

### 1. Extraction incorrecte des données

**Problème**: Le backend retourne `{ success: true, data: [...] }` mais le frontend utilisait directement la réponse sans extraire `data`.

**Impact**: Les données n'étaient pas correctement extraites, causant des erreurs de type ou des données `undefined`.

**Fichiers affectés**:
- `qrmenu_frontend/src/pages/Place.js` (ligne 105)
- `qrmenu_frontend/src/hooks/usePlaceData.js` (lignes 25, 62)

### 2. Absence de vérification de propriété côté frontend

**Problème**: Le frontend ne vérifiait pas si l'établissement demandé (`params.id`) appartenait à l'utilisateur avant de charger les données.

**Impact**: Tentative de chargement d'un établissement qui n'appartient pas à l'utilisateur, causant des erreurs 401 après la requête.

**Fichiers affectés**:
- `qrmenu_frontend/src/pages/Place.js` (ligne 105-131)

### 3. Gestion d'erreur insuffisante

**Problème**: Les erreurs d'autorisation n'étaient pas gérées spécifiquement, et l'utilisateur n'était pas redirigé en cas d'accès non autorisé.

**Impact**: Mauvaise expérience utilisateur, pas de feedback clair en cas d'erreur.

**Fichiers affectés**:
- `qrmenu_frontend/src/hooks/usePlaceData.js` (lignes 27-35, 64-72)

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. Extraction correcte des données

#### `qrmenu_frontend/src/pages/Place.js` (ligne 105)

**Avant**:
```javascript
const places = await fetchPlaces(auth.token);
if (places && places.length > 0) {
  setAllPlaces(places);
  // ...
}
```

**Après**:
```javascript
const response = await fetchPlaces(auth.token);
// Extraire les données depuis la réponse standardisée { success: true, data: [...] }
const placesArray = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

if (placesArray && placesArray.length > 0) {
  setAllPlaces(placesArray);
  // ...
}
```

#### `qrmenu_frontend/src/hooks/usePlaceData.js` (ligne 25)

**Avant**:
```javascript
const data = await fetchPlace(placeId, token);
if (data) setPlace(data);
```

**Après**:
```javascript
const response = await fetchPlace(placeId, token);
// Extraire les données depuis la réponse standardisée { success: true, data: {...} }
const placeData = response?.data || response;

if (placeData) {
  setPlace(placeData);
} else {
  throw new Error('Aucune donnée reçue pour cet établissement');
}
```

#### `qrmenu_frontend/src/hooks/usePlaceData.js` (ligne 62)

**Avant**:
```javascript
const data = await fetchTables(placeId, token);
if (data) setTables(data);
```

**Après**:
```javascript
const response = await fetchTables(placeId, token);
// Extraire les données depuis la réponse standardisée { success: true, data: [...] }
const tablesData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

if (tablesData) {
  setTables(tablesData);
}
```

### 2. Vérification de propriété côté frontend

#### `qrmenu_frontend/src/pages/Place.js` (ligne 105-131)

**Ajout**:
```javascript
// Vérifier que l'établissement demandé appartient à l'utilisateur
if (params.id) {
  const requestedPlace = placesArray.find(p => p.id === params.id);
  if (requestedPlace) {
    // L'établissement appartient à l'utilisateur
    setSelectedPlaceId(params.id);
  } else {
    // L'établissement n'appartient pas à l'utilisateur ou n'existe pas
    toast.error('Cet établissement ne vous appartient pas ou n\'existe pas');
    history.push('/places');
    return;
  }
}
```

#### `qrmenu_frontend/src/pages/Place.js` (ligne 175-192)

**Ajout dans le useEffect de chargement**:
```javascript
// Si on a déjà chargé les établissements, vérifier que celui demandé appartient à l'utilisateur
if (allPlaces.length > 0) {
  const requestedPlace = allPlaces.find(p => p.id === params.id);
  if (!requestedPlace) {
    // L'établissement n'appartient pas à l'utilisateur
    toast.error('Cet établissement ne vous appartient pas');
    history.push('/places');
    return;
  }
}
```

### 3. Gestion améliorée des erreurs

#### `qrmenu_frontend/src/hooks/usePlaceData.js` (ligne 27-35)

**Avant**:
```javascript
if (errorMsg.includes('UNAUTHORIZED') || errorMsg.includes('401')) {
  toast.error('Session expirée. Veuillez vous reconnecter.');
}
```

**Après**:
```javascript
// Gérer les erreurs d'autorisation (établissement n'appartient pas à l'utilisateur)
if (errorMsg.includes('UNAUTHORIZED') || errorMsg.includes('401') || 
    errorMsg.includes('non autorisé') || errorMsg.includes('propriétaire')) {
  toast.error('Vous n\'êtes pas autorisé à accéder à cet établissement');
  setError('Accès non autorisé');
  // Ne pas recharger pour éviter une boucle
  return;
}
```

#### `qrmenu_frontend/src/hooks/usePlaceData.js` (ligne 64-72)

**Avant**:
```javascript
if (errorMsg.includes('UNAUTHORIZED') || errorMsg.includes('401')) {
  toast.error('Session expirée. Veuillez vous reconnecter.');
}
```

**Après**:
```javascript
if (errorMsg.includes('UNAUTHORIZED') || errorMsg.includes('401') ||
    errorMsg.includes('non autorisé') || errorMsg.includes('propriétaire')) {
  toast.error('Vous n\'êtes pas autorisé à accéder aux tables de cet établissement');
  setError('Accès non autorisé');
  return;
}
```

#### `qrmenu_frontend/src/pages/Place.js` (ligne 194-210)

**Ajout dans le useEffect de chargement**:
```javascript
catch (err) {
  const errorMsg = err.message || 'Erreur lors du chargement des données';
  
  // Si erreur d'autorisation, rediriger
  if (errorMsg.includes('non autorisé') || errorMsg.includes('propriétaire') || 
      errorMsg.includes('UNAUTHORIZED') || errorMsg.includes('401') ||
      errorMsg.includes('Accès non autorisé')) {
    toast.error('Vous n\'êtes pas autorisé à accéder à cet établissement');
    history.push('/places');
    return;
  }
  
  setError(errorMsg);
  toast.error('Erreur lors du chargement des données');
}
```

---

## 🔒 SÉCURITÉ BACKEND (DÉJÀ EN PLACE)

### Vérifications existantes

1. **`getUserPlaces`** (`placeController.js` ligne 199):
   - Filtre par `req.user.id` : `Place.findByUserId(req.user.id)`
   - ✅ Sécurisé

2. **`getPlace`** (`placeController.js` ligne 98):
   - Vérifie la propriété : `Place.isOwner(place.id, req.user.id)`
   - ✅ Sécurisé

3. **`getTablesByPlace`** (`tableController.js` ligne 54):
   - Vérifie la propriété : `Place.isOwner(placeId, req.user.id)`
   - ✅ Sécurisé

4. **Routes protégées**:
   - Toutes les routes nécessitent `authenticate` middleware
   - ✅ Sécurisé

---

## 📋 FLUX DE CHARGEMENT CORRIGÉ

### 1. Chargement initial (Place.js)

```
1. useEffect se déclenche avec params.id et auth.token
2. fetchAllPlaces() est appelé
3. fetchPlaces(auth.token) → GET /api/places
4. Backend: getUserPlaces filtre par req.user.id
5. Backend retourne { success: true, data: [...] }
6. Frontend extrait placesArray = response.data
7. Frontend vérifie si params.id est dans placesArray
8. Si oui → setSelectedPlaceId(params.id)
9. Si non → toast.error + redirection vers /places
```

### 2. Chargement des détails (usePlaceData)

```
1. loadPlace() est appelé avec placeId et token
2. fetchPlace(placeId, token) → GET /api/places/:id
3. Backend: getPlace vérifie Place.isOwner(place.id, req.user.id)
4. Si non propriétaire → Backend retourne 401 Unauthorized
5. Si propriétaire → Backend retourne { success: true, data: {...} }
6. Frontend extrait placeData = response.data
7. Frontend gère les erreurs d'autorisation avec redirection
```

### 3. Chargement des tables (usePlaceData)

```
1. loadTables() est appelé avec placeId et token
2. fetchTables(placeId, token) → GET /api/tables/place/:placeId
3. Backend: getTablesByPlace vérifie Place.isOwner(placeId, req.user.id)
4. Si non propriétaire → Backend retourne 401 Unauthorized
5. Si propriétaire → Backend retourne [...]
6. Frontend extrait tablesData = response.data (ou response si tableau)
7. Frontend gère les erreurs d'autorisation
```

---

## ✅ RÉSULTAT

### Avant les corrections

- ❌ Données non extraites correctement
- ❌ Tentative de chargement d'établissements non autorisés
- ❌ Messages d'erreur peu clairs
- ❌ Pas de redirection en cas d'accès non autorisé

### Après les corrections

- ✅ Extraction correcte des données depuis `response.data`
- ✅ Vérification de propriété avant chargement
- ✅ Messages d'erreur clairs et spécifiques
- ✅ Redirection automatique en cas d'accès non autorisé
- ✅ Double vérification (frontend + backend)

---

## 🧪 TESTS RECOMMANDÉS

1. **Test d'accès autorisé**:
   - Se connecter avec un compte
   - Accéder à `/places/:id` où `:id` appartient à l'utilisateur
   - ✅ Les données doivent se charger correctement

2. **Test d'accès non autorisé**:
   - Se connecter avec un compte
   - Accéder à `/places/:id` où `:id` n'appartient pas à l'utilisateur
   - ✅ Message d'erreur affiché
   - ✅ Redirection vers `/places`

3. **Test de chargement initial**:
   - Se connecter avec un compte ayant plusieurs établissements
   - Accéder à `/places/:id` directement
   - ✅ L'établissement doit être chargé si autorisé

4. **Test d'erreur réseau**:
   - Simuler une erreur réseau
   - ✅ Message d'erreur approprié affiché

---

## 📝 NOTES

- Le backend vérifie toujours la propriété, même si le frontend le fait aussi (défense en profondeur)
- Les erreurs d'autorisation sont gérées de manière cohérente dans tout le code
- La redirection vers `/places` permet à l'utilisateur de voir ses établissements autorisés

