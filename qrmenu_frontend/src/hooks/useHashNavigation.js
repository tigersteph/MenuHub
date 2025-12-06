import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook pour gérer la navigation par hash avec Intersection Observer
 * @param {Object} options - Options de configuration
 * @param {number} options.delay - Délai avant le scroll (ms)
 * @param {string} options.behavior - Comportement du scroll ('smooth' | 'auto')
 */
export const useHashNavigation = (options = {}) => {
  const location = useLocation();
  const { delay = 100, behavior = 'smooth' } = options;

  useEffect(() => {
    if (!location.hash) return;

    const hash = location.hash.substring(1); // Enlever le #
    
    // Utiliser Intersection Observer pour détecter quand l'élément est visible
    const scrollToElement = () => {
      const element = document.getElementById(hash);
      if (!element) return;

      // Vérifier si l'élément est déjà visible
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              // Si l'élément n'est pas visible, scroller vers lui
              element.scrollIntoView({ behavior, block: 'start' });
            }
            observer.disconnect();
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(element);

      // Fallback : scroller après un court délai
      setTimeout(() => {
        if (document.getElementById(hash)) {
          element.scrollIntoView({ behavior, block: 'start' });
        }
        observer.disconnect();
      }, delay);
    };

    // Attendre que le DOM soit prêt
    const timeoutId = setTimeout(scrollToElement, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.hash, location.pathname, delay, behavior]);
};

export default useHashNavigation;


