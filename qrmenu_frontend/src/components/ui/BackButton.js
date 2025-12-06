import React from 'react';
import { ChevronLeft } from 'lucide-react';

/**
 * Bouton de retour professionnel selon la charte graphique
 * Utilisé pour naviguer vers la page précédente
 */
const BackButton = ({ onClick, ariaLabel = 'Retour à la page précédente', className = '' }) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center
        w-10 h-10 sm:w-12 sm:h-12
        rounded-lg
        bg-white border border-gray-border
        text-gray-700
        hover:bg-primary/10 hover:border-primary hover:text-primary
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        transition-all duration-200
        shadow-custom-light hover:shadow-md
        ${className}
      `}
      type="button"
    >
      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
    </button>
  );
};

export default BackButton;
