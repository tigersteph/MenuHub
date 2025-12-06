# Diagramme de Dépendances - MenuHub

## 🏗️ **Architecture des dépendances**

```
┌─────────────────────────────────────────────────────────────────┐
│                        EXTERNAL DEPENDENCIES                   │
├─────────────────────────────────────────────────────────────────┤
│  React Router  │  Bootstrap  │  Material-UI  │  Styled Components │
│  Stripe        │  Axios      │  React Icons  │  Lucide React      │
│  Formik        │  Yup        │  React Toast  │  QRCode React      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CORE SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│  AuthContext   │  ThemeContext │  API Services │  Storage Utils  │
│  Hooks         │  Utils        │  Validators   │  Formatters     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        UI COMPONENTS                           │
├─────────────────────────────────────────────────────────────────┤
│  BackButton    │  Loader       │  OperationButton               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS COMPONENTS                       │
├─────────────────────────────────────────────────────────────────┤
│  MenuItem      │  MenuList     │  Order        │  QRCode         │
│  ShoppingCart  │  RestaurantNav│  TablesManager│  QRCodesList    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          FORMS                                 │
├─────────────────────────────────────────────────────────────────┤
│  PlaceForm     │  MenuItemForm │  PaymentForm  │  ImageDropzone  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          PAGES                                 │
├─────────────────────────────────────────────────────────────────┤
│  Home          │  Login        │  Register     │  Places         │
│  Place         │  Menu         │  Orders       │  MenuSettings   │
│  QRCodes       │  About        │  Contact      │  Help           │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 **Dépendances détaillées par composant**

### **Composants UI (Faible couplage)**
```
BackButton
├── React Router (useHistory)
└── Props (onClick, variant)

Loader
├── CSS/Styled Components
└── Props (size, color)

OperationButton
├── Styled Components
├── React Icons
└── Props (onClick, variant, icon)
```

### **Composants Business (Couplage moyen à élevé)**
```
MenuItem
├── Styled Components
├── React Icons
├── Props (item, onEdit, onRemove, onOrder)
└── Callbacks (actions utilisateur)

MenuList
├── MenuItem (composant enfant)
├── API (fetchMenuItems)
├── State (filtres, tri)
└── Props (placeId, categories)

ShoppingCart
├── React Bootstrap (Card, Button)
├── OperationButton
├── PaymentForm
├── useMemo (calculs prix)
├── State (items, total)
└── Callbacks (onAdd, onRemove, onPaymentDone)

Order
├── Styled Components
├── React Icons
├── API (updateOrderStatus)
├── Auth (permissions)
└── Props (order, onComplete)

RestaurantNavbar
├── Styled Components
├── React Icons
├── AuthContext
├── React Router
└── Props (place, onRemovePlace)

QRCode
├── QRCode React
├── Styled Components
└── Props (value, size, color)

QRCodesList
├── QRCode (composant enfant)
├── API (fetchQRCodes)
├── State (qrCodes)
└── Props (placeId)

TablesManager
├── Styled Components
├── API (CRUD tables)
├── Auth (permissions)
└── State (tables)
```

### **Formulaires (Couplage élevé)**
```
PlaceForm
├── Formik (gestion formulaire)
├── Yup (validation)
├── API (createPlace, updatePlace)
├── Auth (permissions)
├── ImageDropzone
└── Props (place, onSubmit)

MenuItemForm
├── Formik (gestion formulaire)
├── Yup (validation)
├── API (createMenuItem, updateMenuItem)
├── Auth (permissions)
├── ImageDropzone
└── Props (item, onSubmit)

PaymentForm
├── Stripe (Elements, useStripe)
├── React Bootstrap (Form, Button)
├── React Toastify (notifications)
├── API (createPaymentIntent)
├── Auth (authentification)
└── Props (amount, items, onDone)

ImageDropzone
├── React Dropzone
├── Cloudinary API
├── State (upload progress)
└── Props (onUpload, accept)
```

### **Pages (Couplage très élevé)**
```
Home
├── MainLayout
├── React Bootstrap
├── Lucide React (icônes)
└── Props (hasPlace)

