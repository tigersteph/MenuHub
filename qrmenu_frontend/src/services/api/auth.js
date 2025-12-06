import { request } from './index';

export function signIn(email, password) {
  return request("/api/auth/login", {
    data: { email, password },
    method: "POST"
  }).catch(error => {
    // Retourner l'erreur avec le message pour que le contexte puisse l'utiliser
    return Promise.reject({
      response: {
        data: {
          message: error.message || 'Email ou mot de passe incorrect'
        }
      },
      message: error.message || 'Email ou mot de passe incorrect'
    });
  });
}

export function register(data) {
  return request("/api/auth/register", {
    data,
    method: "POST"
  }).catch(error => {
    return Promise.reject({
      response: {
        data: {
          message: error.message || 'Erreur lors de l\'inscription'
        }
      },
      message: error.message || 'Erreur lors de l\'inscription'
    });
  });
}

export function forgotPassword(email) {
  return request("/api/auth/forgot-password", {
    data: { email },
    method: "POST"
  });
}

export function resetPassword(token, password, confirmPassword) {
  return request("/api/auth/reset-password", {
    data: { token, password, confirmPassword },
    method: "POST"
  }).catch(error => {
    return Promise.reject({
      response: {
        data: {
          message: error.response?.data?.message || error.message || 'Erreur lors de la réinitialisation du mot de passe'
        }
      },
      message: error.response?.data?.message || error.message || 'Erreur lors de la réinitialisation du mot de passe'
    });
  });
}

export function getProfile(token) {
  return request("/api/auth/profile", {
    token,
    method: "GET"
  });
}

export function updateProfile(data, token) {
  return request("/api/auth/profile", {
    data,
    token,
    method: "PUT"
  });
}
