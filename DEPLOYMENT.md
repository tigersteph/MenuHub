# Guide de Déploiement MenuHub QR

## URLs de production

- **Frontend**: `https://votre-projet.vercel.app` (à remplacer par votre URL Vercel)
- **Backend**: `https://votre-backend.onrender.com` (à remplacer par votre URL Render)

## Architecture de déploiement

- **Frontend (React)** → Vercel (gratuit)
- **Backend (Node.js/Express)** → Render (gratuit, s'endort après 15min)
- **PostgreSQL** → Supabase (gratuit - 500MB)
- **Redis** → Upstash (gratuit - 10K commandes/jour)
- **Images** → Cloudinary (gratuit - 25GB)

## Variables d'environnement

### Backend (Render)

Variables à configurer dans le dashboard Render :

```
NODE_ENV=production
PORT=10000
DB_HOST=<votre-host-supabase>
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<votre-password-supabase>
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
JWT_SECRET=<générer-une-clé-secrète-32-caractères-minimum>
JWT_EXPIRES_IN=1h
CORS_ORIGIN=https://votre-frontend.vercel.app
FRONTEND_URL=https://votre-frontend.vercel.app
REDIS_ENABLED=true
REDIS_URL=<votre-url-upstash>
CLOUDINARY_CLOUD_NAME=<votre-cloud-name>
CLOUDINARY_API_KEY=<votre-api-key>
CLOUDINARY_API_SECRET=<votre-api-secret>
ORDER_RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
GENERAL_RATE_LIMIT_MAX=100
EMAIL_ENABLED=false
ENABLE_SWAGGER=false
```

**Génération de JWT_SECRET :**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (Vercel)

Variables à configurer dans le dashboard Vercel :

```
REACT_APP_API_URL=https://votre-backend.onrender.com
```

## Phase 1 : Préparation du projet

### ✅ 1.1 Vérification de la structure Git

- ✅ Le projet est prêt pour Git
- ✅ `.gitignore` exclut les fichiers `.env`
- ✅ Les dossiers `qrmenu_backend` et `qrmenu_frontend` sont présents

### ✅ 1.2 Fichiers de configuration

- ✅ `qrmenu_frontend/vercel.json` existe et est configuré
- ✅ `qrmenu_backend/render.yaml` existe et est configuré

## Phase 2 : Configuration des services externes

### 2.1 Supabase (PostgreSQL)

**Actions à effectuer :**

1. Créer un compte sur https://supabase.com
2. Créer un nouveau projet
3. Récupérer les credentials de connexion :
   - Host (DB_HOST)
   - Port (DB_PORT, généralement 5432)
   - Database name (DB_NAME)
   - User (DB_USER)
   - Password (DB_PASSWORD)
   - Connection string complète
4. Noter l'URL du projet Supabase

**Fichiers concernés :** Aucun (configuration via interface web)

### 2.2 Upstash (Redis)

**Actions à effectuer :**

1. Créer un compte sur https://upstash.com
2. Créer une nouvelle base Redis
3. Choisir la région la plus proche
4. Récupérer l'URL Redis (REDIS_URL)
5. Noter l'URL au format `redis://default:password@host:port`

**Fichiers concernés :** Aucun (configuration via interface web)

### 2.3 Cloudinary (Images)

**Actions à effectuer :**

1. Vérifier/créer un compte sur https://cloudinary.com
2. Récupérer depuis le Dashboard :
   - Cloud Name (CLOUDINARY_CLOUD_NAME)
   - API Key (CLOUDINARY_API_KEY)
   - API Secret (CLOUDINARY_API_SECRET)
3. Vérifier les limites du plan gratuit

**Fichiers concernés :** Aucun (déjà intégré dans `qrmenu_backend/controllers/uploadController.js`)

## Phase 3 : Configuration de la base de données

### 3.1 Exécution du schéma SQL

**Actions à effectuer :**

1. Se connecter à Supabase via l'éditeur SQL
2. Exécuter le fichier `qrmenu_backend/db.sql` pour créer les tables
3. Vérifier que l'extension `uuid-ossp` est activée
4. Exécuter les migrations dans `qrmenu_backend/db_migrations/` dans l'ordre :
   - `001_fix_schema.sql`
   - `add_user_name_columns.sql`
   - `add_user_role_column.sql`
   - `add_password_reset.sql`
   - `add_number_of_tables.sql`
   - `add_customer_notes_to_orders.sql`
   - `fix_tables_delete_constraint.sql`
   - `fix_orders_table_id.sql`
   - `fix_table_number_nullable.sql`
   - `add_indexes_orders.sql`
   - `create_indexes.sql`

**Fichiers concernés :**

- `qrmenu_backend/db.sql`
- `qrmenu_backend/db_migrations/*.sql`

### 3.2 Vérification du schéma

- Vérifier que toutes les tables sont créées (users, places, categories, menu_items, tables, orders, order_items)
- Vérifier les contraintes de clés étrangères
- Vérifier les index

## Phase 4 : Déploiement du Backend sur Render

### 4.1 Création du service Render

**Actions à effectuer :**

1. Créer un compte sur https://render.com
2. Cliquer sur "New" → "Web Service"
3. Connecter le repository GitHub/GitLab
4. Sélectionner le repository contenant le projet
5. Configurer le service :
   - **Name** : `qrmenu-backend` (ou nom personnalisé)
   - **Root Directory** : `qrmenu_backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : Free

### 4.2 Configuration des variables d'environnement Render

Voir la section "Variables d'environnement" ci-dessus pour la liste complète.

**Note :** Le fichier `qrmenu_backend/render.yaml` peut être utilisé pour configurer automatiquement certaines variables, mais les valeurs sensibles (DB_PASSWORD, JWT_SECRET, etc.) doivent être configurées manuellement dans le dashboard Render.

### 4.3 Déploiement initial

**Actions à effectuer :**

1. Cliquer sur "Create Web Service"
2. Attendre la fin du build (peut prendre 5-10 minutes)
3. Noter l'URL du service (format : `https://qrmenu-backend.onrender.com`)
4. Tester l'endpoint de santé : `https://votre-backend.onrender.com/api/health`

**Fichiers concernés :**

- `qrmenu_backend/package.json` (script `start` doit être présent) ✅
- `qrmenu_backend/app.js` (utilise `process.env.PORT || 8000`) ✅

### 4.4 Configuration du port Render

- Render fournit automatiquement la variable `PORT` via `process.env.PORT`
- Le code dans `qrmenu_backend/app.js` utilise déjà `process.env.PORT || 8000`
- Aucune modification nécessaire ✅

## Phase 5 : Déploiement du Frontend sur Vercel

### 5.1 Création du projet Vercel

**Actions à effectuer :**

1. Créer un compte sur https://vercel.com
2. Cliquer sur "Add New Project"
3. Importer le repository GitHub/GitLab
4. Configurer le projet :
   - **Framework Preset** : Create React App
   - **Root Directory** : `qrmenu_frontend`
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `build` (par défaut)

### 5.2 Configuration des variables d'environnement Vercel

**Variables à ajouter dans Vercel :**

```
REACT_APP_API_URL=https://votre-backend.onrender.com
```

**Fichiers concernés :**

- `qrmenu_frontend/src/config/api.js` (utilise déjà `process.env.REACT_APP_API_URL`) ✅

### 5.3 Fichier vercel.json

Le fichier `qrmenu_frontend/vercel.json` existe déjà et est correctement configuré ✅

### 5.4 Déploiement initial

**Actions à effectuer :**

1. Cliquer sur "Deploy"
2. Attendre la fin du build (peut prendre 3-5 minutes)
3. Noter l'URL du déploiement (format : `https://votre-projet.vercel.app`)
4. Tester l'application dans le navigateur

**Fichiers concernés :**

- `qrmenu_frontend/package.json` (script `build` doit être présent) ✅

### 5.5 Mise à jour de CORS_ORIGIN dans Render

**Actions à effectuer :**

1. Retourner dans Render
2. Mettre à jour la variable `CORS_ORIGIN` avec l'URL Vercel exacte
3. Mettre à jour `FRONTEND_URL` également
4. Redéployer le backend (automatique ou manuel)

## Phase 6 : Configuration WebSocket (Socket.io)

### 6.1 Vérification de la configuration Socket.io

**Fichiers concernés :**

- `qrmenu_backend/services/websocket.js` (ligne 20 utilise déjà `process.env.CORS_ORIGIN || process.env.FRONTEND_URL`) ✅
- `qrmenu_frontend/src/pages/Place.js` (utilise socket.io-client) ✅

### 6.2 Configuration Render pour WebSockets

- Render supporte WebSockets nativement
- Aucune configuration supplémentaire nécessaire
- Le code existant devrait fonctionner ✅

## Phase 7 : Tests et vérifications

### 7.1 Tests du Backend

**Endpoints à tester :**

1. `GET /api/health` - Doit retourner `{ status: 'OK' }`
2. `POST /api/auth/register` - Test d'inscription
3. `POST /api/auth/login` - Test de connexion
4. `GET /api/places` (avec token) - Test de récupération des établissements

**Outils :**

- Postman
- curl
- Interface Swagger (si activée)

### 7.2 Tests du Frontend

**Pages à tester :**

1. Page d'accueil (`/`)
2. Page de connexion (`/login`)
3. Page d'inscription (`/register`)
4. Dashboard des établissements (`/places`)
5. Page de menu publique (`/menu/:placeId/:tableId`)

### 7.3 Tests d'intégration

**Scénarios à tester :**

1. Inscription d'un nouvel utilisateur
2. Création d'un établissement
3. Ajout de catégories et plats
4. Génération de QR code
5. Commande depuis le menu public
6. Réception de la commande en temps réel (WebSocket)
7. Upload d'image (logo, plat)

### 7.4 Vérification des services externes

**À vérifier :**

1. **Supabase** : Vérifier que les données sont bien sauvegardées
2. **Upstash** : Vérifier les logs Redis (si activé)
3. **Cloudinary** : Vérifier que les images sont uploadées
4. **Render** : Vérifier les logs du backend
5. **Vercel** : Vérifier les logs du frontend

## Phase 8 : Optimisations et finitions

### 8.1 Configuration du domaine personnalisé (optionnel)

**Vercel :**

1. Aller dans Settings → Domains
2. Ajouter un domaine personnalisé
3. Suivre les instructions DNS

**Render :**

1. Aller dans Settings → Custom Domains
2. Ajouter un domaine personnalisé
3. Configurer le DNS

### 8.2 Configuration des redirections

- Vercel gère automatiquement les redirections SPA
- Le fichier `vercel.json` avec la route `/(.*)` → `/index.html` gère le routing React ✅

### 8.3 Monitoring et logs

**Render :**

- Logs disponibles dans l'onglet "Logs" du service
- Surveiller les erreurs de connexion DB/Redis

**Vercel :**

- Logs disponibles dans l'onglet "Deployments" → "Functions"
- Surveiller les erreurs de build

## Procédure de mise à jour

1. Push sur la branche main
2. Vercel et Render déploient automatiquement
3. Vérifier les logs en cas d'erreur

## Points d'attention

### Limitations du plan gratuit

1. **Render** : Le service s'endort après 15 minutes d'inactivité. Le premier appel après l'endormissement peut prendre 30-60 secondes.
2. **Supabase** : Limite de 500MB de données. Surveiller l'utilisation.
3. **Upstash** : Limite de 10,000 commandes Redis par jour. L'application fonctionne sans Redis si la limite est atteinte.
4. **Cloudinary** : Limite de 25GB de stockage et 25GB de bande passante/mois.

### Solutions de contournement

- Pour éviter l'endormissement Render : Utiliser un service de ping automatique (UptimeRobot gratuit)
- Pour plus de stockage : Migrer vers un plan payant si nécessaire
- Pour Redis : L'application fonctionne sans cache (graceful degradation)

## Checklist finale

- [ ] Comptes créés (Vercel, Render, Supabase, Upstash, Cloudinary)
- [ ] Base de données Supabase configurée et migrations exécutées
- [ ] Backend déployé sur Render et accessible
- [ ] Frontend déployé sur Vercel et accessible
- [ ] Variables d'environnement configurées correctement
- [ ] CORS configuré correctement
- [ ] Tests de base fonctionnels
- [ ] WebSockets fonctionnels
- [ ] Upload d'images fonctionnel
- [ ] Documentation créée ✅

