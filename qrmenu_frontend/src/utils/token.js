/**
 * Utilitaires pour la gestion des tokens JWT
 */

/**
 * Vérifie si un token JWT est valide et non expiré
 * @param {string} token - Le token JWT à vérifier
 * @returns {boolean} - true si le token est valide et non expiré, false sinon
 */
export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return false;
  }

  try {
    // Décoder le payload du JWT (sans vérifier la signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    // Vérifier si le token est expiré
    if (payload.exp && payload.exp < now) {
      // Token expiré - le supprimer du sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('token');
      }
      return false;
    }

    return true;
  } catch (e) {
    // Token invalide (format incorrect, ne peut pas être décodé)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('token');
    }
    return false;
  }
};

/**
 * Récupère un token valide depuis le sessionStorage
 * @returns {string|null} - Le token valide ou null si aucun token valide n'est trouvé
 */
export const getValidToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = sessionStorage.getItem('token');
  if (isTokenValid(token)) {
    return token;
  }

  return null;
};

/**
 * Décode le payload d'un token JWT
 * @param {string} token - Le token JWT
 * @returns {object|null} - Le payload décodé ou null en cas d'erreur
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    return JSON.parse(atob(parts[1]));
  } catch (e) {
    return null;
  }
};
