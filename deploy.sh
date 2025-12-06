#!/bin/bash

# Script de déploiement automatisé pour MenuHub
# Usage: ./deploy.sh [backend|frontend|all]

set -e

BACKEND_DIR="qrmenu_backend"
FRONTEND_DIR="qrmenu_frontend"

deploy_backend() {
    echo "🚀 Déploiement du backend..."
    cd "$BACKEND_DIR"
    
    echo "📦 Installation des dépendances..."
    npm install --production
    
    echo "✅ Backend prêt pour le déploiement"
    echo "💡 Utilisez PM2 pour démarrer: pm2 start app.js --name menuhub-backend --env production"
    cd ..
}

deploy_frontend() {
    echo "🚀 Déploiement du frontend..."
    cd "$FRONTEND_DIR"
    
    echo "📦 Installation des dépendances..."
    npm install
    
    echo "🔨 Build de production..."
    npm run build
    
    echo "✅ Frontend buildé dans le dossier build/"
    echo "💡 Copiez le contenu de build/ vers votre serveur web"
    cd ..
}

deploy_all() {
    echo "🚀 Déploiement complet de MenuHub..."
    deploy_backend
    deploy_frontend
    echo "✅ Déploiement terminé !"
}

case "$1" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all|"")
        deploy_all
        ;;
    *)
        echo "Usage: $0 [backend|frontend|all]"
        exit 1
        ;;
esac
