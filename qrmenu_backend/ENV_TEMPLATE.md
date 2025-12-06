# Template de Configuration .env

Copiez ce contenu dans votre fichier `.env` et remplissez les valeurs.

```env
# ============================================
# CONFIGURATION ENVIRONNEMENT - MenuHub Backend
# ============================================

# ============================================
# BASE DE DONNÉES POSTGRESQL (REQUIS)
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qrmenu
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres

# Pool de connexions PostgreSQL
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000

# ============================================
# JWT AUTHENTICATION (REQUIS)
# ============================================
# IMPORTANT: Utilisez une clé secrète longue et aléatoire (minimum 32 caractères)
# Générez-en une avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=votre_cle_secrete_tres_longue_et_aleatoire_minimum_32_caracteres
JWT_EXPIRES_IN=1h

# ============================================
# SERVEUR (REQUIS)
# ============================================
PORT=8000
NODE_ENV=development

# ============================================
# CORS & FRONTEND (RECOMMANDÉ)
# ============================================
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# ============================================
# RATE LIMITING (RECOMMANDÉ)
# ============================================
ORDER_RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
GENERAL_RATE_LIMIT_MAX=100

# ============================================
# CLOUDINARY - UPLOAD D'IMAGES (RECOMMANDÉ)
# ============================================
# Obtenez ces valeurs depuis: https://console.cloudinary.com/
CLOUDINARY_CLOUD_NAME=ddbavughv
CLOUDINARY_API_KEY=963751246787342
CLOUDINARY_API_SECRET=jd0fN2eFagTMkPZroTJ63_dWxRc

# ============================================
# EMAIL SERVICE (OPTIONNEL)
# ============================================
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=noreply@menuhub.com
SMTP_IGNORE_TLS=false

# ============================================
# REDIS CACHE (OPTIONNEL)
# ============================================
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379

# ============================================
# SWAGGER DOCUMENTATION (OPTIONNEL)
# ============================================
ENABLE_SWAGGER=false
API_URL=http://localhost:8000
```

## Notes Importantes

1. **Ne commitez JAMAIS le fichier .env dans Git**
2. Utilisez des valeurs différentes pour chaque environnement (dev, staging, prod)
3. En production, utilisez des secrets managers
4. Régénérez JWT_SECRET pour chaque environnement
5. Utilisez des mots de passe forts pour la base de données

