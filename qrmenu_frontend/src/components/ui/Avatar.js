import React from 'react';

/**
 * Composant Avatar avec initiales en fallback
 */
const Avatar = ({ 
  src, 
  name, 
  email, 
  size = 40, 
  className = "",
  showInitials = true 
}) => {
  // Générer les initiales depuis le nom ou l'email
  const getInitials = () => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const initials = showInitials ? getInitials() : '';
  
  // Calculer la taille de la police en fonction de la taille de l'avatar
  const fontSize = size <= 32 ? '0.75rem' : size <= 40 ? '0.875rem' : size <= 48 ? '1rem' : '1.125rem';

  if (src) {
    return (
      <div 
        className={`rounded-full bg-cover bg-center border-2 border-white shadow-md ${className}`}
        style={{ 
          width: `${size}px`,
          height: `${size}px`,
          backgroundImage: `url('${src}')`
        }}
        title={name || email || "Utilisateur"}
        aria-label={name || email || "Avatar utilisateur"}
      />
    );
  }

  // Avatar avec initiales
  return (
    <div 
      className={`rounded-full bg-gradient-to-br from-primary to-[#E54A0F] flex items-center justify-center text-white font-semibold shadow-md border-2 border-white ${className}`}
      style={{ 
        width: `${size}px`,
        height: `${size}px`,
        fontSize: fontSize
      }}
      title={name || email || "Utilisateur"}
      aria-label={name || email || "Avatar utilisateur"}
    >
      {initials}
    </div>
  );
};

export default Avatar;


