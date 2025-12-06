# 🚀 Guide de Démarrage Rapide - MenuHub

Guide rapide pour déployer MenuHub et commencer les tests en situation réelle.

## ⚡ Déploiement Rapide (5 minutes)

### 1. Préparer les Variables d'Environnement

**Backend:**
```bash
cd qrmenu_backend
cp env.production.example .env
# Éditez .env avec vos valeurs
```

**Frontend:**
```bash
cd qrmenu_frontend
cp env.production.example .env.production
# Éditez .env.production avec vos valeurs
```

### 2. Build de Production

```bash
# Backend
cd qrmenu_backend
npm install --production

# Frontend
cd qrmenu_frontend
npm install
npm run build
```

### 3. Démarrer le Backend

```bash
cd qrmenu_backend
npm install -g pm2
pm2 start app.js --name menuhub-backend --env production
pm2 save
```

### 4. Servir le Frontend

**Option A: Avec Nginx (Recommandé)**
- Suivez le guide dans `DEPLOYMENT_GUIDE.md`
- Utilisez `nginx.conf.example`

**Option B: Avec serve (Test rapide)**
```bash
cd qrmenu_frontend
npm install -g serve
serve -s build -l 3000
```

## 🧪 Tests Rapides

1. **Vérifier le backend:**
   - Ouvrir: `http://localhost:8000/api/health`
   - Doit retourner: `{"status":"OK"}`

2. **Créer un compte:**
   - Aller sur: `http://localhost:3000/register`
   - Créer un compte test

3. **Créer un établissement:**
   - Se connecter
   - Créer un établissement
   - Ajouter des tables et un menu

4. **Tester le QR Code:**
   - Générer un QR code pour une table
   - Scanner avec un téléphone
   - Vérifier que le menu s'affiche

## 📋 Checklist Minimale

- [ ] Backend démarré et accessible
- [ ] Frontend buildé et accessible
- [ ] Compte créé et connecté
- [ ] Établissement créé
- [ ] QR code généré et scannable
- [ ] Menu client accessible

## 🔗 URLs Importantes

- **Frontend:** `http://localhost:3000` ou votre domaine
- **Backend API:** `http://localhost:8000/api`
- **Health Check:** `http://localhost:8000/api/health`
- **Menu Public:** `http://localhost:3000/menu/{placeId}/{tableId}`

## 📚 Documentation Complète

Pour plus de détails, consultez:
- `DEPLOYMENT_GUIDE.md` - Guide complet de déploiement
- `TESTING_CHECKLIST.md` - Checklist complète de tests

## 🆘 Problèmes Courants

**Backend ne démarre pas:**
- Vérifier que PostgreSQL est démarré
- Vérifier les variables d'environnement dans `.env`

**Frontend ne charge pas:**
- Vérifier que `REACT_APP_API_URL` est correct
- Vérifier que le backend est accessible

**Erreurs CORS:**
- Vérifier que `CORS_ORIGIN` dans le backend correspond à l'URL du frontend

Bon déploiement ! 🚀
