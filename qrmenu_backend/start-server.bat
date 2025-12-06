@echo off
echo ========================================
echo Demarrage du serveur backend
echo ========================================
echo.

cd /d "%~dp0"

echo Verification des variables d'environnement...
if not exist .env (
    echo ERREUR: Le fichier .env n'existe pas!
    echo.
    echo Creer un fichier .env avec les variables suivantes:
    echo   DB_HOST=localhost
    echo   DB_PORT=5432
    echo   DB_NAME=qrmenu
    echo   DB_USER=postgres
    echo   DB_PASSWORD=votre_mot_de_passe
    echo   JWT_SECRET=votre_cle_secrete
    echo   PORT=8000
    echo   NODE_ENV=development
    echo.
    pause
    exit /b 1
)

echo Fichier .env trouve.
echo.

echo Demarrage du serveur sur le port 8000...
echo.

node app.js

if errorlevel 1 (
    echo.
    echo ERREUR: Le serveur n'a pas pu demarrer!
    echo.
    echo Verifiez:
    echo   1. PostgreSQL est demarre
    echo   2. Les credentials dans .env sont corrects
    echo   3. La base de donnees existe: psql -U postgres -d qrmenu
    echo.
    pause
)


