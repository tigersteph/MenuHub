import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * Hook personnalisé pour gérer l'authentification
 * @returns {Object} Objet contenant les méthodes et états d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
