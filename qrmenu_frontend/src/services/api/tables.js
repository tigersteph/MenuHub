import { request } from './index';

export function fetchTables(placeId, token) {
  return request(`/api/tables/place/${placeId}`, { token });
}

export function fetchTable(id, token) {
  return request(`/api/tables/${id}`, { token });
}

// Fonction publique pour récupérer une table sans authentification
export function fetchTablePublic(id) {
  return request(`/api/tables/${id}/public`, {});
}

export function addTable(data, token) {
  return request('/api/tables', { data, token, method: 'POST' });
}

export function updateTable(id, data, token) {
  return request(`/api/tables/${id}`, { data, token, method: 'PUT' });
}

export function removeTable(id, token) {
  return request(`/api/tables/${id}`, { token, method: 'DELETE', showErrorToast: true });
}
