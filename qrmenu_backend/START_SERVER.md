# Guide de Démarrage du Serveur Backend

## 🚀 Démarrage Rapide

### 1. Installer les dépendances (si pas déjà fait)
```bash
cd qrmenu_backend
npm install
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env` dans `qrmenu_backend/` :

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qrmenu
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_cle_secrete_tres_longue
JWT_EXPIRES_IN=1h

# Serveur
PORT=8000
NODE_ENV=development

# Pool de connexions PostgreSQL
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000

# Rate Limiting
ORDER_RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
GENERAL_RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Email (optionnel)
EMAIL_ENABLED=false

# Redis (optionnel)
REDIS_ENABLED=false
```

### 3. Démarrer le serveur

```bash
npm run dev
```

Vous devriez voir :
```
🚀 Serveur démarré sur le port 8000
🌍 Environnement: development
```

### 4. Vérifier que le serveur fonctionne

Ouvrir dans le navigateur : `http://localhost:8000/api/health`

Vous devriez voir :
```json
{
  "status": "OK",
  "timestamp": "...",
  "environment": "development"
}
```

## ⚠️ Problèmes Courants

### Erreur : "Cannot find module"
```bash
npm install
```

### Erreur : "ECONNREFUSED" (base de données)
- Vérifier que PostgreSQL est démarré
- Vérifier les credentials dans `.env`
- Tester la connexion : `psql -U postgres -d qrmenu`

### Erreur : "Port 8000 already in use"
- Changer le port dans `.env` : `PORT=8001`
- Ou arrêter le processus utilisant le port 8000

## 📝 Commandes Utiles

```bash
# Démarrer en mode développement (avec rechargement auto)
npm run dev

# Démarrer en mode production
npm start

# Exécuter les tests
npm test
```

