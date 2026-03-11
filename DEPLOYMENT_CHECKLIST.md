# Checklist de Déploiement - MenuHub QR

Cette checklist vous guide étape par étape pour déployer l'application MenuHub QR.

## 📋 Préparation

### Fichiers de configuration
- [x] `.gitignore` exclut les fichiers `.env`
- [x] `qrmenu_frontend/vercel.json` existe et est configuré
- [x] `qrmenu_backend/render.yaml` existe et est configuré
- [x] `qrmenu_backend/db_supabase.sql` créé pour Supabase
- [x] Documentation `DEPLOYMENT.md` créée

### Structure du projet
- [x] Dossier `qrmenu_backend/` présent
- [x] Dossier `qrmenu_frontend/` présent
- [x] Scripts npm configurés (`npm start`, `npm run build`)

## 🔧 Phase 1 : Services externes

### Supabase (PostgreSQL)
- [ ] Compte créé sur https://supabase.com
- [ ] Projet créé
- [ ] Credentials récupérés (Host, Port, Database, User, Password)
- [ ] Schéma SQL exécuté (`db_supabase.sql`)
- [ ] Extension `uuid-ossp` activée
- [ ] Migrations exécutées dans l'ordre (voir `MIGRATIONS_ORDER.md`)
- [ ] Tables vérifiées (users, places, categories, menu_items, tables, orders, order_items)

### Upstash (Redis)
- [ ] Compte créé sur https://upstash.com
- [ ] Base Redis créée
- [ ] Région choisie (la plus proche)
- [ ] URL Redis récupérée (format: `redis://default:password@host:port`)

### Cloudinary (Images)
- [ ] Compte créé/vérifié sur https://cloudinary.com
- [ ] Cloud Name récupéré
- [ ] API Key récupérée
- [ ] API Secret récupéré
- [ ] Limites du plan gratuit vérifiées

## 🚀 Phase 2 : Déploiement Backend (Render)

### Configuration Render
- [ ] Compte créé sur https://render.com
- [ ] Repository GitHub/GitLab connecté
- [ ] Service Web créé :
  - [ ] Name: `qrmenu-backend`
  - [ ] Root Directory: `qrmenu_backend`
  - [ ] Environment: `Node`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Plan: Free

### Variables d'environnement Render
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `DB_HOST` (Supabase)
- [ ] `DB_PORT=5432`
- [ ] `DB_NAME=postgres`
- [ ] `DB_USER=postgres`
- [ ] `DB_PASSWORD` (Supabase)
- [ ] `DB_POOL_MAX=20`
- [ ] `DB_POOL_MIN=2`
- [ ] `DB_POOL_IDLE_TIMEOUT=30000`
- [ ] `DB_POOL_CONNECTION_TIMEOUT=2000`
- [ ] `JWT_SECRET` (généré avec: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `JWT_EXPIRES_IN=1h`
- [ ] `CORS_ORIGIN` (URL Vercel - à mettre à jour après déploiement frontend)
- [ ] `FRONTEND_URL` (URL Vercel - à mettre à jour après déploiement frontend)
- [ ] `REDIS_ENABLED=true`
- [ ] `REDIS_URL` (Upstash)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `ORDER_RATE_LIMIT_MAX=100`
- [ ] `AUTH_RATE_LIMIT_MAX=5`
- [ ] `GENERAL_RATE_LIMIT_MAX=100`
- [ ] `EMAIL_ENABLED=false`
- [ ] `ENABLE_SWAGGER=false`

### Déploiement
- [ ] Service créé et déployé
- [ ] Build réussi (vérifier les logs)
- [ ] URL du service notée: `https://votre-backend.onrender.com`
- [ ] Endpoint `/api/health` testé et fonctionnel

## 🎨 Phase 3 : Déploiement Frontend (Vercel)

### Configuration Vercel
- [ ] Compte créé sur https://vercel.com
- [ ] Repository GitHub/GitLab connecté
- [ ] Projet créé :
  - [ ] Framework Preset: Create React App
  - [ ] Root Directory: `qrmenu_frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `build`

### Variables d'environnement Vercel
- [ ] `REACT_APP_API_URL` (URL Render backend)

### Déploiement
- [ ] Projet déployé
- [ ] Build réussi (vérifier les logs)
- [ ] URL du déploiement notée: `https://votre-projet.vercel.app`
- [ ] Application accessible dans le navigateur

### Mise à jour CORS
- [ ] Retourner dans Render
- [ ] Mettre à jour `CORS_ORIGIN` avec l'URL Vercel exacte
- [ ] Mettre à jour `FRONTEND_URL` avec l'URL Vercel exacte
- [ ] Redéployer le backend (si nécessaire)

## ✅ Phase 4 : Tests

### Tests Backend
- [ ] `GET /api/health` retourne `{ status: 'OK' }`
- [ ] `POST /api/auth/register` - Inscription fonctionnelle
- [ ] `POST /api/auth/login` - Connexion fonctionnelle
- [ ] `GET /api/places` (avec token) - Récupération des établissements

### Tests Frontend
- [ ] Page d'accueil (`/`) accessible
- [ ] Page de connexion (`/login`) accessible
- [ ] Page d'inscription (`/register`) accessible
- [ ] Dashboard des établissements (`/places`) accessible
- [ ] Page de menu publique (`/menu/:placeId/:tableId`) accessible

### Tests d'intégration
- [ ] Inscription d'un nouvel utilisateur
- [ ] Création d'un établissement
- [ ] Ajout de catégories et plats
- [ ] Génération de QR code
- [ ] Commande depuis le menu public
- [ ] Réception de la commande en temps réel (WebSocket)
- [ ] Upload d'image (logo, plat)

### Vérification des services
- [ ] Supabase : Données sauvegardées correctement
- [ ] Upstash : Redis fonctionnel (vérifier les logs)
- [ ] Cloudinary : Images uploadées et accessibles
- [ ] Render : Logs du backend sans erreurs
- [ ] Vercel : Logs du frontend sans erreurs

## 📝 Documentation

- [x] `DEPLOYMENT.md` créé avec toutes les informations
- [x] `qrmenu_backend/SUPABASE_SETUP.md` créé
- [x] `qrmenu_backend/MIGRATIONS_ORDER.md` créé
- [x] `qrmenu_backend/db_supabase.sql` créé
- [ ] URLs de production documentées dans `DEPLOYMENT.md`
- [ ] Variables d'environnement documentées

## 🎯 Finalisation

- [ ] Tous les tests passent
- [ ] Application accessible publiquement
- [ ] WebSockets fonctionnels
- [ ] Upload d'images fonctionnel
- [ ] Documentation à jour
- [ ] Checklist complétée

## ⚠️ Points d'attention

### Limitations du plan gratuit
- [ ] Comprendre que Render s'endort après 15min d'inactivité
- [ ] Comprendre les limites Supabase (500MB)
- [ ] Comprendre les limites Upstash (10K commandes/jour)
- [ ] Comprendre les limites Cloudinary (25GB stockage, 25GB bande passante/mois)

### Solutions de contournement
- [ ] Configurer UptimeRobot (gratuit) pour éviter l'endormissement Render
- [ ] Surveiller l'utilisation de stockage Supabase
- [ ] Comprendre que l'application fonctionne sans Redis si limite atteinte

---

**Date de déploiement :** _______________

**URLs de production :**
- Frontend: _______________
- Backend: _______________

**Notes :**
_______________
_______________

