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

// En production (Northflank, Koyeb, Fly.io, etc.), le filesystem est généralement
// read-only ou éphémère. On désactive donc les transports File pour éviter
// les crashes silencieux lors des écritures asynchrones.
const isProduction = process.env.NODE_ENV === 'production';

const transports = [];
const exceptionHandlers = [];
const rejectionHandlers = [];

if (!isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  exceptionHandlers.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log')
    })
  );

  rejectionHandlers.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log')
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'qrmenu-backend' },
  transports,
  exceptionHandlers,
  rejectionHandlers
});

// Toujours logger dans la console (capturé par Northflank / Render / Vercel / Fly)
logger.add(new winston.transports.Console({
  format: consoleFormat,
  handleExceptions: isProduction,
  handleRejections: isProduction
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

