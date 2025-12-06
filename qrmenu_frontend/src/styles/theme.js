// Système de thème centralisé pour MenuHub
// Compatible avec Styled Components, CSS Variables et Material-UI

export const theme = {
  // === COULEURS ===
  colors: {
    // Couleurs principales
    primary: {
      main: '#FF5A1F',
      light: '#FF7A3F',
      dark: '#E54A0F',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#5F4B8B',
      light: '#7F6BA8',
      dark: '#3F2B6B',
      contrastText: '#FFFFFF'
    },
    
    // Couleurs d'accent
    accent: {
      green: '#00C48C',
      yellow: '#FFD600',
      blue: '#2196F3',
      purple: '#9C27B0'
    },
    
    // Couleurs de statut
    status: {
      success: '#00C48C',
      warning: '#FFD600',
      error: '#FF3B30',
      info: '#2196F3'
    },
    
    // Couleurs de fond
    background: {
      default: '#F7F8FA',
      paper: '#FFFFFF',
      dark: '#181A20',
      light: '#F7F8FA'
    },
    
    // Couleurs de texte
    text: {
      primary: '#222222',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
      light: '#F7F8FA',
      inverse: '#FFFFFF'
    },
    
    // Couleurs de bordure
    border: {
      light: '#E5E7EB',
      medium: '#D1D5DB',
      dark: '#9CA3AF'
    },
    
    // Couleurs spéciales
    special: {
      gold: '#C1A36A',
      cream: '#F8F7F2',
      pearl: '#EAEAEA'
    }
  },

  // === TYPOGRAPHIE ===
  typography: {
    fontFamily: {
      main: "'Inter', 'Segoe UI', Arial, sans-serif",
      heading: "'Inter', 'Segoe UI', Arial, sans-serif",
      body: "'Inter', 'Segoe UI', Arial, sans-serif",
      mono: "'Fira Code', 'Monaco', 'Consolas', monospace"
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '32px',
      '5xl': '36px',
      '6xl': '48px'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em'
    }
  },

  // === ESPACEMENTS ===
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
    '6xl': '64px',
    '7xl': '80px',
    '8xl': '96px'
  },

  // === BORDER RADIUS ===
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '18px',
    '4xl': '24px',
    full: '9999px'
  },

  // === OMBRES ===
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    card: '0 2px 16px rgba(0, 0, 0, 0.07)',
    hover: '0 8px 32px rgba(255, 90, 31, 0.2)'
  },

  // === BREAKPOINTS ===
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    '2xl': '1400px'
  },

  // === TRANSITIONS ===
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.2s ease-in-out',
    slow: '0.3s ease-in-out',
    spring: '0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // === Z-INDEX ===
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080
  },

  // === COMPOSANTS SPÉCIFIQUES ===
  components: {
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px'
      },
      padding: {
        sm: '8px 16px',
        md: '12px 24px',
        lg: '16px 32px'
      }
    },
    input: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px'
      },
      padding: {
        sm: '8px 12px',
        md: '12px 16px',
        lg: '16px 20px'
      }
    },
    card: {
      padding: {
        sm: '16px',
        md: '20px',
        lg: '24px'
      }
    }
  }
};

// === THÈMES ALTERNATIFS ===
export const lightTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: {
      ...theme.colors.background,
      default: '#FFFFFF',
      paper: '#F7F8FA'
    },
    text: {
      ...theme.colors.text,
      primary: '#222222',
      secondary: '#6B7280'
    }
  }
};

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: {
      ...theme.colors.background,
      default: '#181A20',
      paper: '#1F2937'
    },
    text: {
      ...theme.colors.text,
      primary: '#F7F8FA',
      secondary: '#9CA3AF'
    }
  }
};

// === UTILITAIRES ===
export const getColor = (colorPath) => {
  const keys = colorPath.split('.');
  let value = theme.colors;
  
  for (const key of keys) {
    value = value[key];
    if (!value) return null;
  }
  
  return value;
};

export const getSpacing = (size) => theme.spacing[size] || size;

export const getBreakpoint = (size) => theme.breakpoints[size] || size;

export const getShadow = (size) => theme.shadows[size] || size;

export const getBorderRadius = (size) => theme.borderRadius[size] || size;

// === EXPORT PAR DÉFAUT ===
export default theme;
