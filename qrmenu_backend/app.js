console.log('DEBUG: app.js is starting...');
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
// Les autres routes seront importées ici
// const menuRoutes = require('./routes/menu');
// const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;
const placeRoutes = require('./routes/places');
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const categoryRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');
const logger = require('./utils/logger');

// Middleware
// CORS configuration - à restreindre en production
const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  // Enlever le slash final s'il existe et convertir en minuscules pour comparaison
  return origin.replace(/\/$/, '').toLowerCase();
};

const configuredFrontend = normalizeOrigin(process.env.FRONTEND_URL);
const configuredCorsOrigin = normalizeOrigin(process.env.CORS_ORIGIN);
const allowedOrigins = [
  configuredFrontend,
  configuredCorsOrigin,
  'https://menu-hub-ten.vercel.app',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes serveur-à-serveur / health checks sans Origin
    if (!origin) {
      return callback(null, true);
    }

    const requestOrigin = normalizeOrigin(origin);

    if (allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', {
        requestOrigin,
        allowedOrigins,
        rawRequestOrigin: origin,
        rawAllowedOrigins: {
          FRONTEND_URL: process.env.FRONTEND_URL,
          CORS_ORIGIN: process.env.CORS_ORIGIN
        }
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}; 
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const authApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Trop de tentatives. Veuillez réessayer plus tard.'
    }
  }
});

// Compression HTTP pour réduire la taille des réponses
const compression = require('compression');
app.use(compression({
  filter: (req, res) => {
    // Compresser toutes les réponses sauf les images déjà compressées
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Niveau de compression équilibré
}));

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
app.use('/api/auth', authApiLimiter, authRoutes);
// Route de contact (publique)
app.use('/api/contact', contactRoutes);

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

// Health check Koyeb (sans auth)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Route legacy conservée pour compatibilité
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
const server = app.listen(PORT, '0.0.0.0', async () => {
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

const db = require('./config/db');
let shuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received, shutting down gracefully`);

  const forceCloseTimer = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);

  try {
    await cacheService.disconnect();
    await db.pool.end();
    logger.info('Database pool closed');

    server.close(() => {
      clearTimeout(forceCloseTimer);
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (err) {
    clearTimeout(forceCloseTimer);
    logger.error('Graceful shutdown failed', { error: err.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  const logger = require('./utils/logger');
  logger.error('Unhandled rejection', { error: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});

module.exports = app;