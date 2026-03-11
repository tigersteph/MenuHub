# Credentials - MenuHub QR

⚠️ **IMPORTANT :** Ce fichier contient des informations sensibles. Ne JAMAIS le commiter dans Git !

Copiez ce fichier en `CREDENTIALS.md` (qui est dans .gitignore) et remplissez-le avec vos vraies valeurs.

## Supabase (PostgreSQL)

```
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[VOTRE_MOT_DE_PASSE_SUPABASE]
```

**Connection String complète :**
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

## Upstash (Redis)

```
REDIS_URL=redis://default:[PASSWORD]@[HOST]:[PORT]
```

## Cloudinary

```
CLOUDINARY_CLOUD_NAME=[VOTRE_CLOUD_NAME]
CLOUDINARY_API_KEY=[VOTRE_API_KEY]
CLOUDINARY_API_SECRET=[VOTRE_API_SECRET]
```

## Render (Backend)

```
BACKEND_URL=https://qrmenu-backend.onrender.com
JWT_SECRET=[GÉNÉRER AVEC: npm run generate:jwt-secret]
```

## Vercel (Frontend)

```
FRONTEND_URL=https://votre-projet.vercel.app
```

## URLs de Production

```
Frontend: https://votre-projet.vercel.app
Backend: https://qrmenu-backend.onrender.com
API Health: https://qrmenu-backend.onrender.com/api/health
```

## Notes

- Date de création : _______________
- Date de dernière mise à jour : _______________

