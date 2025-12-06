import React, { useState, useRef, useEffect, useContext } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthContext from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

/**
 * Menu utilisateur dropdown dans le header
 */
const UserMenu = ({ className = "" }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const auth = useContext(AuthContext);
  const history = useHistory();

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
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

  const handleLogout = () => {
    auth.signOut();
    history.push('/');
  };

  // Récupérer les informations utilisateur
  const userEmail = auth.user?.email || '';
  const firstName = auth.user?.firstName || '';
  const lastName = auth.user?.lastName || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || userEmail;
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || userEmail.split('@')[0];

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border border-transparent hover:border-gray-200"
        aria-label={t('profile.menu')}
        aria-expanded={isOpen}
      >
        <Avatar 
          name={fullName}
          email={userEmail}
          size={36}
        />
        <div className="hidden sm:flex flex-col items-start">
          {displayName && displayName !== userEmail ? (
            <>
              <span className="text-sm font-semibold text-dark-text leading-tight">{displayName}</span>
              <span className="text-xs text-muted-text leading-tight">{userEmail.split('@')[0]}</span>
            </>
          ) : (
            <span className="text-sm font-medium text-dark-text">{userEmail.split('@')[0]}</span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-muted-text transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-72 sm:w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
        >
          {/* Informations utilisateur */}
          <div className="px-4 py-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar 
                name={fullName}
                email={userEmail}
                size={48}
              />
              <div className="flex-1 min-w-0">
                {displayName && displayName !== userEmail && (
                  <p className="text-sm font-semibold text-dark-text truncate">{displayName}</p>
                )}
                <p className={`text-xs ${displayName && displayName !== userEmail ? 'text-muted-text mt-0.5' : 'text-dark-text font-semibold'} truncate`}>{userEmail}</p>
              </div>
            </div>
          </div>
          
          {/* Bouton de déconnexion */}
          <div className="py-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors text-left rounded-lg mx-1.5"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>{t('profile.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;


