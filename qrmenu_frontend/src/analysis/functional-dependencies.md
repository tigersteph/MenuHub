# Analyse des Dépendances Fonctionnelles - MenuHub

## 🔴 **Composants à forte dépendance fonctionnelle**

### **1. ShoppingCart - Complexité maximale**
```javascript
// Dépendances identifiées
- React Bootstrap (Card, Button)
- OperationButton (composant interne)
- PaymentForm (formulaire de paiement)
- useMemo (calculs de prix)
- Props: items, onAdd, onRemove, onPaymentDone, color
```

**Dépendances critiques :**
- ✅ **State management** : Gestion du panier local
- ✅ **Calculs** : Prix total, quantités
- ✅ **API** : Intégration paiement via PaymentForm
- ✅ **UI** : Affichage dynamique des articles
- ✅ **Callbacks** : Actions utilisateur (ajout/suppression)

**Risques d'intégration Stitch :**
- 🔴 **Élevé** : Logique de calcul des prix
- 🔴 **Élevé** : Intégration avec PaymentForm
- 🟡 **Moyen** : Styling des cartes et boutons

### **2. Orders - Gestion des commandes**
```javascript
// Dépendances identifiées
- React Router (useParams, useHistory)
- React Icons (IoMdArrowBack)
- React Bootstrap (Button)
- React i18next (useTranslation)
- Services API (fetchOrders, completeOrder)
- AuthContext (authentification)
- MainLayout (layout)
- Order component (composant business)
```

**Dépendances critiques :**
- ✅ **API** : Récupération et mise à jour des commandes
- ✅ **Auth** : Vérification des permissions
- ✅ **Routing** : Navigation entre pages
- ✅ **State** : Gestion de la liste des commandes
- ✅ **Real-time** : Mise à jour des statuts

**Risques d'intégration Stitch :**
- 🔴 **Élevé** : Logique de gestion des commandes
- 🟡 **Moyen** : Affichage des commandes
- 🟢 **Faible** : Navigation et layout

### **3. PaymentForm - Intégration Stripe**
```javascript
// Dépendances identifiées
- Stripe (loadStripe, Elements, useStripe, useElements)
- React Bootstrap (Form, Button)
- React Toastify (toast)
- React Router (useParams)
- Services API (createPaymentIntent)
- AuthContext (authentification)
```

**Dépendances critiques :**
- ✅ **Stripe** : Intégration paiement sécurisé
- ✅ **API** : Création des intentions de paiement
- ✅ **Auth** : Authentification utilisateur
- ✅ **State** : Gestion des états de paiement
- ✅ **Error handling** : Gestion des erreurs

**Risques d'intégration Stitch :**
- 🔴 **Très élevé** : Logique de paiement Stripe
- 🔴 **Élevé** : Gestion des erreurs et états
- 🟡 **Moyen** : Styling du formulaire

### **4. MenuSettings - Configuration du menu**
```javascript
// Dépendances identifiées (analyse basée sur la structure)
- Forms (MenuItemForm, PlaceForm)
- API (CRUD menu, catégories, articles)
- Auth (permissions restaurant)
- File upload (images)
- Validation (Formik, Yup)
```

**Dépendances critiques :**
- ✅ **API** : CRUD complet du menu
- ✅ **Auth** : Permissions propriétaire
- ✅ **File upload** : Images des articles
- ✅ **Validation** : Schémas de validation
- ✅ **State** : Gestion des formulaires

**Risques d'intégration Stitch :**
- 🔴 **Très élevé** : Logique de gestion du menu
- 🔴 **Élevé** : Upload et gestion des images
- 🟡 **Moyen** : Interface des formulaires

## 🟡 **Composants à dépendance élevée**

### **5. Place - Détail restaurant**
```javascript
// Dépendances identifiées
- AuthContext (authentification)
- Services API (fetchPlace, etc.)
- Business components (RestaurantNavbar, MenuList, etc.)
- Routing (navigation)
```

**Dépendances critiques :**
- ✅ **API** : Données du restaurant
- ✅ **Auth** : Vérification propriétaire
- ✅ **Business components** : Affichage des données
- ✅ **State** : Gestion des données

