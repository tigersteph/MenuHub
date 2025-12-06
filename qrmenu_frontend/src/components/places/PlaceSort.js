import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar } from 'lucide-react';

const SORT_OPTIONS = {
  DEFAULT: 'default',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc'
};

/**
 * Composant de tri pour les établissements
 */
const PlaceSort = ({ onSortChange, currentSort = SORT_OPTIONS.DEFAULT, className = "" }) => {
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

  const handleSelect = (sortOption) => {
    onSortChange(sortOption);
    setIsOpen(false);
    localStorage.setItem('placesSort', sortOption);
  };

  const getSortLabel = (sort) => {
    switch (sort) {
      case SORT_OPTIONS.NAME_ASC:
        return 'Nom (A-Z)';
      case SORT_OPTIONS.NAME_DESC:
        return 'Nom (Z-A)';
      case SORT_OPTIONS.DATE_ASC:
        return 'Date (ancien)';
      case SORT_OPTIONS.DATE_DESC:
        return 'Date (récent)';
      default:
        return 'Par défaut';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-border bg-card-surface hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        aria-label="Trier les établissements"
        aria-expanded={isOpen}
      >
        <ArrowUpDown className="w-4 h-4 text-muted-text" />
        <span className="text-sm font-medium text-dark-text">{getSortLabel(currentSort)}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg border border-gray-border shadow-lg z-50 py-1">
          <button
            type="button"
            onClick={() => handleSelect(SORT_OPTIONS.DEFAULT)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
              currentSort === SORT_OPTIONS.DEFAULT
                ? 'bg-primary/10 text-primary'
                : 'text-dark-text hover:bg-gray-100'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Par défaut</span>
          </button>
          <div className="border-t border-gray-border my-1" />
          <button
            type="button"
            onClick={() => handleSelect(SORT_OPTIONS.NAME_ASC)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
              currentSort === SORT_OPTIONS.NAME_ASC
                ? 'bg-primary/10 text-primary'
                : 'text-dark-text hover:bg-gray-100'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
            <span>Nom (A-Z)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelect(SORT_OPTIONS.NAME_DESC)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
              currentSort === SORT_OPTIONS.NAME_DESC
                ? 'bg-primary/10 text-primary'
                : 'text-dark-text hover:bg-gray-100'
            }`}
          >
            <ArrowDown className="w-4 h-4" />
            <span>Nom (Z-A)</span>
          </button>
          <div className="border-t border-gray-border my-1" />
          <button
            type="button"
            onClick={() => handleSelect(SORT_OPTIONS.DATE_DESC)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
              currentSort === SORT_OPTIONS.DATE_DESC
                ? 'bg-primary/10 text-primary'
                : 'text-dark-text hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Date (récent)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelect(SORT_OPTIONS.DATE_ASC)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
              currentSort === SORT_OPTIONS.DATE_ASC
                ? 'bg-primary/10 text-primary'
                : 'text-dark-text hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Date (ancien)</span>
          </button>
        </div>
      )}
    </div>
  );
};

PlaceSort.SORT_OPTIONS = SORT_OPTIONS;

export default PlaceSort;


