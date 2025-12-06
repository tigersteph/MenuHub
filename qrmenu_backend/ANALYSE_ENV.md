# Analyse Complète du Fichier .env

## 📋 Variables d'Environnement Requises

### Base de Données PostgreSQL (CRITIQUE)
- `DB_HOST` : Adresse du serveur PostgreSQL (défaut: localhost)
- `DB_PORT` : Port PostgreSQL (défaut: 5432)
- `DB_NAME` : Nom de la base de données (défaut: qrmenu)
- `DB_USER` : Utilisateur PostgreSQL (défaut: postgres)
- `DB_PASSWORD` : Mot de passe PostgreSQL (REQUIS, pas de défaut)

**Impact si manquant** : L'application ne peut pas démarrer, erreur de connexion à la base de données.

### JWT Authentication (CRITIQUE)
- `JWT_SECRET` : Clé secrète pour signer les tokens (REQUIS, minimum 32 caractères)
- `JWT_EXPIRES_IN` : Durée de validité des tokens (défaut: 1h)

**Impact si manquant** : L'authentification ne fonctionne pas, les utilisateurs ne peuvent pas se connecter.

## 📋 Variables Recommandées

### Serveur
- `PORT` : Port du serveur Express (défaut: 8000)
- `NODE_ENV` : Environnement (development/production/test)

### CORS & Frontend
- `CORS_ORIGIN` : Origine autorisée pour CORS (défaut: http://localhost:3000)
- `FRONTEND_URL` : URL du frontend (défaut: http://localhost:3000)

**Impact si manquant** : Problèmes de CORS, le frontend ne peut pas communiquer avec le backend.

### Rate Limiting
- `ORDER_RATE_LIMIT_MAX` : Limite de requêtes pour les commandes (défaut: 100/min)
- `AUTH_RATE_LIMIT_MAX` : Limite pour l'authentification (défaut: 5/15min)
- `GENERAL_RATE_LIMIT_MAX` : Limite générale (défaut: 100/min)

**Impact si manquant** : Utilisation des valeurs par défaut, peut être insuffisant en production.

### Cloudinary (Upload d'Images)
- `CLOUDINARY_CLOUD_NAME` : Nom du cloud Cloudinary
- `CLOUDINARY_API_KEY` : Clé API Cloudinary
- `CLOUDINARY_API_SECRET` : Secret API Cloudinary

**Impact si manquant** : L'upload d'images ne fonctionne pas, les restaurants ne peuvent pas avoir de logo.

## 📋 Variables Optionnelles

### Pool de Connexions PostgreSQL
- `DB_POOL_MAX` : Nombre maximum de connexions (défaut: 20)
- `DB_POOL_MIN` : Nombre minimum de connexions (défaut: 2)
- `DB_POOL_IDLE_TIMEOUT` : Timeout d'inactivité (défaut: 30000ms)
- `DB_POOL_CONNECTION_TIMEOUT` : Timeout de connexion (défaut: 2000ms)

### Email Service
- `EMAIL_ENABLED` : Activer le service d'email (défaut: false)
- `SMTP_HOST` : Serveur SMTP (requis si EMAIL_ENABLED=true)
- `SMTP_PORT` : Port SMTP (défaut: 587)
- `SMTP_USER` : Utilisateur SMTP
- `SMTP_PASS` : Mot de passe SMTP
- `SMTP_FROM` : Adresse email expéditrice

**Impact si manquant** : Les emails de bienvenue et de réinitialisation de mot de passe ne fonctionnent pas.

### Redis Cache
- `REDIS_ENABLED` : Activer Redis (défaut: false)
- `REDIS_URL` : URL Redis (défaut: redis://localhost:6379)

**Impact si manquant** : Pas de cache, performances réduites pour les menus publics.

### Swagger Documentation
- `ENABLE_SWAGGER` : Activer Swagger en production (défaut: false)
- `API_URL` : URL de l'API pour Swagger (défaut: http://localhost:8000)

## 🔍 Vérification Rapide

Exécutez le script de vérification :
```bash
cd qrmenu_backend
node verify-env-complete.js
```

## ✅ Checklist de Configuration

- [ ] Toutes les variables REQUISES sont définies
- [ ] `JWT_SECRET` fait au moins 32 caractères
- [ ] `DB_PASSWORD` est défini et sécurisé
- [ ] `CORS_ORIGIN` correspond à l'URL du frontend
- [ ] `CLOUDINARY_*` sont configurées si l'upload d'images est nécessaire
- [ ] `NODE_ENV` est défini (development/production)
- [ ] Le fichier `.env` est dans `.gitignore`

## 🚨 Problèmes Courants

### Erreur: "Cannot connect to database"
- Vérifiez que PostgreSQL est démarré
- Vérifiez `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- Testez la connexion: `psql -U postgres -d qrmenu`

### Erreur: "JWT_SECRET is not defined"
- Définissez `JWT_SECRET` dans `.env`
- Utilisez une clé longue et aléatoire (minimum 32 caractères)

### Erreur: "CORS policy"
- Vérifiez que `CORS_ORIGIN` correspond à l'URL du frontend
- En développement, utilisez `http://localhost:3000`

### Upload d'images ne fonctionne pas
- Vérifiez que `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` sont définis
- Redémarrez le serveur après avoir ajouté les variables

