import { useState, useEffect } from 'react';

/**
 * Hook pour valider un email en temps réel
 * @param {string} email - L'email à valider
 * @returns {Object} { isValid, message, isChecking }
 */
export const useEmailValidation = (email) => {
  const [validation, setValidation] = useState({
    isValid: null,
    message: '',
    isChecking: false
  });

  useEffect(() => {
    if (!email) {
      setValidation({
        isValid: null,
        message: '',
        isChecking: false
      });
      return;
    }

    // Validation basique du format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      setValidation({
        isValid: false,
        message: 'Format d\'email invalide',
        isChecking: false
      });
      return;
    }

    // Optionnel : vérifier la disponibilité (à implémenter si nécessaire)
    // Pour l'instant, on valide juste le format
    setValidation({
      isValid: true,
      message: 'Email valide',
      isChecking: false
    });
  }, [email]);

  return validation;
};

