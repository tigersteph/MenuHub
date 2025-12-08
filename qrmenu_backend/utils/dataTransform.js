/**
 * Utilitaires de transformation des données
 * Convertit entre snake_case (BD) et camelCase (API/Frontend)
 */

/**
 * Convertit une URL HTTP en HTTPS si nécessaire
 * @param {string} url - L'URL à convertir
 * @returns {string} - L'URL en HTTPS
 */
function ensureHttps(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }
  
  // Si l'URL commence par http://, la remplacer par https://
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  return url;
}

/**
 * Convertit un objet de snake_case vers camelCase
 * @param {Object} obj - Objet en snake_case
 * @returns {Object} - Objet en camelCase
 */
function toCamelCase(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Gérer les dates (objets Date ou strings de dates PostgreSQL)
  if (obj instanceof Date) {
    return obj;
  }

  // Gérer les types primitifs
  if (typeof obj !== 'object') {
    return obj;
  }

  // Gérer les tableaux
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }

  // Gérer les objets spéciaux (Buffer, etc.)
  if (obj.constructor && obj.constructor !== Object && !(obj instanceof Date)) {
    // Si c'est un objet spécial (comme Buffer), retourner tel quel ou convertir en string
    if (obj.toString && typeof obj.toString === 'function') {
      return obj.toString();
    }
    return obj;
  }

  const camelCaseObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = snakeToCamel(key);
      let value = obj[key];
      
      // Convertir les URLs d'images en HTTPS pour éviter les erreurs Mixed Content
      if ((key === 'image_url' || key === 'logo_url' || key === 'url' || key === 'secure_url') && typeof value === 'string') {
        value = ensureHttps(value);
      }
      
      // Gérer les valeurs null/undefined
      if (value === null || value === undefined) {
        camelCaseObj[camelKey] = value;
        continue;
      }
      
      // Gérer les dates (objets Date ou strings de dates)
      if (value instanceof Date) {
        camelCaseObj[camelKey] = value;
        continue;
      }
      
      // Récursion pour les objets imbriqués
      camelCaseObj[camelKey] = toCamelCase(value);
    }
  }
  return camelCaseObj;
}

/**
 * Convertit un objet de camelCase vers snake_case
 * @param {Object} obj - Objet en camelCase
 * @returns {Object} - Objet en snake_case
 */
function toSnakeCase(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const snakeCaseObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = camelToSnake(key);
      snakeCaseObj[snakeKey] = toSnakeCase(obj[key]);
    }
  }
  return snakeCaseObj;
}

/**
 * Convertit une clé snake_case en camelCase
 * @param {string} str - Chaîne en snake_case
 * @returns {string} - Chaîne en camelCase
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Convertit une clé camelCase en snake_case
 * @param {string} str - Chaîne en camelCase
 * @returns {string} - Chaîne en snake_case
 */
function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Transforme les données de réponse pour l'API (snake_case → camelCase)
 * @param {any} data - Données à transformer
 * @returns {any} - Données transformées
 */
function transformResponse(data) {
  return toCamelCase(data);
}

/**
 * Transforme les données de requête pour la BD (camelCase → snake_case)
 * @param {any} data - Données à transformer
 * @returns {any} - Données transformées
 */
function transformRequest(data) {
  return toSnakeCase(data);
}

module.exports = {
  toCamelCase,
  toSnakeCase,
  snakeToCamel,
  camelToSnake,
  transformResponse,
  transformRequest
};

