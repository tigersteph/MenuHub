import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast as reactToastify, Slide } from 'react-toastify';

const ToastWrapper = () => {
  const location = useLocation();
  const previousPathnameRef = useRef(location.pathname);
  
  // Safety check: fallback to window.location if useLocation fails
  const pathname = location?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const isClientPage = pathname.startsWith('/menu/');
  
  // Position: top-center for client (visible but discrete), top-right for restaurant
  const position = isClientPage ? 'top-center' : 'top-right';
  
  // Nettoyer les toasts lors des changements de route
  useEffect(() => {
    // Si le pathname a changé, nettoyer tous les toasts
    if (previousPathnameRef.current !== pathname) {
      // Nettoyer immédiatement les toasts lors du changement de route
      // Cela évite que les notifications de la page précédente restent visibles
      reactToastify.dismiss();
      previousPathnameRef.current = pathname;
    }
  }, [pathname]);
  
  // Note: autoClose is now handled per notification type in utils/toast.js
  // Using a default fallback value (will be overridden by individual toast calls)
  // Durées professionnelles recommandées (en millisecondes) :
  // - Success: 3500ms (feedback positif, peut disparaître rapidement)
  // - Error: 5500ms (information critique, l'utilisateur a besoin de temps pour lire)
  // - Warning: 4500ms (important mais moins critique que l'erreur)
  // - Info: 3500ms (information, peut disparaître rapidement)
  // Valeur par défaut: 4000ms (compromis professionnel)
  const defaultAutoClose = 4000;

  return (
    <ToastContainer
      position={position}
      autoClose={defaultAutoClose}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={false}
      draggable={false}
      pauseOnHover={false}
      theme="light"
      toastClassName="custom-toast-wrapper"
      bodyClassName="custom-toast-body-wrapper"
      closeButton={false}
      transition={Slide}
      enableMultiContainer={false}
      limit={5}
    />
  );
};

export default ToastWrapper;

