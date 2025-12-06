import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Modal de confirmation pour la suppression d'établissement
 */
const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  placeName,
  isLoading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4 animate-modal-slide-in border border-gray-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-dark-text">Confirmer la suppression</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-text hover:text-dark-text transition-colors p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-base text-muted-text mb-2">
            Êtes-vous sûr de vouloir supprimer l'établissement <strong className="text-dark-text">{placeName}</strong> ?
          </p>
          <p className="text-sm text-red-600">
            Cette action est irréversible. Toutes les données associées (tables, menus, commandes) seront également supprimées.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-muted-text bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;


