import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

/**
 * Modal réutilisable avec design uniforme
 * @param {boolean} show - Afficher ou masquer le modal
 * @param {function} onHide - Fonction appelée pour fermer le modal
 * @param {React.ReactNode} children - Contenu du modal
 * @param {string} title - Titre du modal (optionnel)
 * @param {string} size - Taille du modal (sm, md, lg, xl, full)
 * @param {boolean} closeButton - Afficher le bouton de fermeture
 */
const Modal = ({ 
  show, 
  onHide, 
  children, 
  title, 
  size = 'md',
  closeButton = true,
  className = '',
  ariaLabel = 'Modal'
}) => {
  const [mounted, setMounted] = useState(false);
  const portalContainerRef = useRef(null);

  // Créer et gérer le conteneur du portail
  useEffect(() => {
    if (show && typeof document !== 'undefined') {
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
            console.warn('Modal cleanup warning:', error);
          }
        }
        portalContainerRef.current = null;
        setMounted(false);
      };
    } else {
      setMounted(false);
    }
  }, [show]);

  // Fermeture avec Escape
  useEffect(() => {
    if (!show) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && show && onHide) {
        onHide();
      }
    };

      document.addEventListener('keydown', handleEscape);
    const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, [show, onHide]);

  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  if (!show || !mounted || !portalContainerRef.current) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onHide();
        }
      }}
    >
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col animate-modal-slide-in border border-gray-100 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || closeButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            {title && (
              <h2 className="text-xl font-bold text-text-dark">{title}</h2>
            )}
            {closeButton && (
              <button
                className="absolute -top-4 -right-4 bg-white border border-gray-200 rounded-full shadow-md w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all text-2xl hover:scale-110"
                onClick={onHide}
                aria-label="Fermer le modal"
                tabIndex={0}
              >
                &times;
              </button>
            )}
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-slide-in {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-modal-slide-in {
          animation: modal-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );

  // Rendre le modal dans un portail sécurisé - vérifier que le conteneur existe
  if (!portalContainerRef.current) return null;
  return ReactDOM.createPortal(modalContent, portalContainerRef.current);
};

export default Modal;
