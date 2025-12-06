// Import de la configuration API
import { API_BASE } from '../config';
import { isTokenValid } from '../utils/token';

// Configuration Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'ddbavughv';
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'menuhub_photos';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Log de la configuration pour debug (une seule fois au chargement)
if (process.env.NODE_ENV === 'development' && !window._cloudinaryConfigLogged) {
  console.log('[Cloudinary Config]', JSON.stringify({
    cloudName: CLOUDINARY_CLOUD_NAME,
    preset: CLOUDINARY_UPLOAD_PRESET,
    fromEnv: !!process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    url: CLOUDINARY_UPLOAD_URL
  }, null, 2));
  window._cloudinaryConfigLogged = true;
}

// Fonction pour obtenir le token d'authentification
function getAuthToken() {
  // Essayer depuis sessionStorage d'abord (priorité)
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) return sessionToken;
  
  // Essayer depuis localStorage (fallback pour compatibilité)
  const token = localStorage.getItem('token');
  if (token) return token;
  
  return null;
}

// Fonction pour uploader via le backend (méthode préférée)
async function uploadImageViaBackend(image) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentification requise pour l\'upload d\'image');
  }
  
  // Vérifier que le token est valide avant d'essayer l'upload
  if (!isTokenValid(token)) {
    // Nettoyer le token expiré
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }
    throw new Error('Token expiré. Veuillez vous reconnecter.');
  }
  
  const formData = new FormData();
  formData.append('image', image);
  
  const response = await fetch(`${API_BASE}/api/upload/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  // Gérer les erreurs avant de parser le JSON
  if (!response.ok) {
    // Si 401, le token est expiré ou invalide
    if (response.status === 401) {
      // Nettoyer le token expiré
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      
      // Déclencher un événement pour notifier l'application
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      }
      
      throw new Error('Token expiré. Veuillez vous reconnecter.');
    }
    
    // Pour les autres erreurs, essayer de parser le JSON
    let errorMessage = `Erreur d'upload (${response.status})`;
    try {
      const data = await response.json();
      errorMessage = data.error?.message || data.message || errorMessage;
    } catch (e) {
      // Si le parsing échoue, utiliser le message par défaut
    }
    throw new Error(errorMessage);
  }
  
  // Parser le JSON seulement si la réponse est OK
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Réponse invalide du serveur');
  }
  
  if (!data.success) {
    const errorMessage = data.error?.message || data.message || 'Erreur d\'upload';
    throw new Error(errorMessage);
  }
  
  // Retourner au format attendu par le frontend
  return {
    secure_url: data.data?.secure_url || data.data?.url,
    url: data.data?.url || data.data?.secure_url,
    public_id: data.data?.public_id
  };
}

// Fonction pour uploader directement vers Cloudinary (fallback - seulement si preset est défini)
async function uploadImageDirectly(image) {
  // Ne pas essayer l'upload direct si aucun preset n'est configuré
  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('PRESET_ERROR: Aucun preset Cloudinary valide configuré. Utilisez l\'upload via le backend.');
  }
  
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData
  });
  
  const data = await response.json();
  
  if (!response.ok || data.error) {
    const errorMessage = data.error?.message || `Erreur d'upload (${response.status})`;
    
    if (data.error?.message?.includes('preset') || data.error?.message?.includes('Upload preset not found') || response.status === 400) {
      throw new Error(`PRESET_ERROR: Le preset "${CLOUDINARY_UPLOAD_PRESET}" n'existe pas dans Cloudinary.`);
    }
    
    throw new Error(errorMessage);
  }
  
  if (!data.secure_url && !data.url) {
    throw new Error('L\'upload a réussi mais aucune URL n\'a été retournée');
  }
  
  return data;
}

export async function uploadImage(image) {
  // Validation du fichier
  if (!image) {
    throw new Error('Aucun fichier fourni');
  }
  
  // Vérifier le type de fichier
  if (!image.type || !image.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }
  
  // Vérifier la taille (max 10MB par défaut)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (image.size > maxSize) {
    throw new Error(`L'image est trop grande. Taille maximale: ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  // Vérifier d'abord si un token existe et est valide
  const token = getAuthToken();
  const isTokenValidCheck = token ? isTokenValid(token) : false;
  
  // Si un token existe mais est invalide, le nettoyer
  if (token && !isTokenValidCheck) {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }
    throw new Error('Token expiré. Veuillez vous reconnecter.');
  }
  
  // Essayer d'abord via le backend (méthode préférée et recommandée)
  try {
    const result = await uploadImageViaBackend(image);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Cloudinary] Upload réussi via backend');
    }
    return result;
  } catch (backendError) {
    // Si l'upload via backend échoue, essayer directement vers Cloudinary seulement si preset valide
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Cloudinary] Upload via backend échoué:', backendError.message);
    }
    
    // Si l'erreur est due à un token expiré ou manquant, ne pas essayer l'upload direct
    // L'utilisateur doit se reconnecter
    if (backendError.message && (
      backendError.message.includes('Token expiré') ||
      backendError.message.includes('Authentification requise')
    )) {
      throw backendError;
    }
    
    // Ne pas essayer l'upload direct si le backend a échoué à cause d'un problème de configuration
    // L'upload direct nécessite un preset qui n'existe probablement pas
    if (backendError.message && (
      backendError.message.includes('preset') || 
      backendError.message.includes('Configuration') ||
      backendError.message.includes('CLOUDINARY')
    )) {
      // Relancer l'erreur du backend qui est plus informative
      throw backendError;
    }
    
    // Essayer l'upload direct seulement si le preset est valide et l'erreur n'est pas liée à l'auth
    // ET seulement si l'utilisateur n'était pas authentifié (pas de token)
    if (!token) {
      try {
        const result = await uploadImageDirectly(image);
        if (process.env.NODE_ENV === 'development') {
          console.log('[Cloudinary] Upload réussi directement (sans authentification)');
    }
        return result;
      } catch (directError) {
        // Si les deux méthodes échouent, relancer l'erreur du backend qui est plus informative
        throw backendError;
    }
    } else {
      // Si l'utilisateur était authentifié mais l'upload a échoué, ne pas essayer l'upload direct
      // Cela pourrait indiquer un problème de configuration backend
      throw backendError;
    }
  }
}
