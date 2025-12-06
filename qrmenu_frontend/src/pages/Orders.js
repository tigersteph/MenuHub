import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { fetchOrders, completeOrder } from '../services';
import { deleteOrder } from '../services/api/orders';
import AuthContext from '../contexts/AuthContext';
import BackButton from '../components/ui/BackButton';
import OrdersByTable from '../components/business/OrdersByTable';
import useWebSocket from '../hooks/useWebSocket';
import { toast } from '../utils/toast';

const Orders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [newOrderNotification, setNewOrderNotification] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false); // Désactivé par défaut, WebSocket utilisé
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pollingDelay, setPollingDelay] = useState(3000); // Fallback si WebSocket échoue
  const errorCountRef = React.useRef(0);
  const previousOrdersCount = React.useRef(0);
  const pollingIntervalRef = React.useRef(null);
  const params = useParams();
  const history = useHistory();
  const auth = useContext(AuthContext);

  const onBack = () => history.push(`/places/${params.id}`);

  const onFetchOrders = React.useCallback(async () => {
    // Check if token exists
    if (!auth.token) {
      setError('Vous devez être connecté pour voir les commandes.');
      setIsPolling(false);
      setIsLoading(false);
      return;
    }

    // Check network connection
    if (!navigator.onLine) {
      setIsOnline(false);
      setError('Pas de connexion internet. Vérifiez votre connexion.');
      setIsPolling(false);
      setIsLoading(false);
      return;
    }

    try {
      const json = await fetchOrders(params.id, auth.token);
      
      // Le backend peut retourner { success: true, data: [...] } ou directement un array
      let ordersArray = null;
      if (json && Array.isArray(json)) {
        ordersArray = json;
      } else if (json && json.data && Array.isArray(json.data)) {
        ordersArray = json.data;
      } else if (json && json.success && json.data && Array.isArray(json.data)) {
        ordersArray = json.data;
      }
      
      if (ordersArray !== null) {
        // Success: reset everything and set orders (even if empty array)
        console.log('[Orders] Commandes reçues:', ordersArray.length, ordersArray);
        setOrders(ordersArray);
        setError(null);
        errorCountRef.current = 0; // Reset error count on success
        setPollingDelay(3000); // Reset polling delay on success
        setIsLoading(false);
      } else if (json === null) {
        // null means there was an error (handled by request function)
        errorCountRef.current += 1;
        
        // For server errors (500), stop polling but allow manual retry
        if (errorCountRef.current >= 2) {
          // Stop polling after 2 consecutive errors
          setIsPolling(false);
          setError('Erreur serveur (500). Le service de commandes est temporairement indisponible. Vérifiez que le serveur backend est démarré et que l\'endpoint existe.');
          setIsLoading(false);
          return;
        }
        
        // Exponential backoff: 3s -> 6s -> stop
        if (errorCountRef.current === 1) {
          setPollingDelay(6000); // 6 seconds
        }
        
        setIsLoading(false);
      } else {
        // Unexpected response format - treat as empty orders
        setOrders([]);
        setError(null);
        errorCountRef.current = 0;
        setIsLoading(false);
      }
    } catch (err) {
      errorCountRef.current += 1;
      setIsLoading(false);
      
      // Stop polling faster on catch errors
      if (errorCountRef.current >= 2) {
        setIsPolling(false);
        setError(err.message || 'Erreur lors de la récupération des commandes. Veuillez rafraîchir la page.');
        return;
      }
      
      // Exponential backoff on first error
      if (errorCountRef.current === 1) {
        setPollingDelay(6000);
      }
    }
  }, [params.id, auth.token]);

  // Mémoriser les callbacks WebSocket pour éviter les reconnexions
  const handleNewOrder = useCallback((newOrder) => {
    // Rafraîchir la liste des commandes
    onFetchOrders();
    // Notification toast
    toast.success(`Nouvelle commande reçue - Table ${newOrder.table || newOrder.tableId || newOrder.table_id || 'N/A'}`);
    setNewOrderNotification(true);
    setTimeout(() => setNewOrderNotification(false), 5000);
  }, [onFetchOrders]);

  const handleOrderStatusChanged = useCallback((data) => {
    // Rafraîchir la liste pour voir le nouveau statut
    onFetchOrders();
  }, [onFetchOrders]);

  // WebSocket pour notifications temps réel (DOIT être avant le useEffect qui l'utilise)
  const { isConnected: wsConnected, connectionError: wsError } = useWebSocket(params.id, {
    enabled: !!params.id && !!auth.token,
    onNewOrder: handleNewOrder,
    onOrderStatusChanged: handleOrderStatusChanged
  });

  // Activer le polling en fallback si WebSocket n'est pas connecté
  useEffect(() => {
    if (!wsConnected && !wsError) {
      // WebSocket en cours de connexion, attendre un peu
      return;
    }
    if (!wsConnected && wsError) {
      // WebSocket a échoué, activer le polling en fallback
      setIsPolling(true);
    } else if (wsConnected) {
      // WebSocket connecté, désactiver le polling
      setIsPolling(false);
    }
  }, [wsConnected, wsError]);

  // Memoized handlers to prevent unnecessary re-renders
  const onAcceptOrder = React.useCallback(async (orderId) => {
    try {
      const json = await completeOrder(orderId, { status: "processing"}, auth.token);
      if (json !== null) {
        // Optimistic update: immediately refresh without waiting
        onFetchOrders();
      }
    } catch (err) {
      console.error('Error accepting order:', err);
    }
  }, [auth.token, onFetchOrders]);

  const onDeclineOrder = React.useCallback(async (orderId) => {
    try {
      // Supprimer immédiatement la commande refusée
      const json = await deleteOrder(orderId, auth.token);
      if (json !== null && (json.success || json.deleted)) {
        toast.success('Commande refusée et supprimée');
        onFetchOrders();
      } else {
        // Fallback : marquer comme annulée puis supprimer
        await completeOrder(orderId, { status: "cancelled"}, auth.token);
        const deleteResult = await deleteOrder(orderId, auth.token);
        if (deleteResult !== null) {
          toast.success('Commande refusée et supprimée');
          onFetchOrders();
        }
      }
    } catch (err) {
      console.error('Error declining order:', err);
      toast.error('Erreur lors du refus de la commande');
    }
  }, [auth.token, onFetchOrders]);

  const onReadyForPickup = React.useCallback(async (orderId) => {
    try {
      const json = await completeOrder(orderId, { status: "ready"}, auth.token);
      if (json !== null) {
        toast.success('Commande prête à être servie');
        onFetchOrders();
      }
    } catch (err) {
      console.error('Error marking order as ready:', err);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  }, [auth.token, onFetchOrders]);

  const onServed = React.useCallback(async (orderId) => {
    try {
      const json = await completeOrder(orderId, { status: "completed"}, auth.token);
      if (json !== null) {
        onFetchOrders();
      }
    } catch (err) {
      console.error('Error marking order as served:', err);
    }
  }, [auth.token, onFetchOrders]);

  const onCompleteOrder = React.useCallback(async (orderId) => {
    try {
      // Supprimer la commande servie (une fois terminée, elle est supprimée)
      const json = await deleteOrder(orderId, auth.token);
      if (json !== null && (json.success || json.deleted)) {
        toast.success('Commande terminée et supprimée');
        onFetchOrders();
      } else {
        toast.error('Erreur lors de la suppression de la commande');
      }
    } catch (err) {
      console.error('Error completing order:', err);
      toast.error('Erreur lors de la suppression de la commande');
    }
  }, [auth.token, onFetchOrders]);

  // Effect to handle polling with dynamic delay
  useEffect(() => {
    onFetchOrders();
    
    if (!isPolling) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }
    
    // Clear previous interval if exists
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Start polling with current delay
    pollingIntervalRef.current = setInterval(() => {
      // Only poll if page is visible and polling is enabled and online
      if (isPolling && !document.hidden && navigator.onLine) {
        onFetchOrders();
      }
    }, pollingDelay);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [onFetchOrders, isPolling, pollingDelay]);

  // Pause polling when page is hidden, resume when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isPolling && isOnline) {
        // Refresh immediately when page becomes visible
        onFetchOrders();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onFetchOrders, isPolling, isOnline]);

  // Monitor network connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isPolling) {
        // Refresh immediately when connection is restored
        onFetchOrders();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setError('Pas de connexion internet. Reconnexion en cours...');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isPolling, onFetchOrders]);

  // Track new orders for notification
  useEffect(() => {
    const newOrdersCount = orders?.filter((order) => 
      order.status === "pending" || order.status === "new"
    ).length || 0;
    
    if (newOrdersCount > previousOrdersCount.current && newOrdersCount > 0) {
      setNewOrderNotification(true);
      setTimeout(() => setNewOrderNotification(false), 5000);
    }
    previousOrdersCount.current = newOrdersCount;
  }, [orders]);

  // Trier les commandes (toutes les commandes, le filtrage des terminées sera fait dans OrdersByTable)
  const sortedOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    return [...orders].sort((a, b) => {
      // Priority order: pending/new > ready > processing > served > completed/cancelled
      const statusPriority = {
        'pending': 0,
        'new': 0,
        'ready': 1,
        'processing': 2,
        'in_progress': 2,
        'preparing': 2,
        'served': 3,
        'completed': 4,
        'cancelled': 4
      };
      
      const aPriority = statusPriority[a.status] ?? 99;
      const bPriority = statusPriority[b.status] ?? 99;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Same priority: sort by date descending
      const aDate = new Date(a.createdAt || a.created_at || 0);
      const bDate = new Date(b.createdAt || b.created_at || 0);
      return bDate - aDate;
    });
  }, [orders]);

  // Filtrer les commandes actives (non terminées) pour l'affichage
  const activeOrders = useMemo(() => {
    return sortedOrders.filter(order => 
      order.status !== 'completed' && order.status !== 'cancelled'
    );
  }, [sortedOrders]);

  // Memoized computed values
  const hasOrders = useMemo(() => activeOrders.length > 0, [activeOrders.length]);
  const newOrders = useMemo(() => 
    activeOrders.filter(order => order.status === 'pending' || order.status === 'new'),
    [activeOrders]
  );
  
  // Compter les commandes par statut pour l'affichage (uniquement les actives)
  const ordersStats = useMemo(() => {
    return {
      pending: activeOrders.filter(o => o.status === 'pending' || o.status === 'new').length,
      preparing: activeOrders.filter(o => o.status === 'processing' || o.status === 'in_progress' || o.status === 'preparing').length,
      ready: activeOrders.filter(o => o.status === 'ready').length,
      served: activeOrders.filter(o => o.status === 'served').length,
      total: activeOrders.length
    };
  }, [activeOrders]);

  return (
    <div className="font-display bg-background-light min-h-screen">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-border shadow-custom-light">
          <div className="p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <BackButton 
                onClick={onBack} 
                ariaLabel="Retour à la gestion de l'établissement" 
              />
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-text">
                  {t('orders.title') || 'Commandes'}
                </h1>
                {hasOrders && !isLoading && (
                  <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-zinc-600">
                    {ordersStats.pending > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                        {ordersStats.pending} en attente
                      </span>
                    )}
                    {ordersStats.preparing > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                        {ordersStats.preparing} en préparation
                      </span>
                    )}
                    {ordersStats.ready > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {ordersStats.ready} prête{ordersStats.ready > 1 ? 's' : ''} à servir
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button 
              className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-primary hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={onFetchOrders}
              aria-label="Rafraîchir les commandes"
              title="Rafraîchir"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-safe">
          {isLoading && !error && (
            <div className="text-center p-6 sm:p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-sm sm:text-base text-zinc-600">Chargement des commandes...</p>
            </div>
          )}
          {error && (
            <div className="text-center p-4 sm:p-6 bg-red-50 rounded-lg shadow-sm border border-red-200 mb-4">
              <div className="mb-3">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="mb-2 text-base sm:text-lg font-bold text-red-900">
                {!isOnline ? 'Connexion perdue' : 'Erreur de connexion'}
              </h4>
              <p className="text-xs sm:text-sm text-red-700 mb-4">{error}</p>
              {error.includes('500') && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 mb-2">
                    <strong>Conseil de dépannage :</strong>
                  </p>
                  <ul className="text-xs text-yellow-700 text-left space-y-1">
                    <li>• Vérifiez que le serveur backend est démarré</li>
                    <li>• Vérifiez que l'endpoint <code className="bg-yellow-100 px-1 rounded">/api/places/{params.id}/orders</code> existe</li>
                    <li>• Consultez les logs du serveur pour plus de détails</li>
                  </ul>
                </div>
              )}
              {isOnline && (
                <button
                  onClick={() => {
                    setIsPolling(true);
                    setIsLoading(true);
                    errorCountRef.current = 0;
                    setPollingDelay(3000); // Reset delay
                    setError(null);
                    onFetchOrders();
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold min-h-[44px] text-sm sm:text-base active:scale-[0.98]"
                >
                  {t('orders.retry') || 'Réessayer'}
                </button>
              )}
              {!isOnline && (
                <p className="text-xs text-red-600 mt-2">
                  La reconnexion se fera automatiquement...
                </p>
              )}
            </div>
          )}
          {/* Indicateur de connexion WebSocket */}
          {wsConnected && (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Connexion temps réel active</span>
            </div>
          )}
          {wsError && !wsConnected && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Mode polling (WebSocket indisponible)</span>
            </div>
          )}

          {!isLoading && !hasOrders && !error && (
            <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="mb-3 text-base sm:text-lg font-bold text-zinc-900">{t('orders.noOrders') || 'Aucune commande'}</h4>
              <p className="text-xs sm:text-sm text-zinc-600 mb-2">
                {t('orders.noOrdersDescription') || 'Les commandes apparaîtront ici dès qu\'un client aura validé son panier.'}
              </p>
              {isPolling && (
                <p className="text-xs text-zinc-500 mt-2">
                  {t('orders.autoRefresh') || 'La page se rafraîchit automatiquement toutes les 5 secondes.'}
                </p>
              )}
            </div>
          )}
          {!isLoading && hasOrders && !error && (
            <OrdersByTable
              orders={activeOrders}
              onAccept={onAcceptOrder}
              onDecline={onDeclineOrder}
              onReadyForPickup={onReadyForPickup}
              onServed={onServed}
              onComplete={onCompleteOrder}
            />
          )}
        </main>

        {/* Floating Notification */}
        {newOrderNotification && newOrders.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-primary text-white p-3 sm:p-4 rounded-lg shadow-xl flex items-center justify-between z-50 border border-primary/20 mb-safe">
            <p className="text-sm sm:text-base font-medium">{t('orders.newOrderNotification') || 'Nouvelle commande reçue !'}</p>
            <button 
              className="text-sm sm:text-base font-bold text-white hover:text-zinc-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center px-2"
              onClick={() => {
                setNewOrderNotification(false);
                // Scroll to top to see new orders
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {t('orders.view') || 'Voir'}
            </button>
        </div>
        )}
      </div>
    </div>
  );
}

export default Orders;