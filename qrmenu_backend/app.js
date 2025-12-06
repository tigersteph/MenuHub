console.log('DEBUG: app.js is starting...');
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
// Les autres routes seront importées ici
// const menuRoutes = require('./routes/menu');
// const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 8000;
const placeRoutes = require('./routes/places');
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const categoryRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');

// Middleware
// CORS configuration - à restreindre en production
const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  // Enlever le slash final s'il existe et convertir en minuscules pour comparaison
  return origin.replace(/\/$/, '').toLowerCase();
};

const corsOptions = {
  origin: (origin, callback) => {
    // En développement, autoriser toutes les origines
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // En production, vérifier l'origine
    const allowedOrigin = normalizeOrigin(process.env.CORS_ORIGIN || process.env.FRONTEND_URL);

    // Si pas d'origine configurée, refuser
    if (!allowedOrigin) {
      return callback(new Error('CORS_ORIGIN not configured'));
    }

    // Si pas d'origine dans la requête (same-origin ou requête directe), autoriser
    // Cela peut arriver pour les requêtes preflight ou same-origin
    if (!origin) {
      // Autoriser les requêtes sans origin (same-origin)
      return callback(null, true);
    }

    const requestOrigin = normalizeOrigin(origin);

    // Comparer les origines normalisées
    if (requestOrigin === allowedOrigin) {
      callback(null, true);
    } else {
      // Logger pour debug
      console.log('CORS blocked:', {
        requestOrigin,
        allowedOrigin,
        rawRequestOrigin: origin,
        rawAllowedOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy pour obtenir la vraie IP en production (nécessaire pour le rate limiting)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware de transformation des données (camelCase → snake_case pour les requêtes)
// Note: Désactivé par défaut pour éviter de casser le code existant
// Décommenter si vous voulez activer la transformation automatique
// const { transformRequestBody } = require('./middlewares/dataTransform');
// app.use(transformRequestBody);
// Routes d'authentification (publiques) - DOIT être en premier
app.use('/api/auth', authRoutes);

// Routes protégées - ordre important pour éviter les conflits
app.use('/api/places', placeRoutes);
app.use('/api/menu', menuItemRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/upload', uploadRoutes);
// Routes de commandes - monté sur /api pour capturer /api/places/:placeId/orders
app.use('/api', orderRoutes);
// Les autres routes seront ajoutées ici
// app.use('/api/menu', menuRoutes);
// app.use('/api/orders', orderRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Documentation API Swagger (optionnel)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  try {
    const { swaggerUi, specs } = require('./swagger');
    const logger = require('./utils/logger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'MenuHub API Documentation'
    }));
    logger.info('Swagger documentation available at /api-docs');
  } catch (error) {
    console.warn('Swagger non disponible (dépendances manquantes). Installer avec: npm install swagger-jsdoc swagger-ui-express');
  }
}

// Gestion des erreurs 404
app.use((req, res, next) => {
  // S'assurer que la réponse est toujours en JSON
  if (!res.headersSent) {
    res.status(404).json({ 
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route non trouvée'
      },
      path: req.originalUrl
    });
  } else {
    next();
  }
});

// Gestionnaire d'erreurs global
const { errorHandler } = require('./utils/errors');
app.use(errorHandler);

// Initialiser le cache Redis
const cacheService = require('./utils/cache');
cacheService.connect().catch(err => {
  console.warn('Cache Redis non disponible, fonctionnement sans cache:', err.message);
});

// Initialiser le service d'email
const emailService = require('./services/email');
emailService.initialize().catch(err => {
  console.warn('Email service non disponible, fonctionnement sans emails:', err.message);
});

// Démarrer le serveur
console.log('DEBUG: about to call app.listen on port', PORT);
const server = app.listen(PORT, async () => {
  const logger = require('./utils/logger');
  logger.info('Server started', { port: PORT, environment: process.env.NODE_ENV || 'development' });
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialiser WebSocket pour notifications temps réel
  try {
    const webSocketService = require('./services/websocket');
    webSocketService.initialize(server);
  } catch (err) {
    console.warn('WebSocket service non disponible:', err.message);
  }
});

// Nettoyer à l'arrêt
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await cacheService.disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  const logger = require('./utils/logger');
  logger.error('Unhandled rejection', { error: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});

module.exports = app;