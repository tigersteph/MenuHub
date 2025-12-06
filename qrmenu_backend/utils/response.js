/**
 * Utilitaires pour standardiser les réponses API
 * Assure une cohérence dans tous les endpoints
 */

const { transformResponse } = require('./dataTransform');

/**
 * Réponse de succès standardisée
 * Transforme automatiquement les données de snake_case (BD) vers camelCase (API)
 */
function success(res, data = null, message = null, statusCode = 200) {
  const response = {
    success: true
  };
  
  if (data !== null) {
    try {
      // Transformer les données de snake_case vers camelCase pour l'API
      response.data = transformResponse(data);
    } catch (transformError) {
      // En cas d'erreur de transformation, logger l'erreur et retourner les données non transformées
      const logger = require('./logger');
      logger.warn('Data transformation error', { 
        error: transformError.message, 
        stack: transformError.stack,
        dataType: typeof data,
        isArray: Array.isArray(data)
      });
      // Retourner les données telles quelles en cas d'erreur de transformation
      response.data = data;
    }
  }
  
  if (message) {
    response.message = message;
  }
  
  return res.status(statusCode).json(response);
}

/**
 * Réponse d'erreur standardisée
 */
function error(res, code, message, details = null, statusCode = 400) {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };
  
  if (details) {
    response.error.details = details;
  }
  
  return res.status(statusCode).json(response);
}

/**
 * Wrapper pour gérer les erreurs dans les contrôleurs
 */
function handleControllerError(res, err, defaultMessage = 'Une erreur est survenue') {
  const logger = require('./logger');
  
  // Erreur opérationnelle (déjà formatée)
  if (err.isOperational) {
    logger.warn('Operational error', { code: err.code, message: err.message });
    return error(res, err.code, err.message, err.errors, err.statusCode);
  }
  
  // Erreur de validation
  if (err.name === 'ValidationError') {
    logger.warn('Validation error', { message: err.message });
    return error(res, 'VALIDATION_ERROR', err.message, err.details, 400);
  }
  
  // Erreur inattendue
  logger.error('Unexpected error', { error: err.message, stack: err.stack });
  return error(
    res,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'production' ? defaultMessage : err.message,
    null,
    500
  );
}

module.exports = {
  success,
  error,
  handleControllerError
};

