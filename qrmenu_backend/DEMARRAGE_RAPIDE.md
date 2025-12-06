# 🚀 Guide de Démarrage Rapide

## Problème Résolu ✅

Le backend ne démarrait pas car les dépendances n'étaient pas installées, notamment `swagger-jsdoc` et `swagger-ui-express`.

## Solution Appliquée

1. ✅ Installation de toutes les dépendances : `npm install`
2. ✅ Protection contre les erreurs Swagger (le serveur démarre même si Swagger n'est pas disponible)

## Démarrage du Serveur

### Option 1 : Mode Développement (avec rechargement auto)
```bash
cd qrmenu_backend
npm run dev
```

### Option 2 : Mode Production
```bash
cd qrmenu_backend
npm start
```

## Vérification

Une fois le serveur démarré, vous devriez voir :
```
🚀 Serveur démarré sur le port 8000
🌍 Environnement: development
```

Testez dans le navigateur : `http://localhost:8000/api/health`

Vous devriez voir :
```json
{
  "status": "OK",
  "timestamp": "...",
  "environment": "development"
}
```

## Configuration Requise

### Fichier `.env`

Créer un fichier `.env` dans `qrmenu_backend/` avec au minimum :

```env
PORT=8000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qrmenu
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_cle_secrete_longue
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## Problèmes Courants

### Erreur : "Cannot find module"
```bash
npm install
```

### Erreur : "ECONNREFUSED" (base de données)
- Vérifier que PostgreSQL est démarré
- Vérifier les credentials dans `.env`

### Erreur : "Port 8000 already in use"
- Changer le port dans `.env` : `PORT=8001`
- Ou arrêter le processus utilisant le port 8000

## Prochaines Étapes

1. ✅ Backend démarré
2. Démarrer le frontend dans un autre terminal :
   ```bash
   cd qrmenu_frontend
   npm start
   ```
3. Ouvrir `http://localhost:3000` dans le navigateur

---

**Date** : 2025-12-03

