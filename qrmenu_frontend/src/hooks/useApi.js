import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook personnalisé pour gérer les appels API
 * @returns {Object} Objet contenant les méthodes pour les appels API
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const makeRequest = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args, token);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    makeRequest,
    clearError
  };
};

export default useApi;
