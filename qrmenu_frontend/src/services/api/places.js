import { request } from './index';

export function fetchPlaces(token) {
  return request("/api/places", { token });
}

export function fetchPlace(id, token, forceRefresh = false) {
  // Ajouter un paramètre de cache-busting si forceRefresh est true
  const url = forceRefresh 
    ? `/api/places/${id}?t=${Date.now()}`
    : `/api/places/${id}`;
  return request(url, { token });
}

// Fonction publique pour récupérer un établissement sans authentification
export function fetchPlacePublic(id) {
  return request(`/api/places/${id}/public`, {});
}

export function addPlace(data, token) {
  return request("/api/places", { data, token, method: "POST" });
}

export function updatePlace(id, data, token) {
  return request(`/api/places/${id}`, { data, token, method: "PUT" });
}

export function removePlace(id, token) {
  return request(`/api/places/${id}`, { token, method: "DELETE" });
}

/**
 * Récupère les statistiques d'un établissement
 * @param {number|string} id - ID de l'établissement
 * @param {string} token - Token d'authentification
 * @param {boolean} forceRefresh - Si true, force le rafraîchissement en bypassant le cache (ajoute ?refresh=true)
 * @returns {Promise} Promise résolue avec les statistiques
 */
export function fetchPlaceStats(id, token, forceRefresh = false) {
  const url = forceRefresh 
    ? `/api/places/${id}/stats?refresh=true`
    : `/api/places/${id}/stats`;
  return request(url, { token });
}

/**
 * Rafraîchit les statistiques d'un établissement en forçant le rafraîchissement
 * @param {number|string} id - ID de l'établissement
 * @param {string} token - Token d'authentification
 * @returns {Promise} Promise résolue avec les statistiques rafraîchies
 */
export function refreshPlaceStats(id, token) {
  return fetchPlaceStats(id, token, true);
}

export function duplicatePlace(id, token) {
  return request(`/api/places/${id}/duplicate`, { token, method: "POST" });
}