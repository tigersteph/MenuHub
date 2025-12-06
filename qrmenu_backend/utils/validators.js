/**
 * Validateurs réutilisables pour la validation des données
 * Conforme aux bonnes pratiques de validation (OWASP, etc.)
 */

class Validators {
  /**
   * Valide un UUID v4
   */
  static isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Valide une chaîne de caractères (non vide, longueur min/max)
   */
  static validateString(value, minLength = 1, maxLength = 255, fieldName = 'Champ') {
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} doit être une chaîne de caractères`);
    }
    const trimmed = value.trim();
    if (trimmed.length < minLength) {
      throw new Error(`${fieldName} doit contenir au moins ${minLength} caractère(s)`);
    }
    if (trimmed.length > maxLength) {
      throw new Error(`${fieldName} ne peut pas dépasser ${maxLength} caractères`);
    }
    return trimmed;
  }

  /**
   * Valide un prix (décimal positif)
   */
  static validatePrice(price, fieldName = 'Prix') {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) {
      throw new Error(`${fieldName} doit être un nombre`);
    }
    if (numPrice < 0) {
      throw new Error(`${fieldName} ne peut pas être négatif`);
    }
    if (numPrice > 999999.99) {
      throw new Error(`${fieldName} est trop élevé`);
    }
    return Math.round(numPrice * 100) / 100; // Arrondir à 2 décimales
  }

  /**
   * Valide un nombre entier positif
   */
  static validatePositiveInteger(value, fieldName = 'Champ', min = 0, max = Infinity) {
    const num = parseInt(value, 10);
    if (isNaN(num) || !Number.isInteger(num)) {
      throw new Error(`${fieldName} doit être un nombre entier`);
    }
    if (num < min) {
      throw new Error(`${fieldName} doit être supérieur ou égal à ${min}`);
    }
    if (num > max) {
      throw new Error(`${fieldName} doit être inférieur ou égal à ${max}`);
    }
    return num;
  }

  /**
   * Valide un email
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email invalide');
    }
    return email.toLowerCase().trim();
  }

  /**
   * Valide un statut parmi une liste d'options
   */
  static validateStatus(status, allowedStatuses, fieldName = 'Statut') {
    if (!allowedStatuses.includes(status)) {
      throw new Error(`${fieldName} doit être l'un des suivants: ${allowedStatuses.join(', ')}`);
    }
    return status;
  }

  /**
   * Valide un URL (optionnel)
   */
  static validateUrl(url, required = false) {
    if (!url && !required) {
      return null;
    }
    if (!url && required) {
      throw new Error('URL requise');
    }
    try {
      new URL(url);
      return url;
    } catch (error) {
      throw new Error('URL invalide');
    }
  }

  /**
   * Valide les données d'un établissement
   */
  static validatePlace(data) {
    const errors = [];
    const validated = {};

    try {
      validated.name = this.validateString(data.name, 2, 100, 'Nom de l\'établissement');
    } catch (error) {
      errors.push(error.message);
    }

    if (data.description !== undefined) {
      try {
        validated.description = this.validateString(data.description, 0, 1000, 'Description');
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (data.address !== undefined) {
      try {
        validated.address = this.validateString(data.address, 0, 500, 'Adresse');
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (data.phone !== undefined) {
      try {
        validated.phone = this.validateString(data.phone, 0, 20, 'Téléphone');
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (data.logo_url !== undefined) {
      try {
        validated.logo_url = this.validateUrl(data.logo_url, false);
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (data.number_of_tables !== undefined) {
      try {
        validated.number_of_tables = this.validatePositiveInteger(data.number_of_tables, 'Nombre de tables', 0, 1000);
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    return validated;
  }

  /**
   * Valide les données d'une catégorie
   */
  static validateCategory(data) {
    const errors = [];
    const validated = {};

    try {
      validated.name = this.validateString(data.name, 2, 100, 'Nom de la catégorie');
    } catch (error) {
      errors.push(error.message);
    }

    if (data.place_id || data.placeId) {
      const placeId = data.place_id || data.placeId;
      if (!this.isValidUUID(placeId)) {
        errors.push('ID de l\'établissement invalide');
      } else {
        validated.place_id = placeId;
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    return validated;
  }

  /**
   * Valide les données d'un élément de menu
   */
  static validateMenuItem(data) {
    const errors = [];
    const validated = {};

    try {
      validated.name = this.validateString(data.name, 2, 100, 'Nom du plat');
    } catch (error) {
      errors.push(error.message);
    }

    if (data.description !== undefined) {
      try {
        validated.description = this.validateString(data.description, 0, 1000, 'Description');
      } catch (error) {
        errors.push(error.message);
      }
    }

    try {
      validated.price = this.validatePrice(data.price, 'Prix');
    } catch (error) {
      errors.push(error.message);
    }

    if (data.categoryId || data.category_id) {
      const categoryId = data.categoryId || data.category_id;
      if (!this.isValidUUID(categoryId)) {
        errors.push('ID de la catégorie invalide');
      } else {
        validated.categoryId = categoryId;
      }
    }

    if (data.placeId || data.place_id) {
      const placeId = data.placeId || data.place_id;
      if (!this.isValidUUID(placeId)) {
        errors.push('ID de l\'établissement invalide');
      } else {
        validated.placeId = placeId;
      }
    }

    if (data.imageUrl !== undefined || data.image_url !== undefined) {
      try {
        validated.imageUrl = this.validateUrl(data.imageUrl || data.image_url, false);
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (data.isAvailable !== undefined || data.is_available !== undefined) {
      validated.isAvailable = Boolean(data.isAvailable !== undefined ? data.isAvailable : data.is_available);
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    return validated;
  }

  /**
   * Valide les données d'une table
   */
  static validateTable(data) {
    const errors = [];
    const validated = {};

    try {
      validated.name = this.validateString(data.name, 1, 50, 'Nom de la table');
    } catch (error) {
      errors.push(error.message);
    }

    if (data.status !== undefined) {
      try {
        validated.status = this.validateStatus(data.status, ['active', 'inactive', 'reserved'], 'Statut');
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (data.place_id || data.placeId) {
      const placeId = data.place_id || data.placeId;
      if (!this.isValidUUID(placeId)) {
        errors.push('ID de l\'établissement invalide');
      } else {
        validated.place_id = placeId;
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    return validated;
  }
}

module.exports = Validators;

