import React from 'react';
import { toast as reactToastify } from 'react-toastify';
import CustomToast from '../components/ui/CustomToast';

/**
 * Professional notification duration standards (in milliseconds)
 * Based on UX best practices and industry standards:
 * - Success: 3500ms - Positive feedback, can disappear quickly
 * - Error: 5500ms - Critical information, user needs time to read
 * - Warning: 4500ms - Important but less critical than error
 * - Info: 3500ms - Informational, can disappear quickly
 */
const NOTIFICATION_DURATIONS = {
  success: 3500,
  error: 5500,
  warning: 4500,
  info: 3500,
};

// Helper to get default sub-messages based on type
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
 * Custom toast utility that uses our CustomToast component
 * Maintains the same API as react-toastify but with custom styling
 * Applies professional standard durations for auto-close
 */
const toastMethods = {
  success: (message, options = {}) => {
    const subMessage = options.subMessage || getDefaultSubMessage('success');
    const { subMessage: _, autoClose, ...toastOptions } = options;
    
    // Create a wrapper component that receives react-toastify props
    const ToastContent = ({ closeToast }) => (
      <CustomToast
        type="success"
        message={message}
        subMessage={subMessage}
        onClose={closeToast}
      />
    );
    
    return reactToastify(ToastContent, {
      ...toastOptions,
      type: 'success',
      autoClose: autoClose !== undefined ? autoClose : NOTIFICATION_DURATIONS.success,
      bodyClassName: 'toast-body-wrapper',
    });
  },

  error: (message, options = {}) => {
    const subMessage = options.subMessage || getDefaultSubMessage('error');
    const { subMessage: _, autoClose, ...toastOptions } = options;
    
    const ToastContent = ({ closeToast }) => (
      <CustomToast
        type="error"
        message={message}
        subMessage={subMessage}
        onClose={closeToast}
      />
    );
    
    return reactToastify(ToastContent, {
      ...toastOptions,
      type: 'error',
      autoClose: autoClose !== undefined ? autoClose : NOTIFICATION_DURATIONS.error,
      bodyClassName: 'toast-body-wrapper',
    });
  },

  warning: (message, options = {}) => {
    const subMessage = options.subMessage || getDefaultSubMessage('warning');
    const { subMessage: _, autoClose, ...toastOptions } = options;
    
    const ToastContent = ({ closeToast }) => (
      <CustomToast
        type="warning"
        message={message}
        subMessage={subMessage}
        onClose={closeToast}
      />
    );
    
    return reactToastify(ToastContent, {
      ...toastOptions,
      type: 'warning',
      autoClose: autoClose !== undefined ? autoClose : NOTIFICATION_DURATIONS.warning,
      bodyClassName: 'toast-body-wrapper',
    });
  },

  info: (message, options = {}) => {
    const subMessage = options.subMessage || getDefaultSubMessage('info');
    const { subMessage: _, autoClose, ...toastOptions } = options;
    
    const ToastContent = ({ closeToast }) => (
      <CustomToast
        type="info"
        message={message}
        subMessage={subMessage}
        onClose={closeToast}
      />
    );
    
    return reactToastify(ToastContent, {
      ...toastOptions,
      type: 'info',
      autoClose: autoClose !== undefined ? autoClose : NOTIFICATION_DURATIONS.info,
      bodyClassName: 'toast-body-wrapper',
    });
  },
  
  // Add dismiss method for compatibility
  dismiss: (toastId) => reactToastify.dismiss(toastId),
};

// Create a callable function for direct toast() calls
const toast = (message, options = {}) => {
  const type = options.type || 'info';
  if (toastMethods[type]) {
    return toastMethods[type](message, options);
  }
  return toastMethods.info(message, options);
};

// Attach all methods to the function for toast.success(), toast.error(), etc.
Object.assign(toast, toastMethods);

// Export both: named export (callable function with methods) and default export
// This allows both: import { toast } from './toast' and import toast from './toast'
// Both will be callable and have methods attached
export { toast };
export default toast;

