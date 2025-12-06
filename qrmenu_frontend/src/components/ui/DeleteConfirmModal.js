import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import Button from './Button';

/**
 * Modal de confirmation de suppression générique et réutilisable
 * Conforme aux normes professionnelles et académiques
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - État d'ouverture de la modal
 * @param {Function} props.onClose - Fonction de fermeture
 * @param {Function} props.onConfirm - Fonction de confirmation
 * @param {string} props.title - Titre de la modal
 * @param {string} props.itemName - Nom de l'élément à supprimer
 * @param {string} props.itemType - Type d'élément ('restaurant', 'table', 'plat', 'catégorie')
 * @param {string} props.warningMessage - Message d'avertissement personnalisé
 * @param {number} props.relatedItemsCount - Nombre d'éléments associés qui seront supprimés
 * @param {string} props.relatedItemsLabel - Label pour les éléments associés
 * @param {boolean} props.requiresConfirmation - Si true, nécessite la saisie du nom pour confirmer
 * @param {string} props.confirmationPlaceholder - Placeholder pour le champ de confirmation
 * @param {boolean} props.isLoading - État de chargement
 * @param {string} props.confirmButtonText - Texte du bouton de confirmation
 * @param {string} props.cancelButtonText - Texte du bouton d'annulation
 */
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = 'élément',
  warningMessage,
  relatedItemsCount = 0,
  relatedItemsLabel = '',
  requiresConfirmation = false,
  confirmationPlaceholder,
  isLoading = false,
  confirmButtonText = 'Supprimer',
  cancelButtonText = 'Annuler'
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [ackIrreversible, setAckIrreversible] = useState(false);

  // Réinitialiser le formulaire quand la modal se ferme
  React.useEffect(() => {
    if (!isOpen) {
      setConfirmationText('');
      setAckIrreversible(false);
    }
  }, [isOpen]);

  // Gérer le body overflow pour éviter le scroll quand le modal est ouvert
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        // Restaurer l'overflow original seulement si le modal est fermé
        if (!isOpen) {
          document.body.style.overflow = originalOverflow || 'unset';
        }
      };
    }
  }, [isOpen]);

  // Messages par défaut selon le type
  const getDefaultWarning = () => {
    switch (itemType) {
      case 'restaurant':
        return 'Cette action est irréversible. Toutes les données associées (tables, menus, catégories, plats, commandes) seront également supprimées définitivement.';
      case 'table':
        return 'Cette action est irréversible. La table et son QR code seront supprimés définitivement.';
      case 'plat':
        return 'Cette action est irréversible. Le plat sera retiré de toutes les commandes en cours.';
      case 'catégorie':
        return 'Cette action est irréversible. La catégorie et tous les plats qu\'elle contient seront supprimés définitivement.';
      default:
        return 'Cette action est irréversible et ne peut pas être annulée.';
    }
  };

  const defaultTitle = title || `Supprimer ${itemType === 'restaurant' ? 'l\'établissement' : `la ${itemType}`} ?`;
  const warning = warningMessage || getDefaultWarning();
  const canConfirm = requiresConfirmation 
    ? (confirmationText.trim() === itemName && ackIrreversible)
    : (!requiresConfirmation || ackIrreversible);

  const handleConfirm = () => {
    if (canConfirm && !isLoading) {
      onConfirm();
    }
  };

  const [mounted, setMounted] = useState(false);
  const portalContainerRef = React.useRef(null);

  // Créer et gérer le conteneur du portail
  React.useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      // Créer un conteneur dédié pour ce modal
      const container = document.createElement('div');
      container.setAttribute('data-modal-portal', 'true');
      document.body.appendChild(container);
      portalContainerRef.current = container;
      setMounted(true);

      return () => {
        // Nettoyage sécurisé du conteneur
        if (portalContainerRef.current && portalContainerRef.current.parentNode) {
          try {
            portalContainerRef.current.parentNode.removeChild(portalContainerRef.current);
          } catch (error) {
            // Ignorer les erreurs si le nœud a déjà été supprimé
            console.warn('DeleteConfirmModal cleanup warning:', error);
          }
        }
        portalContainerRef.current = null;
        setMounted(false);
      };
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  // Ne pas retourner null, mais plutôt ne rien rendre si fermé ou non monté
  if (!isOpen || !mounted || !portalContainerRef.current) {
    return null;
  }

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-modal-slide-in border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 
              id="delete-modal-title"
              className="text-xl font-bold text-dark-text"
            >
              {defaultTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-text hover:text-dark-text transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-base text-dark-text mb-2">
              Êtes-vous sûr de vouloir supprimer{' '}
              <strong className="text-red-600 font-semibold">"{itemName}"</strong> ?
            </p>
            <p className="text-sm text-muted-text">
              {warning}
            </p>
          </div>

          {/* Avertissement pour les éléments associés */}
          {relatedItemsCount > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Attention :</strong> Cette {itemType} contient{' '}
                <strong>{relatedItemsCount}</strong> {relatedItemsLabel || 'élément(s) associé(s)'}.
                {itemType === 'catégorie' && ' Ils seront également supprimés.'}
              </p>
            </div>
          )}

          {/* Champ de confirmation pour les suppressions critiques */}
          {requiresConfirmation && (
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Pour confirmer, veuillez saisir le nom : <strong className="text-red-600">{itemName}</strong>
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={confirmationPlaceholder || `Saisir "${itemName}"`}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Confirmation du nom"
                />
              </div>
              <label className="flex items-start gap-2 text-sm text-dark-text cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={ackIrreversible} 
                  onChange={(e) => setAckIrreversible(e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                />
                <span>Je comprends que cette action est irréversible et ne peut pas être annulée.</span>
              </label>
            </div>
          )}

          {/* Checkbox simple pour les suppressions moins critiques */}
          {!requiresConfirmation && (
            <label className="flex items-start gap-2 text-sm text-dark-text cursor-pointer mb-4">
              <input 
                type="checkbox" 
                checked={ackIrreversible} 
                onChange={(e) => setAckIrreversible(e.target.checked)}
                disabled={isLoading}
                className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
              />
              <span>Je comprends que cette action est irréversible.</span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="light"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {cancelButtonText}
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            loading={isLoading}
            icon={<Trash2 className="w-4 h-4" />}
            className="min-w-[120px]"
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );

  // Rendre le modal dans un portail pour éviter les problèmes de DOM
  // Vérifier que le conteneur existe avant de créer le portal
  if (!portalContainerRef.current) return null;
  return ReactDOM.createPortal(modalContent, portalContainerRef.current);
};

export default DeleteConfirmModal;
