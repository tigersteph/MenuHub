import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Sélecteur d'établissement dans le header
 */
const PlaceSelector = ({ 
  places, 
  selectedPlaceId, 
  onSelect, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedPlace = places.find(p => p.id === selectedPlaceId) || places[0];

  const handleSelect = (placeId) => {
    onSelect(placeId);
    setIsOpen(false);
    // Sauvegarder dans localStorage
    localStorage.setItem('selectedPlaceId', placeId.toString());
  };

  if (places.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-border bg-card-surface hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Sélectionner un établissement"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-dark-text truncate max-w-[200px]">
          {selectedPlace?.name || 'Sélectionner...'}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-muted-text transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg border border-gray-border shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {places.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelect(place.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${
                  selectedPlaceId === place.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-gray-100 text-dark-text'
                }`}
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{place.name}</span>
                  {place.address && (
                    <span className="text-xs text-muted-text truncate">{place.address}</span>
                  )}
                </div>
                {selectedPlaceId === place.id && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceSelector;


