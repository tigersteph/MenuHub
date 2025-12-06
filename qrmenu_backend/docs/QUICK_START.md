# Guide de Démarrage Rapide - MenuHub

## 🚀 Installation et Configuration Rapide

### Prérequis
- Node.js 14+ installé
- PostgreSQL installé et démarré
- npm ou yarn installé

### 1. Backend (5 minutes)

```bash
cd qrmenu_backend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos paramètres :
# - DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT
# - JWT_SECRET (générer avec: openssl rand -base64 32)
# - PORT (par défaut 8000)

# Créer la base de données
psql -U postgres -f db.sql

# Exécuter les migrations
psql -U postgres -d qrmenu -f db_migrations/fix_orders_table_id.sql
psql -U postgres -d qrmenu -f db_migrations/create_indexes.sql

# Démarrer le serveur
npm start
# ou en mode développement
npm run dev
```

### 2. Frontend (3 minutes)

```bash
cd qrmenu_frontend

# Installer les dépendances
npm install

# Créer le fichier .env
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Démarrer l'application
npm start
```

### 3. Vérification (2 minutes)

```bash
# Dans qrmenu_backend
npm run test:workflow

# Ou manuellement :
curl http://localhost:8000/api/health
```

## ✅ Vérification Rapide

1. **Backend** : http://localhost:8000/api/health doit retourner `{"status":"OK"}`
2. **Frontend** : http://localhost:3000 doit afficher la page d'accueil
3. **Connexion** : Créer un compte et se connecter
4. **Workflow** : Créer un établissement, une table, un menu, et tester une commande

## 🐛 Problèmes Courants

### Backend ne démarre pas
- Vérifier que PostgreSQL est démarré
- Vérifier les variables d'environnement dans `.env`
- Vérifier que le port 8000 n'est pas utilisé

### Frontend ne se connecte pas au backend
- Vérifier que `REACT_APP_API_URL` dans `.env` est correct
- Vérifier que le backend est démarré
- Vérifier CORS dans `app.js`

### Erreur de base de données
- Vérifier que PostgreSQL est démarré
- Vérifier les identifiants dans `.env`
- Vérifier que la base `qrmenu` existe

## 📚 Documentation Complète

- **Guide de Production** : `docs/PRODUCTION_GUIDE.md`
- **Guide de Test** : `docs/TESTING_GUIDE.md`
- **Checklist Déploiement** : `docs/DEPLOYMENT_CHECKLIST.md`
- **Migration** : `docs/MIGRATION_TABLE_ID.md`

## 🎯 Prochaines Étapes

1. Lire `docs/TESTING_GUIDE.md` pour tester le workflow complet
2. Lire `docs/PRODUCTION_GUIDE.md` pour préparer la production
3. Suivre `docs/DEPLOYMENT_CHECKLIST.md` pour déployer

