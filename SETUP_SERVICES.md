# Configuration des Services Externes - MenuHub QR

Ce guide vous accompagne dans la configuration de tous les services externes nécessaires au déploiement.

## 📋 Vue d'ensemble

Vous devez configurer 5 services externes :

1. **Supabase** (PostgreSQL) - Base de données
2. **Upstash** (Redis) - Cache et sessions
3. **Cloudinary** (Images) - Stockage d'images
4. **Render** (Backend) - Hébergement backend
5. **Vercel** (Frontend) - Hébergement frontend

---

## 1. Supabase (PostgreSQL)

### Étape 1 : Créer un compte

1. Aller sur https://supabase.com
2. Cliquer sur **"Start your project"** ou **"Sign up"**
3. S'inscrire avec GitHub, Google, ou email
4. Vérifier votre email si nécessaire

### Étape 2 : Créer un projet

1. Cliquer sur **"New Project"**
2. Remplir le formulaire :
   - **Name** : `menuhub-qr` (ou nom de votre choix)
   - **Database Password** : Générer un mot de passe fort (⚠️ **NOTER CE MOT DE PASSE**, il ne sera plus affiché)
   - **Region** : Choisir la région la plus proche de vos utilisateurs
   - **Pricing Plan** : Free (gratuit)
3. Cliquer sur **"Create new project"**
4. Attendre 2-3 minutes que le projet soit créé

### Étape 3 : Récupérer les credentials

1. Aller dans **Settings** (icône engrenage en bas à gauche)
2. Cliquer sur **"Database"** dans le menu
3. Dans la section **"Connection string"**, choisir **"URI"**
4. Noter les informations suivantes :

```
Host: db.xxxxx.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [le mot de passe que vous avez noté]
```

**Connection String complète** (format) :
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Étape 4 : Configurer la base de données

Suivre le guide détaillé dans `qrmenu_backend/SUPABASE_SETUP.md`

**Résumé rapide :**
1. Aller dans **SQL Editor** (icône base de données dans le menu de gauche)
2. Créer une nouvelle requête
3. Copier le contenu de `qrmenu_backend/db_supabase.sql`
4. Exécuter la requête
5. Exécuter les migrations dans l'ordre (voir `qrmenu_backend/MIGRATIONS_ORDER.md`)

### ✅ Checklist Supabase

- [ ] Compte créé
- [ ] Projet créé
- [ ] Mot de passe noté
- [ ] Credentials récupérés (Host, Port, Database, User, Password)
- [ ] Schéma SQL exécuté
- [ ] Migrations exécutées
- [ ] Tables vérifiées

---

## 2. Upstash (Redis)

### Étape 1 : Créer un compte

1. Aller sur https://upstash.com
2. Cliquer sur **"Sign Up"**
3. S'inscrire avec GitHub, Google, ou email
4. Vérifier votre email si nécessaire

### Étape 2 : Créer une base Redis

1. Dans le dashboard, cliquer sur **"Create Database"**
2. Remplir le formulaire :
   - **Name** : `menuhub-redis` (ou nom de votre choix)
   - **Type** : Regional (gratuit)
   - **Region** : Choisir la région la plus proche (même région que Supabase si possible)
   - **Primary Region** : Sélectionner une région
   - **TLS** : Activé (recommandé)
3. Cliquer sur **"Create"**

### Étape 3 : Récupérer l'URL Redis

1. Une fois la base créée, cliquer dessus
2. Dans l'onglet **"Details"**, trouver la section **"REST API"** ou **"Redis URL"**
3. L'URL sera au format :
   ```
   redis://default:[PASSWORD]@[HOST]:[PORT]
   ```
4. **Copier cette URL complète** - c'est votre `REDIS_URL`

**Note :** Si vous ne voyez pas l'URL directement :
- Aller dans **"Details"** → **"REST API"**
- L'URL Redis est affichée là

### ✅ Checklist Upstash

- [ ] Compte créé
- [ ] Base Redis créée
- [ ] Région choisie
- [ ] URL Redis récupérée (format: `redis://default:password@host:port`)
- [ ] URL notée pour configuration Render

