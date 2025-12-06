// Validateurs pour les formulaires

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} True si valide
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean} True si valide
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Valide un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} Résultat de la validation
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!password) {
    result.isValid = false;
    result.errors.push('Le mot de passe est requis');
    return result;
  }

  if (password.length < 8) {
    result.isValid = false;
    result.errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  if (!/\d/.test(password)) {
    result.isValid = false;
    result.errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  return result;
};

/**
 * Valide un nom de restaurant
 * @param {string} name - Nom à valider
 * @returns {Object} Résultat de la validation
 */
export const validateRestaurantName = (name) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!name || name.trim().length === 0) {
    result.isValid = false;
    result.errors.push('Le nom du restaurant est requis');
  } else if (name.trim().length < 2) {
    result.isValid = false;
    result.errors.push('Le nom du restaurant doit contenir au moins 2 caractères');
  } else if (name.trim().length > 100) {
    result.isValid = false;
    result.errors.push('Le nom du restaurant ne peut pas dépasser 100 caractères');
  }

  return result;
};

/**
 * Valide un prix
 * @param {number|string} price - Prix à valider
 * @returns {Object} Résultat de la validation
 */
export const validatePrice = (price) => {
  const result = {
    isValid: true,
    errors: []
  };

  const numPrice = parseFloat(price);

  if (isNaN(numPrice)) {
    result.isValid = false;
    result.errors.push('Le prix doit être un nombre valide');
  } else if (numPrice < 0) {
    result.isValid = false;
    result.errors.push('Le prix ne peut pas être négatif');
  } else if (numPrice > 1000) {
    result.isValid = false;
    result.errors.push('Le prix ne peut pas dépasser 1000€');
  }

  return result;
};

/**
 * Valide une description
 * @param {string} description - Description à valider
 * @param {number} maxLength - Longueur maximale
 * @returns {Object} Résultat de la validation
 */
export const validateDescription = (description, maxLength = 500) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (description && description.length > maxLength) {
    result.isValid = false;
    result.errors.push(`La description ne peut pas dépasser ${maxLength} caractères`);
  }

  return result;
};

/**
 * Valide une URL
 * @param {string} url - URL à valider
 * @returns {boolean} True si valide
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valide un fichier image
 * @param {File} file - Fichier à valider
 * @param {number} maxSize - Taille maximale en bytes
 * @returns {Object} Résultat de la validation
 */
export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!file) {
    result.isValid = false;
    result.errors.push('Aucun fichier sélectionné');
    return result;
  }

  // Vérifier le type de fichier
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    result.isValid = false;
    result.errors.push('Le fichier doit être une image (JPEG, PNG ou WebP)');
  }

  // Vérifier la taille
  if (file.size > maxSize) {
    result.isValid = false;
    result.errors.push(`Le fichier ne peut pas dépasser ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  return result;
};

/**
 * Valide un formulaire complet
 * @param {Object} data - Données du formulaire
 * @param {Object} rules - Règles de validation
 * @returns {Object} Résultat de la validation
 */
export const validateForm = (data, rules) => {
  const result = {
    isValid: true,
    errors: {}
  };

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    const fieldErrors = [];

    for (const rule of fieldRules) {
      const validation = rule.validator(value, data);
      if (!validation.isValid) {
        fieldErrors.push(...validation.errors);
      }
    }

    if (fieldErrors.length > 0) {
      result.isValid = false;
      result.errors[field] = fieldErrors;
    }
  }

  return result;
};
