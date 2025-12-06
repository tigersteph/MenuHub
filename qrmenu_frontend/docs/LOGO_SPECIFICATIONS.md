# Spécifications techniques du logo MenuHub

Ce document détaille les caractéristiques nécessaires pour optimiser l'image du logo MenuHub pour un usage web dans l'application.

## 📋 Résumé des emplacements identifiés

Le logo devra remplacer le texte "MenuHub" aux emplacements suivants :

1. **Page d'accueil** (`Home.js`) - Header navigation
2. **Page Login** (`Login.js`) - Titre principal
3. **Page Register** (`Register.js`) - Titre principal  
4. **Page Places** (`Places.js`) - Titre principal
5. **Layout principal** (`MainLayout.js`) - Header navigation
6. **Page Menu** (`Menu.js`) - Header (avec fallback sur place.name)
7. **Page Orders** (`Orders.js`) - Header (si applicable)
8. **Autres pages** - Headers et titres

---

## 🎨 Caractéristiques techniques recommandées

### **1. Format de fichier**

#### Option A : SVG (RECOMMANDÉ ⭐)
- **Avantages** : 
  - Vectoriel (pas de perte de qualité à toutes les tailles)
  - Taille de fichier minimale
  - Facilement modifiable pour dark mode
  - Support natif du web
  - Meilleur pour l'accessibilité

#### Option B : PNG avec transparence
- **Résolution minimale** : 4000×4000px (pour Retina/4K)
- **Format** : PNG-24 avec canal alpha (transparence)
- **Alternative** : WebP avec transparence (meilleure compression)

#### Option C : Format hybride
- SVG pour le logo principal
- PNG/WebP en fallback si nécessaire

### **2. Dimensions et proportions**

#### Tailles requises par contexte :

| Contexte | Hauteur recommandée | Largeur | Ratio |
|----------|---------------------|---------|-------|
| **Header Navigation** (Home, MainLayout) | 32-40px | Auto (proportionnel) | Flexible |
| **Titres pages** (Login, Register) | 48-64px | Auto | Flexible |
| **Mobile** | 28-36px | Auto | Flexible |
| **Desktop** | 40-48px | Auto | Flexible |
| **Favicon** | 32×32px | 32×32px | 1:1 |

**Recommandation** : Créer le logo avec un ratio largeur/hauteur flexible (format horizontal)
- **Ratio idéal** : Entre 3:1 et 5:1 (largeur : hauteur)
- Le logo doit être lisible même réduit à 32px de hauteur

### **3. Versions nécessaires**

