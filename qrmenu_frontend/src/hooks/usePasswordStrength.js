import { useState, useEffect } from 'react';

/**
 * Hook pour calculer la force d'un mot de passe
 * @param {string} password - Le mot de passe à évaluer
 * @returns {Object} { level, label, color, percentage, checks }
 */
export const usePasswordStrength = (password) => {
  const [strength, setStrength] = useState({
    level: 0,
    label: '',
    color: 'bg-gray-200',
    percentage: 0,
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    }
  });

  useEffect(() => {
    if (!password) {
      setStrength({
        level: 0,
        label: '',
        color: 'bg-gray-200',
        percentage: 0,
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        }
      });
      return;
    }

    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    let level = 0;
    let label = '';
    let color = 'bg-gray-200';
    let percentage = 0;

    if (score <= 1) {
      level = 1;
      label = 'Très faible';
      color = 'bg-red-500';
      percentage = 25;
    } else if (score === 2) {
      level = 2;
      label = 'Faible';
      color = 'bg-orange-500';
      percentage = 50;
    } else if (score === 3 || score === 4) {
      level = 3;
      label = 'Moyen';
      color = 'bg-yellow-500';
      percentage = 75;
    } else if (score === 5) {
      level = 4;
      label = 'Fort';
      color = 'bg-green-500';
      percentage = 100;
    }

    setStrength({
      level,
      label,
      color,
      percentage,
      checks
    });
  }, [password]);

  return strength;
};

