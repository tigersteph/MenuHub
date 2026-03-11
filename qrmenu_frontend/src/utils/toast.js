import React from 'react';
import { toast as reactToastify } from 'react-toastify';
import CustomToast from '../components/ui/CustomToast';

/**
 * Durées standard des notifications (en millisecondes)
 */
const NOTIFICATION_DURATIONS = {
  success: 3500,
  error: 5500,
  warning: 4500,
  info: 3500,
};

const getDefaultSubMessage = (type) => {
  const messages = {
    success: 'Opération réussie',
    error: 'Une erreur est survenue',
    warning: 'Attention requise',
    info: 'Information',
  };
  return messages[type] || '';
};

/**
 * Factory générique.
 * La fermeture automatique est déléguée à react-toastify (autoClose: finalAutoClose).
 * Le composant CustomToast affiche un compte à rebours purement visuel.
 * Le bouton de fermeture utilise closeToast fourni par react-toastify.
 */
const createToastMethod = (type) => (message, options = {}) => {
  const subMessage = options.subMessage || getDefaultSubMessage(type);
  const { subMessage: _, autoClose, persist, critical, ...toastOptions } = options;

  const shouldPersist = persist === true || (type === 'error' && critical === true);
  const finalAutoClose = shouldPersist
    ? false
    : (autoClose !== undefined ? autoClose : NOTIFICATION_DURATIONS[type]);

  // react-toastify passe closeToast et toastProps à la fonction de contenu
  const ToastContent = ({ closeToast }) => (
    <CustomToast
      type={type}
      message={message}
      subMessage={subMessage}
      closeToast={closeToast}
      autoClose={finalAutoClose}
    />
  );

  return reactToastify(ToastContent, {
    ...toastOptions,
    type,
    autoClose: finalAutoClose, // react-toastify gère la fermeture automatique
    bodyClassName: 'toast-body-wrapper',
  });
};

const toastMethods = {
  success: createToastMethod('success'),
  error:   createToastMethod('error'),
  warning: createToastMethod('warning'),
  info:    createToastMethod('info'),
  dismiss:    (toastId) => reactToastify.dismiss(toastId),
  dismissAll: () => reactToastify.dismiss(),
};

const toast = (message, options = {}) => {
  const type = options.type || 'info';
  return (toastMethods[type] ?? toastMethods.info)(message, options);
};

Object.assign(toast, toastMethods);

export { toast };
export default toast;
