# Solution : ERR_CONNECTION_REFUSED sur localhost:8000

## Problème
Le frontend essaie de se connecter à `http://localhost:8000/api/auth/login` mais reçoit une erreur `ERR_CONNECTION_REFUSED`.

## Cause
Le serveur backend n'est **pas démarré** ou ne fonctionne pas correctement.

## Solution

### 1. Vérifier que le serveur backend est démarré

Ouvrez un terminal PowerShell dans le dossier `qrmenu_backend` et exécutez :

```powershell
cd "c:\Users\STEPHANE GERV TIBE\resto_QR\qrmenu_backend"
npm start
```

Vous devriez voir :
```
🚀 Serveur démarré sur le port 8000
🌍 Environnement: development
```

### 2. Vérifier que le port 8000 est utilisé

Dans un autre terminal, vérifiez que le serveur écoute sur le port 8000 :

```powershell
netstat -ano | findstr :8000
```

Vous devriez voir une ligne avec `LISTENING`.

### 3. Tester l'endpoint de santé

Ouvrez votre navigateur et allez à : `http://localhost:8000/api/health`

Vous devriez voir :
```json
{
  "status": "OK",
  "timestamp": "...",
  "environment": "development"
}
```

### 4. Si le serveur ne démarre pas

#### Vérifier le fichier .env

Assurez-vous que le fichier `.env` existe dans `qrmenu_backend/` avec au minimum :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qrmenu
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_cle_secrete_tres_longue
PORT=8000
NODE_ENV=development
```

#### Vérifier PostgreSQL

Le serveur a besoin d'une connexion PostgreSQL. Vérifiez que :
- PostgreSQL est installé et démarré
- La base de données `qrmenu` existe
- Les credentials dans `.env` sont corrects

Testez la connexion :
```powershell
psql -U postgres -d qrmenu
```

#### Vérifier les dépendances

```powershell
cd "c:\Users\STEPHANE GERV TIBE\resto_QR\qrmenu_backend"
npm install
```

### 5. Démarrer le serveur en mode développement

Pour un rechargement automatique lors des modifications :

```powershell
npm run dev
```

## Résumé

1. ✅ Démarrer le serveur backend : `npm start` dans `qrmenu_backend`
2. ✅ Vérifier que le port 8000 est utilisé : `netstat -ano | findstr :8000`
3. ✅ Tester l'endpoint : `http://localhost:8000/api/health`
4. ✅ Vérifier le fichier `.env` avec les bonnes variables
5. ✅ Vérifier que PostgreSQL est démarré et accessible

Une fois le serveur démarré, l'erreur `ERR_CONNECTION_REFUSED` devrait disparaître.