#### Version Light Mode (fond clair)
- **Couleur** : Noir (#000000 ou #1f1f1f) sur fond transparent
- **Usage** : Pages avec background clair (`#F8F7F2`, `#FFFFFF`)
- **Fichier** : `logo.svg` ou `logo-light.png`

#### Version Dark Mode (fond foncé) - OPTIONNEL
- **Couleur** : Blanc (#FFFFFF) ou gris clair (#E0E0E0) sur fond transparent
- **Usage** : Pages avec background sombre (`#23160f`, `#1f1f1f`)
- **Fichier** : `logo-dark.svg` ou `logo-dark.png`
- **Alternative CSS** : Utiliser `filter: invert(1)` sur la version light

### **4. Optimisation**

#### Taille de fichier cible :
- **SVG** : < 10 KB (idéalement < 5 KB)
- **PNG** : < 50 KB pour version standard, < 150 KB pour version HD
- **WebP** : < 30 KB pour version standard

#### Optimisations à appliquer :
1. **SVG** : 
   - Nettoyer le code (supprimer métadonnées inutiles)
   - Optimiser les paths
   - Utiliser un outil comme SVGO

2. **Raster (PNG/WebP)** :
   - Compression sans perte de qualité visible
   - Supprimer les métadonnées EXIF
   - Créer des versions @2x et @3x pour Retina

### **5. Transparence**

✅ **ESSENTIEL** : Le logo doit avoir un fond transparent
- Permet l'intégration sur n'importe quel background
- S'adapte aux thèmes light/dark
- Plus flexible pour les différents contextes

### **6. Espacement et marges**

- **Padding recommandé** : 10-20% autour du logo
- **Espace libre** : Minimum 8px de chaque côté
- Le logo ne doit pas toucher les bords de son conteneur

### **7. Accessibilité**

- **Alt text** : "MenuHub - Restaurant Management Platform"
- **Contraste** : Ratio minimum 4.5:1 avec le background
- **Taille minimale** : 24×24px (pour accessibilité tactile mobile)

---

## 🛠️ Structure de fichiers recommandée

```
qrmenu_frontend/public/
├── logo/
│   ├── logo.svg                 (Version principale - RECOMMANDÉ)
│   ├── logo-light.svg           (Version light mode si nécessaire)
│   ├── logo-dark.svg            (Version dark mode si nécessaire)
│   ├── logo.png                 (Fallback si SVG non supporté)
│   ├── logo@2x.png              (Version Retina)
│   ├── logo@3x.png              (Version 3x Retina)
│   └── favicon.ico              (32×32px ou 16×16px)
```

---

## 📐 Spécifications techniques détaillées

### **Version SVG idéale :**

```svg
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 400 120" 
  width="400" 
  height="120"
  aria-label="MenuHub Logo"
>
  <!-- Contenu du logo ici -->
</svg>
```

**Attributs recommandés :**
- `viewBox` : Permet le scaling flexible
- `preserveAspectRatio="xMidYMid meet"` : Centre le logo
- `fill="currentColor"` : S'adapte à la couleur du texte (pour dark mode)

### **Version PNG :**

| Résolution | Usage | Dimensions |
|------------|-------|------------|
| Standard | Desktop/Mobile standard | 400×120px (ratio ~3.3:1) |
| Retina | Écrans HD/Retina | 800×240px (@2x) |
| Super Retina | Écrans 3x | 1200×360px (@3x) |
| Favicon | Onglet navigateur | 32×32px (carré) |

---

## 🎯 Checklist avant intégration

- [ ] Logo créé en SVG (format principal)
- [ ] Versions PNG/WebP créées en fallback
- [ ] Fond transparent sur toutes les versions
- [ ] Taille de fichier optimisée (< 10KB pour SVG, < 50KB pour PNG)
- [ ] Logo lisible à 32px de hauteur minimum
- [ ] Testé sur fond clair et foncé
- [ ] Version favicon créée (32×32px)
- [ ] Alt text défini pour accessibilité
- [ ] Test responsive (mobile/desktop)
- [ ] Compatible dark mode (soit via version séparée, soit via CSS)

---

## 💡 Recommandations supplémentaires

### **Pour le design du logo :**
1. **Légèreté visuelle** : Le logo doit être élégant et moderne
2. **Lisibilité** : Reste lisible même à petite taille
3. **Flexibilité** : Fonctionne en couleur et en monochrome
4. **Échelle** : Logo visible de 32px à 200px sans dégradation

### **Pour l'intégration technique :**
1. Utiliser un composant `<Logo />` réutilisable
2. Implémenter le dark mode via CSS ou versions séparées
3. Lazy loading pour optimiser les performances
4. Préchargement du logo pour éviter le flash

---

## 📱 Tailles d'affichage par contexte

```css
/* Header Navigation */
.header-logo {
  height: 40px;        /* Desktop */
  height: 32px;        /* Mobile */
  width: auto;
}

/* Titres de page */
.page-logo {
  height: 64px;        /* Desktop */
  height: 48px;        /* Mobile */
  width: auto;
}

/* Favicon */
.favicon {
  width: 32px;
  height: 32px;
}
```

---

## ✅ Action recommandée

**Format principal à fournir :**
- **1 fichier SVG** avec fond transparent, dimension flexible
- **Optionnel** : Versions PNG/WebP pour fallback

Le SVG sera le plus flexible et performant pour tous les cas d'usage.


