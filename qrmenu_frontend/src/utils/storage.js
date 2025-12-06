// Utilitaires de stockage (localStorage, sessionStorage)

/**
 * Clés de stockage utilisées dans l'application
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  PLACES: 'places',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings'
};

/**
 * Classe pour gérer le localStorage de manière sécurisée
 */
class StorageManager {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  /**
   * Récupère une valeur du stockage
   * @param {string} key - Clé
   * @param {any} defaultValue - Valeur par défaut
   * @returns {any} Valeur stockée ou valeur par défaut
   */
  get(key, defaultValue = null) {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from storage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Stocke une valeur
   * @param {string} key - Clé
   * @param {any} value - Valeur à stocker
   * @returns {boolean} Succès de l'opération
   */
  set(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to storage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Supprime une valeur
   * @param {string} key - Clé
   * @returns {boolean} Succès de l'opération
   */
  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Vide tout le stockage
   * @returns {boolean} Succès de l'opération
   */
  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Vérifie si une clé existe
   * @param {string} key - Clé
   * @returns {boolean} True si la clé existe
   */
  has(key) {
    return this.storage.getItem(key) !== null;
  }

  /**
   * Récupère toutes les clés
   * @returns {Array<string>} Liste des clés
   */
  keys() {
    return Object.keys(this.storage);
  }

  /**
   * Récupère la taille du stockage utilisé
   * @returns {number} Taille en bytes
   */
  size() {
    let total = 0;
    for (let key in this.storage) {
      if (this.storage.hasOwnProperty(key)) {
        total += this.storage[key].length + key.length;
      }
    }
    return total;
  }
}

// Instances pour localStorage et sessionStorage
export const localStorage = new StorageManager(window.localStorage);
export const sessionStorage = new StorageManager(window.sessionStorage);

/**
 * Gestionnaire spécialisé pour les données utilisateur
 */
export const userStorage = {
  /**
   * Sauvegarde les données utilisateur
   * @param {Object} userData - Données utilisateur
   */
  saveUser(userData) {
    localStorage.set(STORAGE_KEYS.USER, userData);
  },

  /**
   * Récupère les données utilisateur
   * @returns {Object|null} Données utilisateur
   */
  getUser() {
    return localStorage.get(STORAGE_KEYS.USER);
  },

  /**
   * Supprime les données utilisateur
   */
  removeUser() {
    localStorage.remove(STORAGE_KEYS.USER);
  },

  /**
   * Sauvegarde le token d'authentification
   * @param {string} token - Token
   */
  saveToken(token) {
    localStorage.set(STORAGE_KEYS.TOKEN, token);
  },

  /**
   * Récupère le token d'authentification
   * @returns {string|null} Token
   */
  getToken() {
    return localStorage.get(STORAGE_KEYS.TOKEN);
  },

  /**
   * Supprime le token d'authentification
   */
  removeToken() {
    localStorage.remove(STORAGE_KEYS.TOKEN);
  },

  /**
   * Déconnecte l'utilisateur (supprime toutes les données)
   */
  logout() {
    this.removeUser();
    this.removeToken();
  }
};

/**
 * Gestionnaire spécialisé pour le panier
 */
export const cartStorage = {
  /**
   * Sauvegarde le panier
   * @param {Array} cartItems - Articles du panier
   */
  saveCart(cartItems) {
    sessionStorage.set(STORAGE_KEYS.CART, cartItems);
  },

  /**
   * Récupère le panier
   * @returns {Array} Articles du panier
   */
  getCart() {
    return sessionStorage.get(STORAGE_KEYS.CART, []);
  },

  /**
   * Vide le panier
   */
  clearCart() {
    sessionStorage.remove(STORAGE_KEYS.CART);
  },

  /**
   * Ajoute un article au panier
   * @param {Object} item - Article à ajouter
   */
  addToCart(item) {
    const cart = this.getCart();
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
    } else {
      cart.push({ ...item, quantity: item.quantity || 1 });
    }
    
    this.saveCart(cart);
  },

  /**
   * Supprime un article du panier
   * @param {string} itemId - ID de l'article
   */
  removeFromCart(itemId) {
    const cart = this.getCart();
    const updatedCart = cart.filter(item => item.id !== itemId);
    this.saveCart(updatedCart);
  },

  /**
   * Met à jour la quantité d'un article
   * @param {string} itemId - ID de l'article
   * @param {number} quantity - Nouvelle quantité
   */
  updateQuantity(itemId, quantity) {
    const cart = this.getCart();
    const item = cart.find(cartItem => cartItem.id === itemId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        item.quantity = quantity;
        this.saveCart(cart);
      }
    }
  }
};

/**
 * Gestionnaire spécialisé pour les paramètres
 */
export const settingsStorage = {
  /**
   * Sauvegarde les paramètres
   * @param {Object} settings - Paramètres
   */
  saveSettings(settings) {
    localStorage.set(STORAGE_KEYS.SETTINGS, settings);
  },

  /**
   * Récupère les paramètres
   * @returns {Object} Paramètres
   */
  getSettings() {
    return localStorage.get(STORAGE_KEYS.SETTINGS, {});
  },

  /**
   * Met à jour un paramètre
   * @param {string} key - Clé du paramètre
   * @param {any} value - Valeur
   */
  updateSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.saveSettings(settings);
  },

  /**
   * Récupère un paramètre
   * @param {string} key - Clé du paramètre
   * @param {any} defaultValue - Valeur par défaut
   * @returns {any} Valeur du paramètre
   */
  getSetting(key, defaultValue = null) {
    const settings = this.getSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }
};
