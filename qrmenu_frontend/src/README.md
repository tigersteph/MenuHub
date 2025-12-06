# Structure du Projet React - MenuHub

## 📁 Organisation des dossiers

### `/assets/`
- **`images/`** - Images statiques (logos, héros, etc.)
- **`icons/`** - Icônes personnalisées
- **`fonts/`** - Polices personnalisées

### `/components/`
- **`ui/`** - Composants UI réutilisables (Button, Modal, Input, etc.)
- **`business/`** - Composants métier spécifiques (MenuItem, Order, etc.)

### `/pages/`
- Pages principales de l'application (Home, Login, Menu, etc.)

### `/layouts/`
- Layouts de l'application (MainLayout, AuthLayout, etc.)

### `/forms/`
- Formulaires réutilisables (PlaceForm, MenuItemForm, etc.)

### `/hooks/`
- Hooks personnalisés React :
  - `useAuth` - Gestion de l'authentification
  - `useApi` - Gestion des appels API
  - `useLocalStorage` - Gestion du localStorage
  - `useMenu` - Gestion du menu
  - `useOrders` - Gestion des commandes
  - `usePlaces` - Gestion des restaurants

### `/services/`
- **`api/`** - Services API organisés par domaine :
  - `auth.js` - Authentification
  - `places.js` - Gestion des restaurants
  - `menu.js` - Gestion du menu
  - `orders.js` - Gestion des commandes
  - `tables.js` - Gestion des tables
- `cloudinary.js` - Upload d'images

### `/utils/`
- Utilitaires de l'application :
  - `constants.js` - Constantes de l'application
  - `helpers.js` - Fonctions utilitaires
  - `validators.js` - Validateurs de formulaires
  - `formatters.js` - Formateurs de données
  - `storage.js` - Gestion du stockage
  - `PrivateRoute.js` - Route privée

### `/styles/`
- `globals.css` - Styles globaux
- `theme.css` - Thème de l'application

### `/config/`
- `api.js` - Configuration API
- `i18n.js` - Configuration internationalisation

### `/contexts/`
- Contextes React (AuthContext, etc.)

### `/locales/`
- Fichiers de traduction (fr, en)

## 🎯 Bonnes pratiques

### Imports
```javascript
// ✅ Bon - Import depuis les index
import { useAuth, useApi } from '../hooks';
import { formatPrice, validateEmail } from '../utils';
import { Button, Modal } from '../components/ui';

// ❌ Éviter - Import direct
import { useAuth } from '../hooks/useAuth';
```

### Hooks personnalisés
```javascript
// ✅ Utilisation des hooks
const { user, signIn, signOut } = useAuth();
const { loading, makeRequest } = useApi();
const { places, addPlace } = usePlaces();
```

### Services API
```javascript
// ✅ Utilisation des services
import { signIn, fetchPlaces } from '../services';

const handleLogin = async (email, password) => {
  const result = await signIn(email, password);
  // ...
};
```

### Utilitaires
```javascript
// ✅ Utilisation des utilitaires
import { formatPrice, validateEmail, ORDER_STATUS } from '../utils';

const price = formatPrice(15.99); // "15,99 €"
const isValid = validateEmail('user@example.com');
```

## 🚀 Prochaines étapes

1. **Intégration des designs Stitch** - Adapter l'UI avec les nouveaux designs
2. **Optimisation des performances** - Lazy loading, memoization
3. **Tests** - Tests unitaires et d'intégration
4. **Documentation** - Documentation des composants
5. **Accessibilité** - Amélioration de l'accessibilité
