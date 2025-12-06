// Fonctions utilitaires générales

/**
 * Formate un prix (par défaut en FCFA/XOF)
 * @param {number} price - Prix à formater
 * @param {string} currency - Devise (par défaut 'EUR')
 * @returns {string} Prix formaté
 */
export const formatPrice = (price, currency = 'XOF') => {
  const numeric = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(numeric)) return '0 F CFA';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numeric);
};

/**
 * Formate une date
 * @param {Date|string} date - Date à formater
 * @param {string} format - Format de sortie
 * @returns {string} Date formatée
 */
export const formatDate = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('fr-FR', options).format(dateObj);
};

/**
 * Génère un ID unique
 * @returns {string} ID unique
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Débounce une fonction
 * @param {Function} func - Fonction à débouncer
 * @param {number} wait - Délai d'attente en ms
 * @returns {Function} Fonction débouncée
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle une fonction
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Limite en ms
 * @returns {Function} Fonction throttlée
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Copie un texte dans le presse-papiers
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>} Succès de la copie
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback pour les navigateurs plus anciens
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Télécharge un fichier
 * @param {string} url - URL du fichier
 * @param {string} filename - Nom du fichier
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Vérifie si un élément est visible dans le viewport
 * @param {Element} element - Élément à vérifier
 * @returns {boolean} True si visible
 */
export const isElementInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Scroll vers un élément
 * @param {string|Element} element - Sélecteur ou élément
 * @param {Object} options - Options de scroll
 */
export const scrollToElement = (element, options = {}) => {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options
    });
  }
};

/**
 * Calcule la différence de temps entre deux dates
 * @param {Date|string} date1 - Première date
 * @param {Date|string} date2 - Deuxième date
 * @returns {Object} Objet avec les différences
 */
export const getTimeDifference = (date1, date2 = new Date()) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2 - d1);
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};

/**
 * Formate une durée en texte lisible
 * @param {number} seconds - Durée en secondes
 * @returns {string} Durée formatée
 */
export const formatDuration = (seconds) => {
  const { days, hours, minutes } = getTimeDifference(new Date(), new Date(Date.now() + seconds * 1000));
  
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};
