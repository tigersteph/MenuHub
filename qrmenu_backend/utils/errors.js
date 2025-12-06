/**
 * Gestion centralisée des erreurs
 * Suit les standards HTTP et les bonnes pratiques
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Ressource') {
    super(`${resource} non trouvé(e)`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Non autorisé') {
    super(message, 403, 'UNAUTHORIZED');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflit de ressources') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Middleware de gestion d'erreurs
 */
function errorHandler(err, req, res, next) {
  // Erreur opérationnelle (erreur prévue)
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.errors && { details: err.errors })
      }
    });
  }

  // Erreur de validation (Joi, express-validator, etc.)
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Données invalides',
        details: err.details || err.message
      }
    });
  }

  // Erreur de base de données
  if (err.code === '23505') { // Violation de contrainte unique PostgreSQL
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Cette ressource existe déjà'
      }
    });
  }

  if (err.code === '23503') { // Violation de contrainte de clé étrangère
    return res.status(400).json({
      success: false,
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Référence à une ressource inexistante'
      }
    });
  }

  // Erreur inattendue
  const logger = require('./logger');
  logger.error('Erreur non gérée', {
    error: err.message,
    stack: err.stack,
    name: err.name,
    code: err.code,
    path: req?.path,
    method: req?.method
  });
  
  // S'assurer que la réponse n'a pas déjà été envoyée
  if (res.headersSent) {
    return next(err);
  }
  
  // Toujours renvoyer du JSON, même en cas d'erreur inattendue
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Une erreur est survenue' 
        : err.message
    }
  });
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  errorHandler
};

