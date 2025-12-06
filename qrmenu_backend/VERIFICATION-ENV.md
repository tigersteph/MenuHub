# Vérification Automatique du Fichier .env

## Instructions

Exécutez cette commande dans le dossier `qrmenu_backend` :

```powershell
node verification-env-complete.js
```

Le script va :
1. ✅ Vérifier si le fichier `.env` existe
2. ✅ Créer le fichier `.env` avec les valeurs par défaut s'il n'existe pas
3. ✅ Vérifier toutes les variables requises
4. ✅ Tester la connexion à PostgreSQL
5. ✅ Générer un rapport dans `RAPPORT-VERIFICATION-ENV.txt`

## Variables Requises

Le fichier `.env` doit contenir au minimum :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qrmenu
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres_ici
JWT_SECRET=votre_cle_secrete_jwt_longue_et_securisee_ici
PORT=8000
NODE_ENV=development
```

## Actions si des erreurs sont détectées

1. **Fichier .env manquant** : Le script le créera automatiquement
2. **Variables manquantes** : Ajoutez-les au fichier `.env`
3. **Valeurs par défaut** : Remplacez `votre_mot_de_passe_postgres` et `votre_cle_secrete_jwt...` par vos vraies valeurs
4. **Erreur de connexion PostgreSQL** : 
   - Vérifiez que PostgreSQL est démarré
   - Vérifiez les credentials dans `.env`
   - Vérifiez que la base de données `qrmenu` existe

## Après la vérification

Une fois toutes les vérifications passées, vous pouvez démarrer le serveur :

```powershell
npm start
```


