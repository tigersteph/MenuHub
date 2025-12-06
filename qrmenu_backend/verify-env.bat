@echo off
chcp 65001 >nul
echo ========================================
echo Vérification automatique du fichier .env
echo ========================================
echo.

cd /d "%~dp0"

if not exist .env (
    echo [ERREUR] Le fichier .env n'existe pas!
    echo.
    echo Création du fichier .env avec les variables minimales...
    echo.
    
    (
        echo # Configuration Base de données
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=qrmenu
        echo DB_USER=postgres
        echo DB_PASSWORD=votre_mot_de_passe_postgres
        echo.
        echo # JWT
        echo JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_securisee_changez_moi
        echo.
        echo # Serveur
        echo PORT=8000
        echo NODE_ENV=development
        echo.
        echo # Pool de connexions PostgreSQL
        echo DB_POOL_MAX=20
        echo DB_POOL_MIN=2
        echo DB_POOL_IDLE_TIMEOUT=30000
        echo DB_POOL_CONNECTION_TIMEOUT=2000
        echo.
        echo # CORS
        echo CORS_ORIGIN=http://localhost:3000
        echo FRONTEND_URL=http://localhost:3000
        echo.
        echo # Redis (optionnel)
        echo REDIS_ENABLED=false
        echo.
        echo # Email (optionnel)
        echo EMAIL_ENABLED=false
    ) > .env
    
    echo [OK] Fichier .env créé!
    echo.
    echo [IMPORTANT] Modifiez les valeurs suivantes dans .env:
    echo   - DB_PASSWORD: votre mot de passe PostgreSQL
    echo   - JWT_SECRET: une clé secrète longue et sécurisée (minimum 32 caractères)
    echo.
    pause
    exit /b 1
)

echo [OK] Fichier .env trouvé
echo.

echo Vérification des variables requises...
echo.

node check-env.js

if errorlevel 1 (
    echo.
    echo [ERREUR] Des problèmes ont été détectés dans la configuration.
    echo.
    echo Actions à effectuer:
    echo   1. Ouvrez le fichier .env dans qrmenu_backend/
    echo   2. Ajoutez ou modifiez les variables manquantes
    echo   3. Assurez-vous que DB_PASSWORD correspond à votre mot de passe PostgreSQL
    echo   4. Assurez-vous que JWT_SECRET est une clé longue et sécurisée
    echo   5. Relancez ce script pour vérifier
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCÈS] Configuration complète et fonctionnelle!
echo Vous pouvez maintenant démarrer le serveur avec: npm start
echo.
pause