---

## 3. Cloudinary (Images)

### Étape 1 : Créer/vérifier un compte

1. Aller sur https://cloudinary.com
2. Si vous n'avez pas de compte :
   - Cliquer sur **"Sign Up For Free"**
   - Remplir le formulaire
   - Vérifier votre email
3. Si vous avez déjà un compte, vous connecter

### Étape 2 : Récupérer les credentials

1. Une fois connecté, aller dans le **Dashboard**
2. En haut à droite, vous verrez :
   - **Cloud Name** : `xxxxx` (votre nom de cloud)
3. Cliquer sur votre nom en haut à droite → **"Account Details"** ou aller dans **Settings** → **"Security"**
4. Dans la section **"API Keys"**, vous trouverez :
   - **API Key** : `123456789012345`
   - **API Secret** : Cliquer sur **"Reveal"** pour voir le secret (⚠️ **NOTER CE SECRET**)

### Étape 3 : Vérifier les limites

Dans le dashboard, vérifier :
- **Storage** : 25 GB (gratuit)
- **Bandwidth** : 25 GB/mois (gratuit)
- **Transformations** : 25,000/mois (gratuit)

### ✅ Checklist Cloudinary

- [ ] Compte créé/vérifié
- [ ] Cloud Name noté
- [ ] API Key noté
- [ ] API Secret noté (et révélé)
- [ ] Limites du plan gratuit vérifiées

---

## 4. Render (Backend)

### Étape 1 : Créer un compte

1. Aller sur https://render.com
2. Cliquer sur **"Get Started for Free"**
3. S'inscrire avec GitHub, GitLab, ou email
4. Vérifier votre email si nécessaire

### Étape 2 : Connecter votre repository

1. Dans le dashboard, cliquer sur **"New +"** en haut à droite
2. Choisir **"Web Service"**
3. Connecter votre repository GitHub/GitLab :
   - Si pas encore connecté, cliquer sur **"Connect account"**
   - Autoriser Render à accéder à vos repositories
   - Sélectionner le repository contenant votre projet MenuHub QR

### Étape 3 : Configurer le service

Remplir le formulaire :

- **Name** : `qrmenu-backend` (ou nom de votre choix)
- **Region** : Choisir la région la plus proche
- **Branch** : `main` (ou votre branche principale)
- **Root Directory** : `qrmenu_backend` ⚠️ **IMPORTANT**
- **Runtime** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `npm start`
- **Plan** : **Free** (gratuit)

### Étape 4 : Configurer les variables d'environnement

**NE PAS cliquer sur "Create Web Service" tout de suite !**

1. Cliquer sur **"Advanced"** en bas du formulaire
2. Dans **"Environment Variables"**, ajouter toutes les variables (voir `DEPLOYMENT.md` pour la liste complète)

**Variables essentielles à configurer maintenant :**

```
NODE_ENV=production
PORT=10000
DB_HOST=[votre-host-supabase]
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[votre-password-supabase]
JWT_SECRET=[générer avec: node scripts/generate-jwt-secret.js]
JWT_EXPIRES_IN=1h
REDIS_ENABLED=true
REDIS_URL=[votre-url-upstash]
CLOUDINARY_CLOUD_NAME=[votre-cloud-name]
CLOUDINARY_API_KEY=[votre-api-key]
CLOUDINARY_API_SECRET=[votre-api-secret]
CORS_ORIGIN=[à mettre à jour après déploiement frontend]
FRONTEND_URL=[à mettre à jour après déploiement frontend]
EMAIL_ENABLED=false
ENABLE_SWAGGER=false
```

**Note :** `CORS_ORIGIN` et `FRONTEND_URL` seront mises à jour après le déploiement du frontend.

### Étape 5 : Générer JWT_SECRET

Dans votre terminal local :

```bash
cd qrmenu_backend
node scripts/generate-jwt-secret.js
```

Copier la valeur générée dans la variable `JWT_SECRET` de Render.

### Étape 6 : Créer le service

1. Vérifier que toutes les variables sont configurées
2. Cliquer sur **"Create Web Service"**
3. Attendre 5-10 minutes que le build se termine
4. Noter l'URL du service : `https://qrmenu-backend.onrender.com` (ou votre nom)

