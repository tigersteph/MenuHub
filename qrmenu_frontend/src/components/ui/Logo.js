import React from 'react';

/**
 * Composant Logo réutilisable
 */
const Logo = ({ className = "size-8", showText = false, textClassName = "" }) => {
  return (
    <div className="flex items-center gap-3">
      <img 
        src="/logo.svg" 
        alt="MenuHub Logo" 
        className={className}
        loading="eager"
      />
      {showText && (
        <h1 className={`text-dark-text text-2xl font-bold tracking-tight ${textClassName}`}>
          MenuHub
        </h1>
      )}
    </div>
  );
};

export default Logo;


