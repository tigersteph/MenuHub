import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../config';

/**
 * Hook côté CLIENT (téléphone) pour suivre en temps réel
 * les changements de statut d'une commande spécifique.
 *
 * Connecte un socket à la room `order:${orderId}` côté backend, qui ne reçoit
 * que les événements liés à cette commande (sécurité : pas de fuite des autres
 * commandes du même restaurant).
 *
 * Le backend émet sur cette room dans `notifyOrderStatusChange()`
 * (qrmenu_backend/services/websocket.js).
 */
const useOrderStatus = (orderId, options = {}) => {
  const { enabled = true, onStatusChange } = options;
  const [status, setStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);
  const callbackRef = useRef(onStatusChange);

  useEffect(() => {
    callbackRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    if (!enabled || !orderId) return undefined;

    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      socket.emit('join-order', orderId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setConnectionError(err.message);
      setIsConnected(false);
    });

    socket.on('order-status-changed', (data) => {
      if (data && data.orderId === orderId) {
        setStatus(data.newStatus);
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      }
    });

    return () => {
      if (socket.connected) {
        socket.emit('leave-order', orderId);
      }
      socket.disconnect();
    };
  }, [orderId, enabled]);

  return { status, isConnected, connectionError };
};

export default useOrderStatus;
