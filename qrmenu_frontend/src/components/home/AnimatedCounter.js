import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Composant pour animer un compteur de nombre
 * @param {number} end - Valeur finale
 * @param {number} duration - Durée de l'animation en ms
 * @param {string} prefix - Préfixe (ex: "+", "-")
 * @param {string} suffix - Suffixe (ex: "K+", "%")
 * @param {boolean} startOnView - Démarrer l'animation quand visible
 */
const AnimatedCounter = ({ 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '',
  startOnView = true 
}) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef(null);

  const animate = useCallback(() => {
    let startTime = null;
    const startValue = 0;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(startValue + (end - startValue) * easeOut);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animation);
  }, [end, duration]);

  useEffect(() => {
    if (!startOnView) {
      // Démarrer immédiatement
      animate();
      return;
    }

    // Observer pour démarrer l'animation quand visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          animate();
        }
      },
      { threshold: 0.1 }
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
  }, [startOnView, hasStarted, animate]);

  // Formater le nombre avec préfixe et suffixe
  const formatNumber = (num) => {
    if (typeof num === 'string') {
      return num; // Pour les chaînes comme "- 5 min", retourner tel quel
    }
    return `${prefix}${num}${suffix}`;
  };

  return (
    <span ref={ref}>
      {formatNumber(count)}
    </span>
  );
};

export default AnimatedCounter;

