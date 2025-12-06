import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Copy, Trash2, BarChart3 } from 'lucide-react';

/**
 * Menu contextuel (3 points) pour actions rapides sur une carte
 */
const PlaceContextMenu = ({ 
  place, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onViewStats,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Fermer avec Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-muted-text hover:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Menu d'actions"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-border shadow-lg z-50 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <button
              type="button"
              onClick={() => handleAction(onEdit)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-dark-text hover:bg-gray-100 transition-colors text-left"
            >
              <Edit className="w-4 h-4" />
              <span>Modifier</span>
            </button>
          )}
          {onDuplicate && (
            <button
              type="button"
              onClick={() => handleAction(onDuplicate)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-dark-text hover:bg-gray-100 transition-colors text-left"
            >
              <Copy className="w-4 h-4" />
              <span>Dupliquer</span>
            </button>
          )}
          {onViewStats && (
            <button
              type="button"
              onClick={() => handleAction(onViewStats)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-dark-text hover:bg-gray-100 transition-colors text-left"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Voir statistiques</span>
            </button>
          )}
          {onDelete && (
            <>
              <div className="border-t border-gray-border my-1" />
              <button
                type="button"
                onClick={() => handleAction(onDelete)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaceContextMenu;


