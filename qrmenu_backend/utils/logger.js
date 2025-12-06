/**
 * Système de logs structuré avec Winston
 * Permet un logging cohérent et configurable
 */

const winston = require('winston');
const path = require('path');

// Configuration des formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'qrmenu-backend' },
  transports: [
    // Fichier pour les erreurs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Fichier pour tous les logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log')
    })
  ]
});

// Toujours logger dans la console pour voir les logs dans Render/Vercel
logger.add(new winston.transports.Console({
  format: consoleFormat
}));

// Méthodes helper pour un usage simplifié
logger.request = (req, message = 'Request received') => {
  logger.info(message, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });
};

logger.errorRequest = (req, error, message = 'Request error') => {
  logger.error(message, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    error: error.message,
    stack: error.stack,
    userId: req.user?.id
  });
};

logger.orderCreated = (orderId, placeId, tableId, totalAmount) => {
  logger.info('Order created', {
    orderId,
    placeId,
    tableId,
    totalAmount,
    event: 'order.created'
  });
};

logger.orderStatusChanged = (orderId, oldStatus, newStatus) => {
  logger.info('Order status changed', {
    orderId,
    oldStatus,
    newStatus,
    event: 'order.status_changed'
  });
};

module.exports = logger;

