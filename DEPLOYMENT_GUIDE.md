# Guide de Déploiement - MenuHub

Ce guide vous accompagne pour déployer l'application MenuHub en production et la rendre accessible pour des tests en situation réelle dans les restaurants.

## 📋 Prérequis

- Node.js 14+ et npm installés
- PostgreSQL installé et configuré
- Compte Cloudinary (pour les images)
- Serveur VPS ou compte Heroku/Vercel/Netlify
- Domaine (optionnel mais recommandé)

## 🚀 Étapes de Déploiement

### 1. Configuration des Variables d'Environnement

#### Backend (`qrmenu_backend/.env`)

Créez un fichier `.env` dans le dossier `qrmenu_backend` avec :

```env
NODE_ENV=production
PORT=8000

# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=menuhub_db
DB_USER=menuhub_user
DB_PASSWORD=votre_mot_de_passe_securise

# JWT Secret (GÉNÉRER UN SECRET FORT)
# Utilisez: openssl rand -base64 32
JWT_SECRET=votre_secret_jwt_tres_long_et_securise_ici
JWT_EXPIRES_IN=7d

# CORS - URL de votre frontend en production
CORS_ORIGIN=https://votre-domaine.com

# Cloudinary (pour les images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
CLOUDINARY_UPLOAD_PRESET=menuhub_photos

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app

# Redis (optionnel, pour le cache)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Swagger (désactiver en production)
ENABLE_SWAGGER=false
```

#### Frontend (`qrmenu_frontend/.env.production`)

Créez un fichier `.env.production` dans le dossier `qrmenu_frontend` avec :

```env
REACT_APP_API_URL=https://api.votre-domaine.com
REACT_APP_CLOUDINARY_CLOUD_NAME=votre_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=menuhub_photos
```

### 2. Préparation de la Base de Données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE menuhub_db;

# Créer l'utilisateur
CREATE USER menuhub_user WITH PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE menuhub_db TO menuhub_user;

# Les tables seront créées automatiquement au premier démarrage
```

### 3. Build de Production

#### Backend

```bash
cd qrmenu_backend
npm install --production
```

#### Frontend

```bash
cd qrmenu_frontend
npm install
npm run build
```

Le dossier `build/` contiendra les fichiers optimisés pour la production.

### 4. Options de Déploiement

## Option A : Déploiement sur VPS (Recommandé)

### Backend avec PM2

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer le backend
cd qrmenu_backend
pm2 start app.js --name "menuhub-backend" --env production

# Sauvegarder la configuration
pm2 save
pm2 startup  # Suivre les instructions affichées
```

### Frontend avec Nginx

Installez Nginx et créez le fichier `/etc/nginx/sites-available/menuhub` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Redirection HTTPS (recommandé)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # Certificat SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    root /var/www/menuhub/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Cache statique
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router - toutes les routes vers index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Proxy API vers backend
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket pour les notifications temps réel
    location /socket.io {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Activez le site :

```bash
sudo ln -s /etc/nginx/sites-available/menuhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Installation SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## Option B : Déploiement sur Heroku

### Backend

```bash
cd qrmenu_backend
heroku create menuhub-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set CORS_ORIGIN=https://votre-frontend.herokuapp.com
# ... autres variables
git push heroku main
```

### Frontend

```bash
cd qrmenu_frontend
npm install -g serve
npm run build
# Utiliser le buildpack static: https://github.com/heroku/heroku-buildpack-static
```

## Option C : Déploiement sur Vercel/Netlify (Frontend)

### Vercel

```bash
cd qrmenu_frontend
npm install -g vercel
vercel --prod
```

### Netlify

1. Connecter votre repo GitHub
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
3. Variables d'environnement dans le dashboard

## 5. Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL créée
- [ ] JWT_SECRET généré (commande: `openssl rand -base64 32`)
- [ ] CORS configuré avec l'URL du frontend
- [ ] Cloudinary configuré
- [ ] HTTPS activé (Let's Encrypt)
- [ ] Backend démarré et testé (`/api/health`)
- [ ] Frontend build réussi
- [ ] Tests de connexion frontend ↔ backend
- [ ] Tests d'authentification
- [ ] Tests d'upload d'images
- [ ] Monitoring configuré (PM2, logs)

## 6. Tests en Situation Réelle

### Tests à Effectuer

1. **Création de compte**
   - Créer un compte restaurateur
   - Vérifier l'email de confirmation (si activé)

2. **Gestion d'établissement**
   - Créer un établissement
   - Modifier les informations
   - Uploader un logo

3. **Gestion des tables**
   - Créer plusieurs tables
   - Modifier le statut d'une table
   - Supprimer une table

4. **Gestion du menu**
   - Créer des catégories
   - Ajouter des plats avec images
   - Modifier la disponibilité des plats
   - Réorganiser les catégories

5. **Génération de QR Code**
   - Générer un QR code pour une table
   - Scanner le QR code avec un téléphone
   - Vérifier que le menu s'affiche correctement

6. **Commande client**
   - Scanner le QR code
   - Parcourir le menu
   - Ajouter des plats au panier
   - Passer une commande
   - Vérifier la notification côté restaurateur

7. **Gestion des commandes**
   - Voir les commandes en temps réel
   - Changer le statut d'une commande
   - Annuler une commande

### URL de Test

Une fois déployé, vous pouvez tester avec :
- Frontend: `https://votre-domaine.com`
- Backend API: `https://votre-domaine.com/api/health`
- Menu public: `https://votre-domaine.com/menu/{placeId}/{tableId}`

## 7. Monitoring et Maintenance

### PM2 Monitoring

```bash
pm2 monit
pm2 logs menuhub-backend
pm2 status
```

### Logs

- Backend: `qrmenu_backend/logs/`
- Nginx: `/var/log/nginx/error.log`
- PM2: `pm2 logs`

### Redémarrage

```bash
# Backend
pm2 restart menuhub-backend

# Nginx
sudo systemctl restart nginx
```

## 8. Sécurité

- ✅ HTTPS activé
- ✅ JWT_SECRET fort et unique
- ✅ CORS restreint au domaine frontend
- ✅ Rate limiting activé
- ✅ Validation des entrées
- ✅ Protection contre les injections SQL (via pg)
- ✅ Upload d'images sécurisé (taille, type)

## 9. Support et Dépannage

### Problèmes Courants

**Backend ne démarre pas**
- Vérifier les variables d'environnement
- Vérifier la connexion à la base de données
- Vérifier les logs: `pm2 logs menuhub-backend`

**Frontend ne charge pas**
- Vérifier que le build est à jour
- Vérifier la configuration Nginx
- Vérifier les variables d'environnement

**Erreurs CORS**
- Vérifier que `CORS_ORIGIN` correspond exactement à l'URL du frontend
- Vérifier que le backend accepte les credentials

**Images ne s'affichent pas**
- Vérifier la configuration Cloudinary
- Vérifier que les URLs sont correctes

## 10. Mise à Jour

```bash
# Backend
cd qrmenu_backend
git pull
npm install --production
pm2 restart menuhub-backend

# Frontend
cd qrmenu_frontend
git pull
npm install
npm run build
# Copier le dossier build vers /var/www/menuhub/
sudo cp -r build/* /var/www/menuhub/
```

## 🎯 Prêt pour les Tests en Situation Réelle !

Votre application est maintenant déployée et prête pour des tests dans les restaurants. Assurez-vous de :

1. Tester toutes les fonctionnalités
2. Former les restaurateurs à l'utilisation
3. Collecter les retours utilisateurs
4. Monitorer les performances
5. Corriger les bugs rapidement

Bon déploiement ! 🚀