### ✅ Checklist Render

- [ ] Compte créé
- [ ] Repository connecté
- [ ] Service configuré (Root Directory: `qrmenu_backend`)
- [ ] Toutes les variables d'environnement configurées
- [ ] JWT_SECRET généré et configuré
- [ ] Service déployé
- [ ] URL du service notée
- [ ] Endpoint `/api/health` testé

---

## 5. Vercel (Frontend)

### Étape 1 : Créer un compte

1. Aller sur https://vercel.com
2. Cliquer sur **"Sign Up"**
3. S'inscrire avec GitHub, GitLab, ou email
4. Vérifier votre email si nécessaire

### Étape 2 : Importer le projet

1. Dans le dashboard, cliquer sur **"Add New..."** → **"Project"**
2. Si pas encore connecté, connecter votre repository GitHub/GitLab
3. Sélectionner le repository contenant votre projet MenuHub QR
4. Cliquer sur **"Import"**

### Étape 3 : Configurer le projet

Vercel détecte automatiquement Create React App, mais vérifier :

- **Framework Preset** : `Create React App` (détecté automatiquement)
- **Root Directory** : `qrmenu_frontend` ⚠️ **IMPORTANT** - Cliquer sur **"Edit"** et définir
- **Build Command** : `npm run build` (par défaut)
- **Output Directory** : `build` (par défaut)

### Étape 4 : Configurer les variables d'environnement

1. Dans la section **"Environment Variables"**, cliquer sur **"Add"**
2. Ajouter :

```
REACT_APP_API_URL=https://votre-backend.onrender.com
```

**⚠️ IMPORTANT :** Remplacer `votre-backend.onrender.com` par l'URL réelle de votre backend Render.

### Étape 5 : Déployer

1. Vérifier la configuration
2. Cliquer sur **"Deploy"**
3. Attendre 3-5 minutes que le build se termine
4. Noter l'URL du déploiement : `https://votre-projet.vercel.app`

### Étape 6 : Mettre à jour CORS dans Render

1. Retourner dans Render
2. Aller dans les **"Environment"** de votre service backend
3. Mettre à jour :
   - `CORS_ORIGIN` : URL Vercel exacte (ex: `https://votre-projet.vercel.app`)
   - `FRONTEND_URL` : URL Vercel exacte
4. Sauvegarder (Render redéploie automatiquement)

### ✅ Checklist Vercel

- [ ] Compte créé
- [ ] Repository importé
- [ ] Root Directory configuré (`qrmenu_frontend`)
- [ ] Variable `REACT_APP_API_URL` configurée
- [ ] Projet déployé
- [ ] URL du déploiement notée
- [ ] Application accessible dans le navigateur
- [ ] CORS mis à jour dans Render

---

## 📝 Récapitulatif des Credentials

Créez un fichier sécurisé (hors Git) pour noter tous vos credentials :

```
=== SUPABASE ===
Host: db.xxxxx.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [NOTER ICI]

=== UPSTASH ===
REDIS_URL: redis://default:password@host:port

=== CLOUDINARY ===
Cloud Name: xxxxx
API Key: xxxxx
API Secret: xxxxx

=== RENDER ===
Backend URL: https://qrmenu-backend.onrender.com
JWT_SECRET: [NOTER ICI]

=== VERCEL ===
Frontend URL: https://votre-projet.vercel.app
```

**⚠️ SÉCURITÉ :** Ne jamais commiter ce fichier dans Git !

---

## 🚀 Prochaines étapes

Une fois tous les services configurés :

1. Suivre `DEPLOYMENT.md` pour les détails techniques
2. Utiliser `DEPLOYMENT_CHECKLIST.md` pour suivre votre progression
3. Tester l'application complète

---

## ❓ Aide et Support

- **Supabase** : https://supabase.com/docs
- **Upstash** : https://docs.upstash.com
- **Cloudinary** : https://cloudinary.com/documentation
- **Render** : https://render.com/docs
- **Vercel** : https://vercel.com/docs

