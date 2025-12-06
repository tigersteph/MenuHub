import React, { useState, useEffect } from 'react';
import logo from '../../assets/images/logo.svg';

/**
 * Splash Screen avec animation Fade & Scale avec Logo Flottant
 * Animation élégante et professionnelle pour l'écran de démarrage
 * Durée totale: 2.5 secondes
 */
const SplashScreen = ({ onComplete, color = '#fa7938' }) => {
  const [phase, setPhase] = useState('hidden'); // hidden, logo-appear, logo-float, text-appear, fade-out
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Séquence d'animation précise selon les spécifications
    const timeline = [
      { delay: 0, action: () => setPhase('logo-appear') },      // 0s - Logo apparaît avec fade-in
      { delay: 500, action: () => setPhase('logo-float') },     // 0.5s - Logo flotte (scale + légère rotation)
      { delay: 1300, action: () => setPhase('text-appear') },   // 1.3s - Texte apparaît avec slide-up
      { delay: 2000, action: () => setPhase('fade-out') },       // 2s - Fade-out progressif
      { delay: 2500, action: () => setIsVisible(false) },       // 2.5s - Masquer complètement
    ];

    timeline.forEach(({ delay, action }) => {
      setTimeout(action, delay);
    });

    // Appeler onComplete après l'animation complète
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);

    // Cleanup
    return () => {
      timeline.forEach(({ delay, action }) => {
        clearTimeout(setTimeout(action, delay));
      });
    };
  }, [onComplete]);

  if (!isVisible) return null;

  // Calculer la couleur de fond avec opacité
  const backgroundColor = color 
    ? `rgba(${hexToRgb(color)}, 0.08)` 
    : 'rgba(250, 121, 56, 0.08)';

  // Styles dynamiques selon la phase
  const getLogoStyle = () => {
    const baseStyle = {
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    switch (phase) {
      case 'hidden':
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'scale(0.8) translateY(20px)',
        };
      case 'logo-appear':
        return {
          ...baseStyle,
          opacity: 1,
          transform: 'scale(1) translateY(0)',
        };
      case 'logo-float':
        return {
          ...baseStyle,
          opacity: 1,
          transform: 'scale(1.1) translateY(-8px) rotate(2deg)',
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        };
      case 'text-appear':
      case 'fade-out':
        return {
          ...baseStyle,
          opacity: phase === 'fade-out' ? 0.7 : 1,
          transform: 'scale(1) translateY(0) rotate(0deg)',
          transition: 'all 0.3s ease-out',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    if (phase === 'text-appear' || phase === 'fade-out') {
      return {
        ...baseStyle,
        opacity: phase === 'fade-out' ? 0 : 1,
        transform: 'translateY(0)',
      };
    }
    return {
      ...baseStyle,
      opacity: 0,
      transform: 'translateY(15px)',
    };
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: backgroundColor,
        backdropFilter: 'blur(2px)',
        transition: 'opacity 0.5s ease-out',
        opacity: phase === 'fade-out' ? 0 : 1,
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-8 px-4">
        {/* Logo avec animation Fade & Scale */}
        <div
          className="relative"
          style={getLogoStyle()}
        >
          <img 
            src={logo} 
            alt="MenuHub Logo" 
            className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40"
            style={{
              filter: color 
                ? `drop-shadow(0 8px 24px ${color}50)` 
                : 'drop-shadow(0 8px 24px rgba(250, 121, 56, 0.5))',
              willChange: 'transform',
            }}
          />
        </div>

        {/* Phrase d'accroche avec slide-up */}
        <div
          className="text-center px-4 max-w-sm"
          style={getTextStyle()}
        >
          <p 
            className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide leading-relaxed"
            style={{
              color: color || '#fa7938',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              letterSpacing: '0.5px',
            }}
          >
            Préparez-vous à savourer l'excellence
          </p>
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour convertir hex en rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '250, 121, 56';
}

export default SplashScreen;
