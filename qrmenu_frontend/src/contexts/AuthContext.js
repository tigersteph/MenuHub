import React, { createContext, useState, useEffect } from 'react';

import {signIn as signInApi, register as registerApi} from '../services';
import { getProfile } from '../services/api/auth';
import { isTokenValid, getValidToken } from '../utils/token';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialiser avec un token valide uniquement
  const [token, setToken] = useState(() => getValidToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Détecter la fermeture de l'onglet/navigateur et déconnecter (mais pas lors d'un refresh)
  // sessionStorage persiste lors d'un refresh mais est vidé lors d'une vraie fermeture
  // On n'a donc pas besoin de supprimer le token manuellement lors d'un refresh
  useEffect(() => {
    // Ne pas supprimer le token dans beforeunload ou pagehide car ces événements
    // sont déclenchés aussi lors d'un refresh, pas seulement lors d'une fermeture
    // sessionStorage gère naturellement la persistance : il persiste lors d'un refresh
    // mais est vidé lors d'une vraie fermeture de l'onglet/fenêtre
    
    // La déconnexion se fera automatiquement car :
    // 1. Lors d'un refresh : sessionStorage persiste, le token reste, l'utilisateur reste connecté
    // 2. Lors d'une fermeture : sessionStorage est vidé, le token disparaît, l'utilisateur est déconnecté
    // 3. Le token est récupéré au montage via getValidToken() qui lit depuis sessionStorage
    
    // Pas besoin d'écouter beforeunload ou pagehide pour supprimer le token
    // Ces événements sont déclenchés aussi lors d'un refresh
  }, []);

  // Écouter les événements de token expiré depuis d'autres parties de l'application
  useEffect(() => {
    const handleTokenExpired = () => {
      // Déconnecter l'utilisateur si le token expire
      sessionStorage.removeItem("token");
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, []);

  const signIn = async (email, password, callback) => {
    setLoading(true);
    setError(null);
    try {
      const response = await signInApi(email, password);
      console.log("response", response);

      // Le backend retourne { success: true, data: { user, token }, message }
      const token = response?.data?.token || response?.token;
      const userData = response?.data?.user || response?.user;

      if (response && token && isTokenValid(token)) {
        sessionStorage.setItem("token", token);
        setToken(token);
        setError(null); // Réinitialiser l'erreur en cas de succès
        
        // Utiliser les données utilisateur de la réponse si disponibles
        if (userData) {
          setUser(userData);
        } else {
          // Sinon, charger le profil utilisateur après connexion
          try {
            const profile = await getProfile(token);
            if (profile) {
              // Le profil peut être dans profile.data si le backend utilise le format standardisé
              setUser(profile?.data || profile);
            }
          } catch (err) {
            console.error('Erreur lors du chargement du profil:', err);
          }
        }
        if (callback) callback();
      } else if (response && response.message) {
        setError(response.message);
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Email ou mot de passe incorrect';
      setError(errorMessage);
      // Ne pas throw pour éviter de casser le flux
    } finally {
      setLoading(false);
    }
  }

  const signOut = () => {
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  // Vérifier périodiquement si le token est toujours valide
  useEffect(() => {
    const checkTokenValidity = () => {
      if (token && !isTokenValid(token)) {
        // Token expiré, le supprimer
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    };

    // Vérifier immédiatement
    checkTokenValidity();

    // Vérifier toutes les minutes pour détecter l'expiration
    const interval = setInterval(checkTokenValidity, 60000);

    return () => clearInterval(interval);
  }, [token]);

  // Charger le profil utilisateur quand le token change
  useEffect(() => {
    const loadUserProfile = async () => {
      if (token && isTokenValid(token)) {
        try {
          const profile = await getProfile(token);
          if (profile) {
            // Le profil peut être dans profile.data si le backend utilise le format standardisé
            setUser(profile?.data || profile);
          }
        } catch (err) {
          console.error('Erreur lors du chargement du profil:', err);
          // Si l'erreur est due à un token invalide, le supprimer
          if (err.response?.status === 401) {
            sessionStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    };
    loadUserProfile();
  }, [token]);

  const register = async (
    email,
    password,
    confirmPassword,
    callback,
    firstName = '',
    lastName = '',
    restaurantName = ''
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Utilise l'email comme username par défaut
      const response = await registerApi({
        username: email,
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        restaurantName
      });
      // Le backend retourne { success: true, data: { user, token }, message }
      const token = response?.data?.token || response?.token;
      const userData = response?.data?.user || response?.user || response;

      if (response && (response.id || response.user || userData)) {
        // Si l'inscription réussit, connecter automatiquement
        if (token && isTokenValid(token)) {
          sessionStorage.setItem("token", token);
          setToken(token);
          
          // Utiliser les données utilisateur de la réponse si disponibles
          if (userData) {
            setUser(userData);
          } else {
            // Sinon, charger le profil utilisateur après inscription
            try {
              const profile = await getProfile(token);
              if (profile) {
                // Le profil peut être dans profile.data si le backend utilise le format standardisé
                setUser(profile?.data || profile);
              }
            } catch (err) {
              console.error('Erreur lors du chargement du profil:', err);
            }
          }
        }
        setError(null); // Réinitialiser l'erreur en cas de succès
        if (callback) callback();
      } else if (response && response.message) {
        setError(response.message);
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      // Ne pas throw pour éviter de casser le flux
    } finally {
      setLoading(false);
    }
  }

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    token,
    loading,
    error,
    user,
    signIn,
    signOut,
    register,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};

export default AuthContext;

