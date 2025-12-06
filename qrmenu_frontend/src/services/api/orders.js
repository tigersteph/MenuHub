import { request } from './index';

export function fetchOrders(placeId, token) {
  return request(`/api/places/${placeId}/orders`, { token });
}

export function completeOrder(id, data, token) {
  return request(`/api/orders/${id}/status`, { data, token, method: "PATCH" });
}

export function createPaymentIntent(data, token) {
  return request("/api/create_payment_intent", { data, token, method: "POST" });
}

// Créer une commande sans paiement (pour les clients)
export function createOrder(placeId, tableId, items, customerNotes = '') {
  // Pas de token nécessaire car c'est une route publique
  return request(`/api/places/${placeId}/orders/public`, {
    data: {
      tableId: tableId, // Envoyer tableId (UUID) au lieu de tableNumber
      items: items.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        unitPrice: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0)
      })),
      customerNotes
    },
    method: "POST"
  });
}

// Annuler une commande (pour les clients - route publique)
export function cancelOrder(placeId, orderId) {
  // Pas de token nécessaire car c'est une route publique
  return request(`/api/places/${placeId}/orders/${orderId}/cancel/public`, {
    method: "PATCH",
    data: {} // Envoyer un objet vide pour PATCH
  });
}

// Supprimer une commande (pour les restaurateurs)
export function deleteOrder(orderId, token) {
  return request(`/api/orders/${orderId}`, { token, method: "DELETE" });
}
