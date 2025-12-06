import React from 'react';
import { useTranslation } from 'react-i18next';
import PlaceForm from '../../forms/PlaceForm';
import { X } from 'lucide-react';

/**
 * Modal réutilisable pour créer/modifier un établissement
 * Design moderne avec animations et respect de la charte graphique
 */
const PlaceFormModal = ({ isOpen, onClose, onDone, title }) => {
  const { t } = useTranslation();
  const displayTitle = title || t('places.addEstablishment');

  if (!isOpen) return null;

  const handleDone = (data) => {
    if (onDone) onDone(data);
    // Ne pas fermer automatiquement pour laisser l'utilisateur voir le message de succès
    // onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-2 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-modal-slide-in border border-gray-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 border-b border-gray-border flex-shrink-0">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-dark-text leading-tight">{displayTitle}</h3>
              <p className="text-xs sm:text-sm text-muted-text mt-1 sm:mt-1.5">{t('places.form.subtitle')}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-text hover:text-dark-text transition-colors p-2 rounded-lg hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content avec scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 lg:p-8">
          <PlaceForm onDone={handleDone} />
        </div>
      </div>
    </div>
  );
};

export default PlaceFormModal;