Login/Register
├── MainLayout
├── Formik (gestion formulaire)
├── Yup (validation)
├── AuthContext
├── API (signIn, register)
└── React Router

Places
├── MainLayout
├── AuthContext
├── API (fetchPlaces)
├── PlaceForm
├── Styled Components
└── State (places, modal)

Place
├── MainLayout
├── RestaurantNavbar
├── MenuList
├── QRCodesList
├── TablesManager
├── AuthContext
├── API (fetchPlace)
└── State (place, loading)

Menu
├── MainLayout
├── MenuList
├── ShoppingCart
├── Auth (optionnel)
├── API (fetchMenu)
└── State (menu, cart)

Orders
├── MainLayout
├── AuthContext
├── API (fetchOrders, completeOrder)
├── Order (composant)
├── React Icons
└── State (orders, loading)

MenuSettings
├── MainLayout
├── AuthContext
├── API (CRUD menu)
├── MenuItemForm
├── ImageDropzone
├── Formik/Yup
└── State (menu, categories, items)

QRCodes/QRCodesList/QRCodesPage
├── MainLayout
├── AuthContext
├── API (fetchQRCodes)
├── QRCode (composant)
├── React Icons
└── State (qrCodes, loading)
```

## 🎯 **Flux de données principaux**

### **Flux d'authentification**
```
Login/Register → AuthContext → API → Token Storage → Protected Routes
```

### **Flux de gestion des restaurants**
```
Places → PlaceForm → API → Places List → Place Detail → RestaurantNavbar
```

### **Flux de gestion du menu**
```
MenuSettings → MenuItemForm → API → MenuList → Menu (client) → ShoppingCart
```

### **Flux de commandes**
```
Menu → ShoppingCart → PaymentForm → Stripe → API → Orders → Order Status
```

### **Flux de QR Codes**
```
QRCodes → QRCode Generation → QRCodesList → QRCode Display
```

## 🔄 **Dépendances circulaires identifiées**

### **Dépendances circulaires détectées**
```
ShoppingCart ↔ PaymentForm
├── ShoppingCart utilise PaymentForm
└── PaymentForm peut affecter ShoppingCart

MenuList ↔ MenuItem
├── MenuList contient MenuItem
└── MenuItem peut déclencher des actions sur MenuList

Place ↔ RestaurantNavbar
├── Place utilise RestaurantNavbar
└── RestaurantNavbar peut naviguer vers Place
```

### **Solutions recommandées**
1. **Props drilling** pour les callbacks
2. **Context API** pour les données partagées
3. **Custom hooks** pour la logique métier
4. **Event emitters** pour les communications

## 📊 **Métriques de complexité**

### **Complexité cyclomatique**
```
Très élevée (15+): ShoppingCart, PaymentForm, MenuSettings
Élevée (10-14): Orders, Place, MenuList, TablesManager
Modérée (5-9): MenuItem, RestaurantNavbar, QRCodesList
Faible (1-4): BackButton, Loader, OperationButton
```

### **Nombre de dépendances**
```
Critiques (10+): Pages principales, Formulaires complexes
Élevées (5-9): Composants business, Formulaires simples
Modérées (2-4): Composants UI, Composants simples
Faibles (0-1): Composants purs
```

## 🎯 **Recommandations pour l'intégration Stitch**

### **Ordre de migration recommandé**
1. **Composants UI** (BackButton, Loader, OperationButton)
2. **Composants Business simples** (MenuItem, QRCode)
3. **Composants Business complexes** (MenuList, RestaurantNavbar)
4. **Formulaires** (PlaceForm, MenuItemForm, ImageDropzone)
5. **Composants critiques** (ShoppingCart, PaymentForm)
6. **Pages** (Home, Login, Register, puis pages complexes)

### **Stratégie de test**
1. **Tests unitaires** pour chaque composant
2. **Tests d'intégration** pour les flux de données
3. **Tests visuels** pour la cohérence du design
4. **Tests end-to-end** pour les fonctionnalités critiques

### **Points d'attention**
- **Maintenir la logique métier** intacte
- **Préserver les intégrations API** existantes
- **Tester les flux de paiement** en mode test
- **Valider la responsivité** sur tous les appareils
- **Vérifier l'accessibilité** des nouveaux composants
