import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * CustomToast - Composant de notification personnalisé.
 *
 * La fermeture automatique est gérée par react-toastify (via autoClose dans toast.js).
 * Ce composant affiche uniquement un compte à rebours visuel.
 * Le bouton de fermeture appelle closeToast(), fourni par react-toastify.
 */
const CustomToast = ({ type, message, subMessage, closeToast, autoClose }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const intervalRef = useRef(null);
  const closeToastRef = useRef(closeToast);

  // Maintenir la ref à jour pour éviter une closure obsolète
  closeToastRef.current = closeToast;

  // Compte à rebours purement visuel — react-toastify gère la vraie fermeture
  useEffect(() => {
    if (autoClose && typeof autoClose === 'number' && autoClose > 0) {
      const startTime = Date.now();

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((autoClose - elapsed) / 1000));
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setTimeRemaining(null);
        }
      }, 100);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      setTimeRemaining(null);
    }
  }, [autoClose]);

  const handleClose = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const fn = closeToastRef.current;
    if (fn && typeof fn === 'function') fn();
  };

  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: '#269b24',
      iconBg: '#04e40048',
      waveColor: '#04e4003a',
      textColor: '#269b24',
      wavePath: 'M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,224,206,213.3C182.9,192,160,192,137,192C114.3,192,91,224,69,224C45.7,224,23,192,11,176L0,160Z',
    },
    error: {
      icon: XCircle,
      iconColor: '#dc2626',
      iconBg: '#fee2e248',
      waveColor: '#fee2e23a',
      textColor: '#dc2626',
      wavePath: 'M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z',
    },
    warning: {
      icon: AlertCircle,
      iconColor: '#f59e0b',
      iconBg: '#fef3c748',
      waveColor: '#fef3c73a',
      textColor: '#f59e0b',
      wavePath: 'M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z',
    },
    info: {
      icon: Info,
      iconColor: '#3b82f6',
      iconBg: '#dbeafe48',
      waveColor: '#dbeafe3a',
      textColor: '#3b82f6',
      wavePath: 'M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z',
    },
  };

  const toastConfig = config[type] || config.info;
  const Icon = toastConfig.icon;
  const ariaRole = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <span
      className="custom-toast-card"
      role={ariaRole}
      aria-live={ariaLive}
      aria-atomic="true"
      aria-label={`Notification ${type}: ${message}`}
    >
      <div className="custom-toast-inner">
        <svg
          className="custom-toast-wave"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          style={{ fill: toastConfig.waveColor }}
          aria-hidden="true"
        >
          <path d={toastConfig.wavePath} fillOpacity={1} />
        </svg>

        <div
          className="custom-toast-icon-container"
          style={{ backgroundColor: toastConfig.iconBg }}
          aria-hidden="true"
        >
          <Icon size={17} style={{ color: toastConfig.iconColor }} />
        </div>

        <div className="custom-toast-message-container">
          <p className="custom-toast-message-text" style={{ color: toastConfig.textColor }}>
            {message}
          </p>
          {subMessage && (
            <p className="custom-toast-sub-text">{subMessage}</p>
          )}
        </div>

        {timeRemaining !== null && timeRemaining > 0 && (
          <span
            className="custom-toast-timer"
            aria-label={`Fermeture dans ${timeRemaining} seconde${timeRemaining > 1 ? 's' : ''}`}
          >
            {timeRemaining}s
          </span>
        )}

        <button
          onClick={handleClose}
          className="custom-toast-close-button"
          aria-label="Fermer la notification"
          type="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClose(e);
            }
          }}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </span>
  );
};

export default CustomToast;
