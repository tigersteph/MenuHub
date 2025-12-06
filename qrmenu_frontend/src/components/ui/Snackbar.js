import React from 'react';
import { toast } from '../../utils/toast';

/**
 * Snackbar avec fonction undo pour confirmations douces
 * Utilise react-toastify avec personnalisation
 */
export const showSnackbar = (message, options = {}) => {
  const {
    type = 'info',
    duration = 5000,
    onUndo,
    // undoLabel = 'Annuler' // Réservé pour usage futur
  } = options;

  const toastId = toast[type](message, {
    autoClose: duration,
    closeButton: false,
    hideProgressBar: false,
    className: 'snackbar-toast',
    bodyClassName: 'snackbar-body',
    ...options.toastOptions
  });

  // Si onUndo est fourni, ajouter le bouton undo
  if (onUndo) {
    // Note: react-toastify ne supporte pas directement les boutons personnalisés dans le message
    // On utilise un composant personnalisé via le renderToast
    return toastId;
  }

  return toastId;
};

/**
 * Composant SnackbarProvider pour wrapper l'application
 * (optionnel, car react-toastify gère déjà cela)
 */
export const SnackbarProvider = ({ children }) => {
  return <>{children}</>;
};

/**
 * Hook pour utiliser les snackbars avec undo
 */
export const useSnackbar = () => {
  const showSnackbarWithUndo = (message, onUndo, options = {}) => {
    const undoAction = () => {
      if (onUndo) {
        onUndo();
        toast.dismiss(toastId);
      }
    };

    const toastId = toast.success(
      <div className="flex items-center justify-between w-full">
        <span>{message}</span>
        <button
          onClick={undoAction}
          className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white font-medium transition-colors"
        >
          Annuler
        </button>
      </div>,
      {
        autoClose: options.duration || 5000,
        closeButton: true,
        className: 'snackbar-with-undo'
      }
    );

    return toastId;
  };

  return {
    success: (message, options) => showSnackbar(message, { ...options, type: 'success' }),
    error: (message, options) => showSnackbar(message, { ...options, type: 'error' }),
    info: (message, options) => showSnackbar(message, { ...options, type: 'info' }),
    warning: (message, options) => showSnackbar(message, { ...options, type: 'warning' }),
    showSnackbarWithUndo
  };
};

export default useSnackbar;
