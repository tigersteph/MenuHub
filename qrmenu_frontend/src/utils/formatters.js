// Formateurs de données

/**
 * Formate un nom avec la première lettre en majuscule
 * @param {string} name - Nom à formater
 * @returns {string} Nom formaté
 */
export const formatName = (name) => {
  if (!name) return '';
  return name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Formate un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone
 * @returns {string} Numéro formaté
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Formater selon le format français
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else if (cleaned.length === 11 && cleaned.startsWith('33')) {
    const withoutCountryCode = cleaned.substring(2);
    return `+33 ${withoutCountryCode.substring(0, 1)} ${withoutCountryCode.substring(1, 3)} ${withoutCountryCode.substring(3, 5)} ${withoutCountryCode.substring(5, 7)} ${withoutCountryCode.substring(7, 9)}`;
  }
  
  return phone;
};

/**
 * Formate une adresse
 * @param {Object} address - Objet adresse
 * @returns {string} Adresse formatée
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};

/**
 * Formate un statut de commande
 * @param {string} status - Statut de la commande
 * @returns {Object} Objet avec le statut formaté et la couleur
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    pending: { label: 'En attente', color: '#FFD600', icon: '⏳' },
    in_progress: { label: 'En cours', color: '#FF5A1F', icon: '👨‍🍳' },
    completed: { label: 'Terminée', color: '#00C48C', icon: '✅' },
    cancelled: { label: 'Annulée', color: '#FF3B30', icon: '❌' }
  };
  
  return statusMap[status] || { label: status, color: '#6B7280', icon: '❓' };
};

/**
 * Formate un montant total de commande
 * @param {Array} items - Articles de la commande
 * @returns {Object} Objet avec le total et la TVA
 */
export const formatOrderTotal = (items) => {
  if (!items || !Array.isArray(items)) {
    return { subtotal: 0, tax: 0, total: 0 };
  }
  
  const subtotal = items.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * (item.quantity || 1));
  }, 0);
  
  const taxRate = 0.20; // TVA 20%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

/**
 * Formate une liste d'articles pour l'affichage
 * @param {Array} items - Articles
 * @returns {string} Liste formatée
 */
export const formatItemsList = (items) => {
  if (!items || !Array.isArray(items)) return '';
  
  return items.map(item => {
    const quantity = item.quantity || 1;
    return `${quantity}x ${item.name}`;
  }).join(', ');
};

/**
 * Formate une durée de préparation
 * @param {number} minutes - Durée en minutes
 * @returns {string} Durée formatée
 */
export const formatPreparationTime = (minutes) => {
  if (!minutes || minutes <= 0) return 'Non spécifié';
  
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }
};

/**
 * Formate un nom de fichier pour l'upload
 * @param {string} filename - Nom du fichier
 * @returns {string} Nom formaté
 */
export const formatFilename = (filename) => {
  if (!filename) return '';
  
  // Supprimer les caractères spéciaux et espaces
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Formate une taille de fichier
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formate un texte pour l'affichage (tronque si nécessaire)
 * @param {string} text - Texte à formater
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte formaté
 */
export const formatTextPreview = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Formate une note/évaluation
 * @param {number} rating - Note (0-5)
 * @returns {Object} Objet avec la note formatée et les étoiles
 */
export const formatRating = (rating) => {
  if (!rating || rating < 0 || rating > 5) {
    return { stars: '☆☆☆☆☆', value: 0, label: 'Non évalué' };
  }
  
  const fullStars = '★'.repeat(Math.floor(rating));
  const emptyStars = '☆'.repeat(5 - Math.floor(rating));
  const stars = fullStars + emptyStars;
  
  const labels = {
    0: 'Très mauvais',
    1: 'Mauvais',
    2: 'Moyen',
    3: 'Bien',
    4: 'Très bien',
    5: 'Excellent'
  };
  
  return {
    stars,
    value: rating,
    label: labels[Math.floor(rating)] || 'Non évalué'
  };
};
