import { useState, useEffect, useRef } from 'react';

/**
 * Hook pour animer les éléments au scroll avec Intersection Observer
 * @param {Object} options - Options de configuration
 * @param {number} options.threshold - Seuil de visibilité (0-1)
 * @param {string} options.rootMargin - Marge autour du root
 * @returns {Array} [ref, isVisible]
 */
export const useScrollAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  const { threshold = 0.1, rootMargin = '0px' } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionnel : arrêter d'observer après la première animation
          // observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  return [ref, isVisible];
};

/**
 * Hook pour détecter le scroll et ajouter des classes au header
 * @returns {boolean} isScrolled
 */
export const useScrollDetection = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isScrolled;
};

