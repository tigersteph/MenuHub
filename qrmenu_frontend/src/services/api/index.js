import { toast } from '../../utils/toast';
import { API_BASE } from '../../config';

function request(path, { data = null, token = null, method = "GET", showErrorToast = true }) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Note: Les routes publiques (login, register) n'ont pas besoin de token
  
  // Construire l'URL : API_BASE contient déjà l'URL complète (http://localhost:8000)
  // Le path contient déjà /api/auth/login, donc on concatène simplement
  // Vérifier si API_BASE se termine par /api pour éviter le double /api/api
  let url;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (API_BASE.endsWith('/api')) {
    // Si API_BASE se termine par /api, enlever /api du path pour éviter /api/api
    url = `${API_BASE}${cleanPath.replace(/^\/api/, '')}`;
  } else if (API_BASE.endsWith('/')) {
    // Si API_BASE se termine par /, enlever le / du début du path
    url = `${API_BASE}${cleanPath.substring(1)}`;
  } else {
    // Sinon, concaténer normalement
    url = `${API_BASE}${cleanPath}`;
  }
  
  // Debug: afficher l'URL construite (uniquement en développement)
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Request]', method, url, '| API_BASE:', API_BASE, '| path:', path);
  }
  
  return fetch(url, {
    method,
    headers,
    body: method !== "GET" && method !== "DELETE" ? JSON.stringify(data) : null,
  })
  .then(async (response) => {
    // If it is success
    if(response.ok) {
        // Pour toutes les méthodes, essayer de parser le JSON
        const contentType = response.headers.get("content-type");
        
        // Si DELETE retourne 204 (No Content), retourner un objet de succès
        if (method === "DELETE" && response.status === 204) {
          return { success: true, message: 'Suppression réussie' };
        }
        
        // Si le contenu est JSON, le parser
        if (contentType && contentType.includes("application/json")) {
          const json = await response.json();
          // S'assurer que la réponse a toujours un format cohérent
          if (method === "DELETE" && !json.success) {
            // Si le backend ne retourne pas success, l'ajouter pour cohérence
            return { success: true, ...json };
          }
          return json;
        }
        
        // Pour DELETE sans JSON, retourner un objet de succès
        if (method === "DELETE") {
          return { success: true, message: 'Suppression réussie' };
        }
        
        // Pour les autres méthodes, essayer de parser le texte
        try {
          const text = await response.text();
          if (text) {
            return JSON.parse(text);
          }
        } catch (e) {
          // Si le parsing échoue, retourner un objet vide
          return {};
        }
        return {};
    }

    // Otherwise, if there are errors
    // Vérifier d'abord le content-type avant d'essayer de parser
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    
    if (!isJson) {
      // Si ce n'est pas du JSON, lire le texte et créer une erreur appropriée
      return response.text().then((text) => {
        let errorMessage = 'Une erreur est survenue';
        
        // Essayer d'extraire un message d'erreur du HTML si possible
        if (text) {
          // Si c'est du HTML, essayer d'extraire le titre ou un message
          const htmlMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i) || 
                           text.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                           text.match(/<p[^>]*>([^<]+)<\/p>/i);
          if (htmlMatch && htmlMatch[1]) {
            errorMessage = htmlMatch[1].trim();
          } else if (text.length < 200) {
            // Si le texte est court, l'utiliser directement
            errorMessage = text.trim();
          } else {
            // Sinon, utiliser un message générique basé sur le status
            if (response.status === 404) {
              errorMessage = 'Ressource non trouvée';
            } else if (response.status === 500) {
              errorMessage = 'Erreur serveur interne';
            } else if (response.status === 503) {
              errorMessage = 'Service temporairement indisponible';
            } else {
              errorMessage = `Erreur ${response.status}: ${response.statusText || 'Erreur serveur'}`;
            }
          }
        } else {
          errorMessage = `Erreur ${response.status}: ${response.statusText || 'Erreur serveur'}`;
        }
        
        // Gérer les codes d'erreur spécifiques
        if (response.status === 401) {
          const errorMsg = errorMessage || 'Session expirée. Veuillez vous reconnecter.';
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.removeItem('token');
          }
          throw new Error(`UNAUTHORIZED:${errorMsg}`);
        }
        
        if (response.status === 500) {
          throw new Error(`SERVER_ERROR_500:${errorMessage}`);
        }
        
        throw new Error(errorMessage);
      });
    }
    
    // Si c'est du JSON, parser normalement
    return response
      .json()
      .then((json) => {
        // Handle JSON error, response by the server
        // Gérer différents formats d'erreur du backend
        let errorMessage = json?.message;
        
        // Format backend standard : { success: false, error: { code, message } }
        if (!errorMessage && json?.error) {
          if (typeof json.error === 'string') {
            errorMessage = json.error;
          } else if (json.error?.message) {
            errorMessage = json.error.message;
          } else if (json.error?.code) {
            errorMessage = json.error.code;
          }
        }
        
        // Fallback si aucun message trouvé
        if (!errorMessage) {
          errorMessage = 'Une erreur est survenue';
        }
        
        if (response.status === 400) {
          // Handle different error formats
          if (Array.isArray(json)) {
            throw new Error(json.join(" "));
          } else if (typeof json === 'object' && json !== null) {
            // Check if values are arrays
            const errors = Object.keys(json).map((k) => {
              if (Array.isArray(json[k])) {
                return json[k].join(" ");
              } else if (typeof json[k] === 'string') {
                return json[k];
              } else if (k === 'error' && typeof json[k] === 'object') {
                // Gérer le format { error: { message: "..." } }
                return json[k].message || json[k].code || JSON.stringify(json[k]);
              }
              return `${k}: ${JSON.stringify(json[k])}`;
            }).filter(Boolean);
            throw new Error(errors.length > 0 ? errors.join(" ") : errorMessage);
          } else {
            throw new Error(errorMessage);
          }
        }
        if (response.status === 401) {
          // Token expiré ou invalide - rediriger vers la page de connexion
          const errorMsg = errorMessage || 'Session expirée. Veuillez vous reconnecter.';
          // Nettoyer le token du sessionStorage si présent
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.removeItem('token');
          }
          throw new Error(`UNAUTHORIZED:${errorMsg}`);
        }
        if (response.status === 500) {
          // Include more details about the 500 error
          const serverMessage = errorMessage || 'Erreur serveur interne';
          throw new Error(`SERVER_ERROR_500:${serverMessage}`);
        }
        throw new Error(errorMessage);
      })
      .catch((e) => {
        // Si c'est une erreur de parsing JSON, c'est qu'on a reçu du non-JSON
        if (e.name === "SyntaxError" || e.message.includes('JSON')) {
          // Essayer de lire le texte de la réponse
          return response.text().then((text) => {
            let errorMessage = 'Erreur de communication avec le serveur';
            
            // Essayer d'extraire un message utile
            if (text && text.length < 500) {
              // Si le texte est court, l'utiliser
              errorMessage = text.trim() || errorMessage;
            } else if (response.status) {
              errorMessage = `Erreur ${response.status}: ${response.statusText || 'Erreur serveur'}`;
            }
            
            throw new Error(errorMessage);
          }).catch(() => {
            // Si même la lecture du texte échoue, utiliser un message générique
            throw new Error(response.statusText || 'Erreur de communication avec le serveur');
          });
        }
        throw e;
      })
  })
  .catch((e) => {
    // Handle all errors
    let errorMessage = e.message || 'Une erreur est survenue';
    
    // Extract server message from 500 errors for better error display
    if (errorMessage.startsWith('SERVER_ERROR_500:')) {
      const serverMsg = errorMessage.split('SERVER_ERROR_500:')[1];
      errorMessage = serverMsg || 'Erreur serveur interne (500)';
    }
    
    // Afficher les erreurs selon le contexte
    // - Toujours afficher pour les méthodes DELETE, POST, PUT (actions utilisateur)
    // - Ne pas afficher pour les erreurs 500 lors du polling (GET répétés)
    // - Ne pas afficher pour les erreurs 401 sur les routes publiques
    const isUserAction = method === 'DELETE' || method === 'POST' || method === 'PUT' || method === 'PATCH';
    const shouldShowError = showErrorToast && (
      isUserAction || 
      (!errorMessage.includes('SERVER_ERROR_500') && 
        !errorMessage.includes('Erreur serveur') &&
        !errorMessage.includes('UNAUTHORIZED') &&
       !errorMessage.includes('401'))
    );
    
    if (shouldShowError) {
      toast.error(errorMessage);
    }
    
    // Return null to indicate error (maintains compatibility)
    // The error message is stored in the error for debugging
    return null;
  })
}

export { request };
