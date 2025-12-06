# Vérification du Fonctionnement des Images et des Données d'Établissement

## Date: 2024-01-XX

---

## 🔍 ANALYSE DES IMAGES

### 1. Upload d'Images (Cloudinary)

**Frontend** (`qrmenu_frontend/src/services/cloudinary.js`):
- ✅ Service Cloudinary configuré
- ✅ Upload vers `https://api.cloudinary.com/v1_1/dtb7kciiu/image/upload`
- ✅ Preset: `menuhub_photos`
- ✅ Retourne `json.url` (URL de l'image)

**Composant ImageDropzone** (`qrmenu_frontend/src/forms/ImageDropzone.js`):
- ✅ Utilise `react-dropzone` pour le drag & drop
- ✅ Accepte: `.jpeg`, `.jpg`, `.png`, `.gif`, `.webp`
- ✅ Taille max: 5MB
- ✅ Appelle `uploadImage()` et passe l'URL à `onChange`
- ✅ Affiche un preview de l'image
- ✅ Permet de supprimer l'image

### 2. Stockage des Images dans la BD

**Schéma BD** (`qrmenu_backend/db.sql`):
```sql
CREATE TABLE places (
    ...
    image_url TEXT,
    logo_url TEXT,
    ...
);
```

**Problème identifié** ⚠️:
- Le schéma définit `image_url` ET `logo_url`
- Mais le modèle `Place.create()` n'utilise que `logo_url`
- Incohérence potentielle

### 3. Envoi des Données depuis le Frontend

**PlaceForm.js** (ligne 57):
```javascript
logo_url: logo  // ✅ Envoie logo_url
```

**Problème identifié** ⚠️:
- Le frontend envoie `logo_url` (snake_case)
- Mais après transformation automatique, le backend devrait recevoir `logoUrl` (camelCase)
- **Le middleware de transformation n'est pas activé** → Le backend reçoit `logo_url` directement

### 4. Réception dans le Backend

**placeController.js** (ligne 12):
```javascript
const { name, description, address, phone, logo_url, tables } = req.body;
```

**Place.create()** (ligne 5-10):
```javascript
static async create({ name, description, address, phone, userId, color, logo_url, font }) {
  const query = `
    INSERT INTO places (name, description, address, phone, user_id, logo_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`;
  const values = [name, description, address, phone, userId, logo_url];
```

**Problème identifié** ⚠️:
- Le modèle `Place.create()` n'utilise pas tous les paramètres (`color`, `font` sont ignorés)
- Seulement `logo_url` est stocké, pas `image_url`

### 5. Affichage dans le Frontend

**PlaceCard.js** (ligne 59):
```javascript
style={{ backgroundImage: `url('${place.logo_url || "/img/hero-restaurant.jpg"}')` }}
```

**Problème identifié** ⚠️:
- Le frontend lit `place.logo_url` (snake_case)
- Mais le backend envoie maintenant `place.logoUrl` (camelCase) après transformation
- **Incohérence** : Le frontend doit être mis à jour pour utiliser `logoUrl` avec fallback

---

## 🔍 ANALYSE DES DONNÉES D'ÉTABLISSEMENT

### 1. Création d'Établissement

**Frontend → Backend**:
```javascript
{
  name: string,
  description: string,
  address: string,
  phone: string,
  logo_url: string  // URL Cloudinary
}
```

**Backend → BD**:
```sql
INSERT INTO places (name, description, address, phone, user_id, logo_url)
VALUES ($1, $2, $3, $4, $5, $6)
```

**Problèmes identifiés** ⚠️:

1. **Champs manquants**:
   - `color` : Envoyé dans le modèle mais pas stocké
   - `font` : Envoyé dans le modèle mais pas stocké
   - `image_url` : Défini dans le schéma mais jamais utilisé

2. **Cohérence des noms**:
   - Frontend envoie: `logo_url` (snake_case)
   - Backend stocke: `logo_url` (snake_case) ✅
   - Backend retourne: `logoUrl` (camelCase) après transformation
   - Frontend lit: `logo_url` (snake_case) ❌ **INCOHÉRENT**

### 2. Récupération des Données

**getUserPlaces**:
- ✅ Retourne tous les établissements de l'utilisateur
- ✅ Utilise `success()` → Transforme en camelCase
- ⚠️ Le frontend doit lire en camelCase

**getPlace**:
- ✅ Retourne l'établissement avec catégories et plats
- ✅ Utilise `success()` → Transforme en camelCase
- ⚠️ Le frontend doit lire en camelCase

---

## 🐛 PROBLÈMES IDENTIFIÉS

### Problème 1: Incohérence logo_url / logoUrl

**Symptôme**: Les images peuvent ne pas s'afficher après la transformation automatique

**Cause**: 
- Backend envoie `logoUrl` (camelCase)
- Frontend lit `logo_url` (snake_case)

**Solution**: Mettre à jour le frontend pour utiliser `logoUrl` avec fallback

### Problème 2: Champs non stockés

**Symptôme**: `color` et `font` ne sont pas sauvegardés

**Cause**: 
- Le modèle `Place.create()` ne les inclut pas dans l'INSERT

**Solution**: Mettre à jour le modèle pour inclure tous les champs

### Problème 3: image_url vs logo_url

**Symptôme**: Confusion entre `image_url` et `logo_url`

**Cause**: 
- Le schéma définit les deux colonnes
- Seulement `logo_url` est utilisée

**Solution**: Clarifier l'usage ou supprimer `image_url` si non utilisé

---

## ✅ CORRECTIONS NÉCESSAIRES

### 1. Mettre à jour PlaceCard.js

```javascript
// Avant
place.logo_url

// Après
place.logoUrl || place.logo_url
```

### 2. Mettre à jour le modèle Place.create()

```javascript
// Ajouter color et font dans l'INSERT
INSERT INTO places (name, description, address, phone, user_id, logo_url, color, font)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
```

### 3. Vérifier l'usage de image_url

- Si non utilisé → Supprimer du schéma
- Si utilisé → Ajouter dans le modèle

---

## 📋 CHECKLIST DE VÉRIFICATION

### Images
- [ ] Upload Cloudinary fonctionne
- [ ] Image sauvegardée dans `logo_url`
- [ ] Image affichée dans PlaceCard
- [ ] Image affichée dans les formulaires d'édition

### Données d'Établissement
- [ ] Nom sauvegardé
- [ ] Description sauvegardée
- [ ] Adresse sauvegardée
- [ ] Téléphone sauvegardé
- [ ] Logo sauvegardé
- [ ] Color sauvegardé (si utilisé)
- [ ] Font sauvegardé (si utilisé)

### Cohérence
- [ ] Frontend envoie les bonnes données
- [ ] Backend stocke toutes les données
- [ ] Backend retourne les données en camelCase
- [ ] Frontend lit les données en camelCase (avec fallback)

---

## 🎯 RECOMMANDATIONS

1. **Immédiat**: Mettre à jour `PlaceCard.js` pour utiliser `logoUrl` avec fallback
2. **Court terme**: Mettre à jour le modèle `Place.create()` pour inclure `color` et `font`
3. **Moyen terme**: Clarifier l'usage de `image_url` vs `logo_url`
4. **Long terme**: Activer le middleware de transformation pour normaliser les requêtes

