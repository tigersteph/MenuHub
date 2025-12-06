# Checklist de Déploiement en Production

## ✅ Pré-déploiement

### Base de Données
- [ ] PostgreSQL installé et configuré
- [ ] Base de données `qrmenu` créée
- [ ] Migration `fix_orders_table_id.sql` exécutée
- [ ] Indexes créés (`create_indexes.sql`)
- [ ] Sauvegarde de la base de données effectuée
- [ ] Utilisateur PostgreSQL avec permissions appropriées

### Backend
- [ ] Node.js installé (version 14+)
- [ ] Variables d'environnement configurées (`.env`)
- [ ] `JWT_SECRET` généré et sécurisé
- [ ] `DB_PASSWORD` fort et sécurisé
- [ ] `CORS_ORIGIN` configuré pour le domaine frontend
- [ ] `NODE_ENV=production` défini
- [ ] Dépendances installées (`npm install --production`)
- [ ] Test de démarrage du serveur réussi

### Frontend
- [ ] Variables d'environnement configurées (`.env.production`)
- [ ] `REACT_APP_API_URL` pointant vers l'API de production
- [ ] Build de production créé (`npm run build`)
- [ ] Test du build local réussi

## 🚀 Déploiement

### Backend
- [ ] Serveur démarré (PM2, systemd, ou autre)
- [ ] Port configuré et accessible
- [ ] HTTPS configuré (Let's Encrypt recommandé)
- [ ] Firewall configuré (port 8000 ou autre)
- [ ] Health check accessible (`/api/health`)

### Frontend
- [ ] Fichiers statiques servis (Nginx, Apache, Vercel, Netlify)
- [ ] Routing SPA configuré (toutes routes vers `index.html`)
- [ ] HTTPS configuré
- [ ] Domaine configuré et accessible

## 🔒 Sécurité

- [ ] HTTPS activé (backend et frontend)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé (recommandé)
- [ ] Helmet activé (recommandé)
- [ ] `.env` fichiers non commités dans Git
- [ ] Mots de passe forts partout
- [ ] JWT_SECRET fort et unique

## 📊 Tests Post-Déploiement

### Workflow Client
- [ ] Scan QR code fonctionne
- [ ] Menu s'affiche correctement
- [ ] Ajout au panier fonctionne
- [ ] Création de commande fonctionne
- [ ] Message de confirmation affiché

### Workflow Restaurateur
- [ ] Connexion fonctionne
- [ ] Création établissement fonctionne
- [ ] Création tables fonctionne
- [ ] Création menu fonctionne
- [ ] Modification plats fonctionne
- [ ] Génération QR codes fonctionne
- [ ] Réception commandes fonctionne (polling 3s)
- [ ] Traitement commandes fonctionne
- [ ] Affichage nom de table correct

### Performance
- [ ] Temps de réponse API < 500ms
- [ ] Temps de chargement frontend < 3s
- [ ] Polling commandes fonctionne (3s)
- [ ] Rafraîchissement menu fonctionne (30s)

## 🔄 Maintenance

- [ ] Système de sauvegarde automatique configuré
- [ ] Monitoring configuré (logs, alertes)
- [ ] Plan de restauration en cas de problème
- [ ] Documentation à jour

## 📝 Notes

- Tester tous les workflows avant mise en production
- Faire une sauvegarde complète avant chaque mise à jour
- Monitorer les logs les premiers jours
- Avoir un plan de rollback en cas de problème

