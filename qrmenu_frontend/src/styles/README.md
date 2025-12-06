# Système de Thème MenuHub

## 🎨 Vue d'ensemble

Le système de thème MenuHub est conçu pour être flexible, cohérent et facilement adaptable aux designs générés par Stitch. Il supporte plusieurs méthodes de stylisation :

- **CSS Variables** - Pour les styles globaux
- **Styled Components** - Pour les composants React
- **Material-UI** - Pour les composants MUI
- **Classes utilitaires** - Pour le styling rapide

## 📁 Structure des fichiers

```
src/styles/
├── theme.js          # Thème JavaScript (Styled Components, MUI)
├── theme.css         # Thème CSS (Variables CSS, classes utilitaires)
├── globals.css       # Styles globaux
└── index.js          # Point d'entrée
```

## 🎯 Utilisation

### Avec Styled Components

```javascript
import styled from 'styled-components';
import { theme } from '../styles/theme';

const StyledButton = styled.button`
  background-color: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  font-size: ${props => props.theme.typography.fontSize.base};
  transition: ${props => props.theme.transitions.normal};
  
  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
    box-shadow: ${props => props.theme.shadows.hover};
  }
`;
```

### Avec CSS Variables

```css
.my-button {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-base);
  transition: var(--transition-normal);
}

.my-button:hover {
  background-color: var(--color-primary-dark);
  box-shadow: var(--shadow-hover);
}
```

### Avec le Hook useTheme

```javascript
import { useTheme } from '../hooks/useTheme';

const MyComponent = () => {
  const { theme, toggleTheme, getThemeColor } = useTheme();
  
  return (
    <div style={{ 
      backgroundColor: getThemeColor('primary.main'),
      color: getThemeColor('primary.contrastText')
    }}>
      <button onClick={toggleTheme}>
        Basculer le thème
      </button>
    </div>
  );
};
```

### Avec les Classes Utilitaires

```jsx
<div className="bg-primary text-white rounded-lg shadow-card p-xl">
  <h1 className="text-2xl font-bold">Titre</h1>
  <p className="text-secondary">Description</p>
</div>
```

## 🎨 Palette de couleurs

### Couleurs principales
- **Primary** : `#FF5A1F` (Orange vibrant)
- **Secondary** : `#5F4B8B` (Violet indigo)

### Couleurs d'accent
- **Success** : `#00C48C` (Vert menthe)
- **Warning** : `#FFD600` (Jaune accent)
- **Error** : `#FF3B30` (Rouge moderne)
- **Info** : `#2196F3` (Bleu info)

### Couleurs spéciales
- **Gold** : `#C1A36A` (Or raffiné)
- **Cream** : `#F8F7F2` (Blanc crème)
- **Pearl** : `#EAEAEA` (Gris perle)

## 📏 Système d'espacement

```javascript
// Tailles disponibles
xs: 4px    sm: 8px     md: 12px    lg: 16px
xl: 20px   2xl: 24px   3xl: 32px   4xl: 40px
5xl: 48px  6xl: 64px   7xl: 80px   8xl: 96px
```

## 🔤 Typographie

### Polices
- **Main** : `'Inter', 'Segoe UI', Arial, sans-serif`
- **Mono** : `'Fira Code', 'Monaco', 'Consolas', monospace`

### Tailles
```javascript
xs: 12px   sm: 14px   base: 16px   lg: 18px
xl: 20px   2xl: 24px  3xl: 28px   4xl: 32px
5xl: 36px  6xl: 48px
```

## 📱 Breakpoints

```javascript
xs: 0px     sm: 576px   md: 768px
lg: 992px   xl: 1200px  2xl: 1400px
```

## 🌙 Thèmes

### Thème clair (par défaut)
- Fond principal : `#F7F8FA`
- Texte principal : `#222222`
- Surface : `#FFFFFF`

### Thème sombre
- Fond principal : `#181A20`
- Texte principal : `#F7F8FA`
- Surface : `#1F2937`

## 🔧 Intégration avec Stitch

Pour adapter les designs Stitch :

1. **Extraire les couleurs** des designs
2. **Mettre à jour** les variables dans `theme.js` et `theme.css`
3. **Tester** la cohérence visuelle
4. **Ajuster** les espacements et typographies si nécessaire

### Exemple d'adaptation

```javascript
// Dans theme.js
export const stitchTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: {
      main: '#NOUVELLE_COULEUR_STITCH',
      light: '#NOUVELLE_COULEUR_LIGHT',
      dark: '#NOUVELLE_COULEUR_DARK'
    }
  }
};
```

## 📚 Ressources

- [Documentation Styled Components](https://styled-components.com/docs)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Material-UI Theming](https://mui.com/customization/theming/)
