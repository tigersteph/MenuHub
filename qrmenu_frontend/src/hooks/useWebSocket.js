import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../config';

/**
 * Hook pour gérer la connexion WebSocket et recevoir les notifications temps réel
 * Remplace le polling HTTP pour une meilleure expérience utilisateur
 */
const useWebSocket = (placeId, options = {}) => {
  const { enabled = true, onNewOrder, onOrderStatusChanged } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);
  // Stocker les callbacks dans des refs pour éviter les reconnexions
  const callbacksRef = useRef({ onNewOrder, onOrderStatusChanged });

  // Mettre à jour les callbacks sans déclencher de reconnexion
  useEffect(() => {
    callbacksRef.current = { onNewOrder, onOrderStatusChanged };
  }, [onNewOrder, onOrderStatusChanged]);

  useEffect(() => {
    if (!enabled || !placeId) {
      return;
    }

    // Créer la connexion WebSocket
    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Gestion des événements de connexion
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      
      // Rejoindre la room pour cet établissement
      socket.emit('join-place', placeId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socket.on('joined', (data) => {
      console.log('Joined place room:', data.placeId);
    });

    // Écouter les nouvelles commandes (utiliser les callbacks depuis la ref)
    socket.on('new-order', (data) => {
      if (callbacksRef.current.onNewOrder && data.order) {
        callbacksRef.current.onNewOrder(data.order);
      }
    });

    // Écouter les changements de statut (utiliser les callbacks depuis la ref)
    socket.on('order-status-changed', (data) => {
      if (callbacksRef.current.onOrderStatusChanged) {
        callbacksRef.current.onOrderStatusChanged(data);
      }
    });

    // Nettoyage à la déconnexion
    return () => {
      if (socket.connected) {
        socket.emit('leave-place', placeId);
      }
      socket.disconnect();
    };
  }, [placeId, enabled]); // Retirer onNewOrder et onOrderStatusChanged des dépendances

  return {
    isConnected,
    connectionError,
    socket: socketRef.current
  };
};

export default useWebSocket;