### **6. MenuList - Liste des articles**
```javascript
// Dépendances identifiées
- MenuItem components
- API (récupération articles)
- State (filtres, tri)
- Props (données menu)
```

**Dépendances critiques :**
- ✅ **API** : Récupération des articles
- ✅ **State** : Filtres et tri
- ✅ **Props** : Données du menu
- ✅ **Child components** : MenuItem

### **7. TablesManager - Gestion des tables**
```javascript
// Dépendances identifiées
- API (CRUD tables)
- Auth (permissions)
- State (liste des tables)
- UI components
```

**Dépendances critiques :**
- ✅ **API** : CRUD des tables
- ✅ **Auth** : Permissions
- ✅ **State** : Liste des tables

## 🟢 **Composants à dépendance modérée**

### **8. RestaurantNavbar - Navigation restaurant**
```javascript
// Dépendances identifiées
- AuthContext (utilisateur)
- React Router (navigation)
- Styled Components (styling)
- React Icons (icônes)
```

**Dépendances critiques :**
- ✅ **Auth** : Données utilisateur
- ✅ **Routing** : Navigation
- ✅ **Styling** : Styled Components

### **9. QRCodesList - Liste des QR codes**
```javascript
// Dépendances identifiées
- API (liste QR codes)
- QRCode components
- State (liste des codes)
```

**Dépendances critiques :**
- ✅ **API** : Récupération des QR codes
- ✅ **State** : Liste des codes
- ✅ **Child components** : QRCode

### **10. MenuItem - Article du menu**
```javascript
// Dépendances identifiées
- Styled Components (styling)
- React Icons (icônes)
- Props (données article)
- Callbacks (actions)
```

**Dépendances critiques :**
- ✅ **Props** : Données de l'article
- ✅ **Callbacks** : Actions utilisateur
- ✅ **Styling** : Styled Components

## 📊 **Matrice de risque d'intégration**

### **Risque très élevé (🔴)**
1. **PaymentForm** - Intégration Stripe critique
2. **MenuSettings** - Logique complexe de gestion
3. **ShoppingCart** - Calculs et intégration paiement

### **Risque élevé (🟡)**
4. **Orders** - Gestion des commandes
5. **Place** - Orchestration de composants
6. **MenuList** - Logique d'affichage

### **Risque modéré (🟢)**
7. **RestaurantNavbar** - Navigation et auth
8. **QRCodesList** - Liste simple
9. **MenuItem** - Affichage d'article

### **Risque faible (✅)**
10. **Composants UI** - BackButton, Loader, OperationButton

## 🎯 **Stratégie d'intégration recommandée**

### **Phase 1 - Composants UI (Risque faible)**
- BackButton, Loader, OperationButton
- Test de cohérence visuelle
- Validation du design system

### **Phase 2 - Composants Business simples (Risque modéré)**
- MenuItem, QRCode, RestaurantNavbar
- Adaptation du styling
- Tests d'interaction

### **Phase 3 - Composants complexes (Risque élevé)**
- Orders, Place, MenuList
- Migration progressive
- Tests approfondis

### **Phase 4 - Composants critiques (Risque très élevé)**
- PaymentForm, MenuSettings, ShoppingCart
- Migration avec tests complets
- Validation fonctionnelle

## 🔧 **Outils de test recommandés**

### **Tests unitaires**
- Jest + React Testing Library
- Tests des hooks personnalisés
- Tests des utilitaires

### **Tests d'intégration**
- Tests des composants avec API
- Tests des formulaires
- Tests de navigation

### **Tests end-to-end**
- Cypress ou Playwright
- Tests des flux complets
- Tests de paiement (mode test)

## 📋 **Checklist d'intégration**

### **Avant migration**
- [ ] Tests unitaires passants
- [ ] Documentation des dépendances
- [ ] Backup du code existant
- [ ] Plan de rollback

### **Pendant migration**
- [ ] Tests après chaque modification
- [ ] Validation visuelle
- [ ] Tests fonctionnels
- [ ] Documentation des changements

### **Après migration**
- [ ] Tests end-to-end
- [ ] Validation utilisateur
- [ ] Performance check
- [ ] Documentation finale
