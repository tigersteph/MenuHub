import { request } from './index';

export function addCategory(data, token) {
  return request(`/api/categories`, { data, token, method: "POST" });
}

export function addMenuItems(data, token) {
  return request(`/api/menu/${data.placeId}/items`, { data, token, method: "POST" });
}

export function updateMenuItem(id, data, token) {
  return request(`/api/menu/items/${id}`, { data, token, method: "PUT" });
}

export function removeCategory(id, token) {
  return request(`/api/categories/${id}`, { token, method: "DELETE" });
}

export function updateCategory(id, data, token) {
  return request(`/api/categories/${id}`, { data, token, method: "PUT" });
}

export function removeMenuItem(id, token) {
  return request(`/api/menu/items/${id}`, { token, method: "DELETE" });
}

export function updateMenuItemAvailability(id, isAvailable, token) {
  return request(`/api/menu/items/${id}/availability`, { 
    data: { isAvailable }, 
    token, 
    method: "PATCH" 
  });
}