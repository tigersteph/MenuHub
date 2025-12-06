import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { fetchOrders, completeOrder } from '../services';

/**
 * Hook personnalisé pour gérer les commandes d'un restaurant
 * @param {string} placeId - ID du restaurant
 * @returns {Object} Objet contenant les données et méthodes des commandes
 */
export const useOrders = (placeId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { makeRequest } = useApi();

  // Charger les commandes
  const loadOrders = useCallback(async () => {
    if (!placeId) return;
    
    setLoading(true);
    try {
      const ordersData = await makeRequest(fetchOrders, placeId);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }, [placeId, makeRequest]);

  // Marquer une commande comme terminée
  const markOrderAsComplete = useCallback(async (orderId, status = 'completed') => {
    try {
      const updatedOrder = await makeRequest(completeOrder, orderId, { status });
      setOrders(prev => 
        prev.map(order => order.id === orderId ? updatedOrder : order)
      );
      return updatedOrder;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }, [makeRequest]);

  // Filtrer les commandes par statut
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Obtenir les statistiques des commandes
  const getOrderStats = useCallback(() => {
    const stats = {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      inProgress: orders.filter(order => order.status === 'in_progress').length,
      completed: orders.filter(order => order.status === 'completed').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length
    };
    return stats;
  }, [orders]);

  // Recharger les commandes
  const refreshOrders = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    loading,
    markOrderAsComplete,
    getOrdersByStatus,
    getOrderStats,
    refreshOrders
  };
};

export default useOrders;
