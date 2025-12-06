/**
 * Middleware de transformation des données
 * Transforme automatiquement les requêtes entrantes (camelCase → snake_case)
 * et les réponses sortantes (snake_case → camelCase)
 */

const { transformRequest } = require('../utils/dataTransform');

/**
 * Middleware pour transformer les données de requête de camelCase vers snake_case
 * S'applique uniquement aux requêtes POST, PUT, PATCH
 */
function transformRequestBody(req, res, next) {
  // Transformer uniquement les requêtes avec body (POST, PUT, PATCH)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
    try {
      req.body = transformRequest(req.body);
    } catch (error) {
      console.error('Erreur lors de la transformation du body:', error);
      // Continuer sans transformation en cas d'erreur
    }
  }
  next();
}

module.exports = {
  transformRequestBody
};

