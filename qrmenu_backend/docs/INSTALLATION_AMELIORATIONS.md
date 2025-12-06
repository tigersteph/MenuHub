# Guide d'installation des améliorations UX

Ce guide explique comment installer et configurer les nouvelles fonctionnalités améliorant l'expérience utilisateur.

## 📋 Prérequis

- Node.js 14+ et npm
- PostgreSQL
- Redis (optionnel mais recommandé)

---

## 🚀 Installation

### 1. Backend

Les dépendances sont déjà installées dans `package.json` :
- `winston` : Logs structurés
- `redis` : Cache
- `socket.io` : WebSocket

Si nécessaire, réinstaller :
```bash
cd qrmenu_backend
npm install
```

### 2. Frontend

**Installer socket.io-client** :
```bash
cd qrmenu_frontend
npm install socket.io-client
```

### 3. Redis (optionnel)

**Option A : Docker (recommandé)**
```bash
docker run -d -p 6379:6379 --name redis-cache redis:alpine
```

**Option B : Installation locale**

Ubuntu/Debian :
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

macOS :
```bash
brew install redis
brew services start redis
```

Windows :
Télécharger depuis https://redis.io/download

### 4. Configuration

**Backend** : Créer/modifier `.env`
```env
# Redis (optionnel)
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379

# Logs
LOG_LEVEL=info

# Autres variables...
PORT=8000
NODE_ENV=development
# ...
```

**Frontend** : Aucune configuration supplémentaire nécessaire.

---

## ✅ Vérification

### 1. Démarrer Redis (si activé)
```bash
# Vérifier que Redis fonctionne
redis-cli ping
# Devrait répondre : PONG
```

### 2. Démarrer le backend
```bash
cd qrmenu_backend
npm run dev
```

Vérifier dans les logs :
- ✅ "Redis connected" (si Redis activé)
- ✅ "WebSocket service initialized"
- ✅ "Server started"

### 3. Démarrer le frontend
```bash
cd qrmenu_frontend
npm start
```

### 4. Tester WebSocket

1. Ouvrir la page des commandes d'un établissement
2. Vérifier l'indicateur "Connexion temps réel active" (vert)
3. Créer une nouvelle commande depuis le menu public
4. La commande devrait apparaître instantanément sans rafraîchissement

### 5. Tester le cache

1. Ouvrir le menu public d'un établissement
2. Recharger la page plusieurs fois
3. Vérifier dans les logs backend : "Menu public served from cache"

---

## 🔧 Dépannage

### WebSocket ne se connecte pas

**Symptômes** :
- Indicateur "Mode polling" visible
- Pas de notifications temps réel

**Solutions** :
1. Vérifier que le backend est démarré
2. Vérifier CORS dans `.env` : `CORS_ORIGIN=http://localhost:3000`
3. Vérifier la console navigateur pour les erreurs
4. Le système basculera automatiquement sur polling en fallback

### Redis ne se connecte pas

**Symptômes** :
- Logs : "Cache Redis non disponible"
- Pas d'amélioration de performance

**Solutions** :
1. Vérifier que Redis est démarré : `redis-cli ping`
2. Vérifier `REDIS_URL` dans `.env`
3. L'application fonctionne sans Redis (graceful degradation)

### Logs non créés

**Symptômes** :
- Pas de fichiers dans `qrmenu_backend/logs/`

**Solutions** :
1. Créer le dossier manuellement : `mkdir logs`
2. Vérifier les permissions d'écriture
3. Les logs seront créés automatiquement au premier démarrage

---

## 📊 Monitoring

### Logs

Les logs sont disponibles dans :
- `logs/error.log` : Erreurs uniquement
- `logs/combined.log` : Tous les logs
- `logs/exceptions.log` : Exceptions non capturées
- `logs/rejections.log` : Promesses rejetées

### Redis

Vérifier les clés en cache :
```bash
redis-cli
> KEYS *
> GET menu:public:YOUR_PLACE_ID
```

---

## 🎯 Prochaines étapes

Une fois installé, consulter :
- `AMELIORATIONS_UX.md` : Documentation complète des améliorations
- `PRODUCTION_GUIDE.md` : Guide de déploiement en production

---

**Date** : 2025-02-12

