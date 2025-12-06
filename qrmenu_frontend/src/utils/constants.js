// Constantes de l'application

// Statuts des commandes
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Types d'utilisateurs
export const USER_TYPES = {
  ADMIN: 'admin',
  RESTAURANT_OWNER: 'restaurant_owner',
  CUSTOMER: 'customer'
};

// Types de paiement
export const PAYMENT_TYPES = {
  CASH: 'cash',
  CARD: 'card',
  MOBILE: 'mobile'
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  NOT_FOUND: 'Ressource non trouvée.',
  VALIDATION_ERROR: 'Les données fournies ne sont pas valides.',
  SERVER_ERROR: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.'
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  PLACE_CREATED: 'Restaurant créé avec succès !',
  PLACE_UPDATED: 'Restaurant mis à jour avec succès !',
  PLACE_DELETED: 'Restaurant supprimé avec succès !',
  MENU_ITEM_ADDED: 'Article ajouté au menu avec succès !',
  MENU_ITEM_UPDATED: 'Article mis à jour avec succès !',
  MENU_ITEM_DELETED: 'Article supprimé du menu avec succès !',
  ORDER_COMPLETED: 'Commande marquée comme terminée !'
};

// Configuration Cloudinary
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'dtb7kciiu',
  UPLOAD_PRESET: 'menuhub_photos',
  UPLOAD_URL: 'https://api.cloudinary.com/v1_1/dtb7kciiu/image/upload'
};

// Limites de l'application
export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_DIMENSIONS: 2048,
  MAX_MENU_ITEMS: 100,
  MAX_CATEGORIES: 20
};

// Formats de date
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD HH:mm:ss',
  SHORT: 'DD/MM/YYYY'
};

// Couleurs du thème
export const THEME_COLORS = {
  PRIMARY: '#FF5A1F',
  SECONDARY: '#5F4B8B',
  SUCCESS: '#00C48C',
  WARNING: '#FFD600',
  ERROR: '#FF3B30',
  INFO: '#2196F3'
};

// Breakpoints responsive
export const BREAKPOINTS = {
  MOBILE: '768px',
  TABLET: '1024px',
  DESKTOP: '1200px'
};
