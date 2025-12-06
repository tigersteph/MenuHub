# Guide de Préparation à la Production

## 📋 Checklist Avant Mise en Production

### 1. Base de Données ✅

- [ ] Migration SQL exécutée (`fix_orders_table_id.sql`)
- [ ] Sauvegarde de la base de données créée
- [ ] Indexes créés pour optimiser les performances
- [ ] Configuration de connexion sécurisée

### 2. Variables d'Environnement ✅

Créer un fichier `.env` dans `qrmenu_backend/` avec :

```env
# Base de Données
DB_USER=votre_user_postgres
DB_HOST=votre_host_postgres
DB_NAME=qrmenu
DB_PASSWORD=votre_mot_de_passe_securise
DB_PORT=5432

# JWT
JWT_SECRET=clé_secrète_très_longue_et_aléatoire
JWT_EXPIRES_IN=7d

# Serveur
PORT=8000
NODE_ENV=production

# CORS (si frontend sur un domaine différent)
CORS_ORIGIN=https://votre-domaine-frontend.com
```

**⚠️ IMPORTANT** :
- Ne jamais commiter le fichier `.env` dans Git
- Générer un `JWT_SECRET` fort : `openssl rand -base64 32`
- Utiliser des mots de passe forts pour la base de données

### 3. Configuration Frontend ✅

Mettre à jour `qrmenu_frontend/src/config/api.js` :

```javascript
export const API_BASE = process.env.REACT_APP_API_URL || "https://api.votre-domaine.com";
```

Créer un fichier `.env` dans `qrmenu_frontend/` :

```env
REACT_APP_API_URL=https://api.votre-domaine.com
```

### 4. Sécurité ✅

#### Backend
- [ ] CORS configuré correctement (actuellement ouvert à tous - à restreindre en production)
- [ ] Rate limiting activé (recommandé)
- [ ] Validation des entrées utilisateur
- [ ] Protection contre les injections SQL (déjà fait avec paramètres)
- [ ] HTTPS activé

#### Frontend
- [ ] Variables d'environnement pour l'API
- [ ] Gestion des erreurs réseau
- [ ] Timeout des requêtes

### 5. Performance ✅

#### Base de Données
- [ ] Indexes créés sur les colonnes fréquemment utilisées :
  ```sql
  CREATE INDEX idx_orders_place_id ON orders(place_id);
  CREATE INDEX idx_orders_table_id ON orders(table_id);
  CREATE INDEX idx_orders_status ON orders(status);
  CREATE INDEX idx_orders_created_at ON orders(created_at);
  CREATE INDEX idx_menu_items_place_id ON menu_items(place_id);
  CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
  CREATE INDEX idx_tables_place_id ON tables(place_id);
  ```

#### Backend
- [ ] Pool de connexions PostgreSQL optimisé
- [ ] Compression des réponses (gzip)
- [ ] Cache des requêtes statiques

### 6. Monitoring et Logs ✅

- [ ] Logs d'erreurs configurés
- [ ] Monitoring de la santé du serveur (`/api/health`)
- [ ] Alertes en cas d'erreur critique

### 7. Tests ✅

- [ ] Test workflow client complet
- [ ] Test workflow restaurateur complet
- [ ] Test création commande avec `tableId`
- [ ] Test rafraîchissement automatique menu
- [ ] Test réception commandes (polling 3s)
- [ ] Test affichage nom de table

## 🚀 Déploiement

### Backend

1. **Préparer l'environnement** :
   ```bash
   cd qrmenu_backend
   npm install --production
   ```

2. **Configurer les variables d'environnement** :
   ```bash
   cp .env.example .env
   # Éditer .env avec vos valeurs de production
   ```

3. **Exécuter les migrations** :
   ```bash
   psql -U postgres -d qrmenu -f db_migrations/fix_orders_table_id.sql
   ```

4. **Créer les indexes** :
   ```bash
   psql -U postgres -d qrmenu -f db_migrations/create_indexes.sql
   ```

5. **Démarrer le serveur** :
   ```bash
   npm start
   # Ou avec PM2 pour la production :
   pm2 start app.js --name qrmenu-backend
   ```

### Frontend

1. **Configurer les variables d'environnement** :
   ```bash
   cd qrmenu_frontend
   echo "REACT_APP_API_URL=https://api.votre-domaine.com" > .env.production
   ```

2. **Build de production** :
   ```bash
   npm run build
   ```

3. **Servir les fichiers statiques** :
   - Utiliser Nginx, Apache, ou un service comme Vercel/Netlify
   - Configurer le routing pour SPA (toutes les routes vers `index.html`)

## 🔒 Sécurité Production

### CORS
Mettre à jour `qrmenu_backend/app.js` :

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### Rate Limiting (Recommandé)
Installer `express-rate-limit` :

```bash
npm install express-rate-limit
```

Ajouter dans `app.js` :

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});

app.use('/api/', limiter);
```

### Helmet (Recommandé)
Installer `helmet` pour sécuriser les headers HTTP :

```bash
npm install helmet
```

Ajouter dans `app.js` :

```javascript
const helmet = require('helmet');
app.use(helmet());
```

## 📊 Monitoring

### Health Check
L'endpoint `/api/health` est déjà disponible :

```bash
curl https://api.votre-domaine.com/api/health
```

### Logs
Configurer la rotation des logs avec `winston` ou `pino` (optionnel).

## 🔄 Mises à Jour

### Migration de Base de Données
1. Créer une sauvegarde :
   ```bash
   pg_dump -U postgres qrmenu > backup_$(date +%Y%m%d).sql
   ```

2. Exécuter la migration :
   ```bash
   psql -U postgres -d qrmenu -f db_migrations/nouvelle_migration.sql
   ```

3. Vérifier que tout fonctionne

### Mise à Jour du Code
1. Pull les dernières modifications
2. `npm install` (si nouvelles dépendances)
3. `npm run build` (frontend)
4. Redémarrer le serveur

## ⚠️ Points d'Attention

1. **Base de Données** : Faire des sauvegardes régulières
2. **JWT_SECRET** : Ne jamais le changer une fois en production (tous les utilisateurs seront déconnectés)
3. **CORS** : Configurer correctement pour éviter les attaques CSRF
4. **HTTPS** : Obligatoire en production (Let's Encrypt gratuit)
5. **Mots de passe** : Utiliser des mots de passe forts partout
6. **Variables d'environnement** : Ne jamais les commiter dans Git

## 📞 Support

En cas de problème :
1. Vérifier les logs du serveur
2. Vérifier la santé de la base de données
3. Vérifier les variables d'environnement
4. Tester l'endpoint `/api/health`

