# Cartographie des Composants - MenuHub

## 🎯 **Classification des composants**

### **🎨 Composants UI (Réutilisables)**

#### **Composants de base**
| Composant | Fichier | Dépendances | Rôle | Impact visuel |
|-----------|---------|-------------|------|---------------|
| **BackButton** | `components/ui/BackButton.js` | React Router | Navigation retour | ⭐⭐ |
| **Loader** | `components/ui/Loader.js` | CSS/Styled | Indicateur de chargement | ⭐⭐⭐ |
| **OperationButton** | `components/ui/OperationButton.js` | Styled Components | Bouton d'action | ⭐⭐⭐ |

#### **Caractéristiques des composants UI**
- ✅ **Réutilisables** dans toute l'application
- ✅ **Faible couplage** avec la logique métier
- ✅ **Props génériques** (onClick, variant, size, etc.)
- ✅ **Styling isolé** (Styled Components ou CSS)
- ✅ **Faciles à tester** et maintenir

### **🏢 Composants Business (Logique métier)**

#### **Gestion du menu**
| Composant | Fichier | Dépendances | Rôle | Complexité |
|-----------|---------|-------------|------|------------|
| **MenuItem** | `components/business/MenuItem.js` | Styled, React Icons | Affichage article menu | ⭐⭐⭐ |
| **MenuList** | `components/business/MenuList.js` | MenuItem, API | Liste des articles | ⭐⭐⭐⭐ |
| **RestaurantNavbar** | `components/business/RestaurantNavbar.js` | Styled, Auth | Navigation restaurant | ⭐⭐⭐ |

#### **Gestion des commandes**
| Composant | Fichier | Dépendances | Rôle | Complexité |
|-----------|---------|-------------|------|------------|
| **Order** | `components/business/Order.js` | API, Styled | Affichage commande | ⭐⭐⭐⭐ |
| **ShoppingCart** | `components/business/ShoppingCart.js` | LocalStorage, API | Panier d'achat | ⭐⭐⭐⭐⭐ |
| **TablesManager** | `components/business/TablesManager.js` | API, Styled | Gestion des tables | ⭐⭐⭐⭐ |

#### **Gestion des QR Codes**
| Composant | Fichier | Dépendances | Rôle | Complexité |
|-----------|---------|-------------|------|------------|
| **QRCode** | `components/business/QRCode.js` | QRCode React | Génération QR | ⭐⭐⭐ |
| **QRCodeModal** | `components/business/QRCodeModal.js` | QRCode, Modal | Modal QR Code | ⭐⭐⭐ |
| **QRCodesList** | `components/business/QRCodesList.js` | QRCode, API | Liste QR Codes | ⭐⭐⭐⭐ |

### **📄 Pages (Conteneurs)**

#### **Pages publiques**
| Page | Fichier | Dépendances | Rôle | Complexité |
|------|---------|-------------|------|------------|
| **Home** | `pages/Home.js` | MainLayout, Bootstrap | Page d'accueil | ⭐⭐ |
| **Login** | `pages/Login.js` | Auth, Forms | Connexion | ⭐⭐⭐ |
| **Register** | `pages/Register.js` | Auth, Forms | Inscription | ⭐⭐⭐ |
| **About** | `pages/About.js` | MainLayout | À propos | ⭐ |
| **Contact** | `pages/Contact.js` | MainLayout | Contact | ⭐ |
| **Help** | `pages/Help.js` | MainLayout | Aide | ⭐ |

#### **Pages privées (Restaurant)**
| Page | Fichier | Dépendances | Rôle | Complexité |
|------|---------|-------------|------|------------|
| **Places** | `pages/Places.js` | Auth, API, Forms | Liste restaurants | ⭐⭐⭐⭐ |
| **Place** | `pages/Place.js` | Auth, API, Business Components | Détail restaurant | ⭐⭐⭐⭐⭐ |
| **Menu** | `pages/Menu.js` | Auth, API, Business Components | Menu client | ⭐⭐⭐⭐ |
| **MenuSettings** | `pages/MenuSettings.js` | Auth, API, Forms | Configuration menu | ⭐⭐⭐⭐⭐ |
| **Orders** | `pages/Orders.js` | Auth, API, Business Components | Gestion commandes | ⭐⭐⭐⭐⭐ |
| **QRCodes** | `pages/QRCodes.js` | Auth, API, Business Components | QR Codes | ⭐⭐⭐⭐ |
| **QRCodesList** | `pages/QRCodesList.js` | Auth, API, Business Components | Liste QR Codes | ⭐⭐⭐⭐ |
| **QRCodesPage** | `pages/QRCodesPage.js` | Auth, API, Business Components | Page QR Codes | ⭐⭐⭐⭐ |

### **📝 Formulaires**

| Formulaire | Fichier | Dépendances | Rôle | Complexité |
|------------|---------|-------------|------|------------|
| **PlaceForm** | `forms/PlaceForm.js` | Formik, Yup, API | Création/édition restaurant | ⭐⭐⭐⭐ |
| **MenuItemForm** | `forms/MenuItemForm.js` | Formik, Yup, API | Création/édition article | ⭐⭐⭐⭐ |
| **PaymentForm** | `forms/PaymentForm.js` | Stripe, API | Paiement | ⭐⭐⭐⭐⭐ |
| **ImageDropzone** | `forms/ImageDropzone.js` | React Dropzone, Cloudinary | Upload images | ⭐⭐⭐ |

## 🔗 **Dépendances fonctionnelles**

### **Composants à forte dépendance fonctionnelle**

#### **🔴 Dépendance critique (API + Auth + State)**
1. **ShoppingCart** - Dépend de :
   - API (commandes, paiements)
   - LocalStorage (panier local)
   - Auth (utilisateur connecté)
   - State management (quantités, prix)

2. **Orders** - Dépend de :
   - API (récupération, mise à jour commandes)
   - Auth (restaurant propriétaire)
   - Real-time updates (statuts)

3. **MenuSettings** - Dépend de :
   - API (CRUD menu, catégories)
   - Auth (permissions)
   - Forms (validation)
   - File upload (images)

#### **🟡 Dépendance élevée (API + Auth)**
4. **Place** - Dépend de :
   - API (données restaurant)
   - Auth (propriétaire)
   - Business components

5. **MenuList** - Dépend de :
   - API (articles menu)
   - State (filtres, tri)
   - MenuItem components

6. **TablesManager** - Dépend de :
   - API (CRUD tables)
   - Auth (permissions)
   - State (liste tables)

#### **🟢 Dépendance modérée (API ou Auth)**
7. **RestaurantNavbar** - Dépend de :
   - Auth (utilisateur)
   - Navigation (routing)

8. **QRCodesList** - Dépend de :
   - API (liste QR codes)
   - QRCode components

9. **MenuItem** - Dépend de :
   - Props (données article)
   - Callbacks (actions)

### **Composants faiblement couplés**

#### **✅ Composants UI purs**
- **BackButton** - Seulement React Router
- **Loader** - Seulement styling
- **OperationButton** - Seulement props et callbacks

#### **✅ Pages statiques**
- **Home** - Seulement layout et contenu
- **About** - Seulement contenu
- **Contact** - Seulement contenu
- **Help** - Seulement contenu

## 📊 **Matrice de complexité**

### **Complexité technique**
```
Très élevée (⭐⭐⭐⭐⭐): ShoppingCart, Orders, MenuSettings, PaymentForm
Élevée (⭐⭐⭐⭐): Place, MenuList, TablesManager, QRCodesList
Modérée (⭐⭐⭐): MenuItem, QRCode, RestaurantNavbar, ImageDropzone
Faible (⭐⭐): Home, Login, Register, BackButton
Très faible (⭐): About, Contact, Help, Loader
```

### **Dépendances externes**
```
Critiques: API + Auth + State + Forms + File Upload
Élevées: API + Auth + State
Modérées: API ou Auth
Faibles: Props + Callbacks
Minimales: Styling uniquement
```

## 🎯 **Recommandations pour l'intégration Stitch**

### **Priorité 1 - Composants UI**
- Migrer en premier (faible risque)
- Tester avec le nouveau design system
- Valider la cohérence visuelle

### **Priorité 2 - Composants Business simples**
- MenuItem, QRCode, RestaurantNavbar
- Adapter le styling sans casser la logique
- Tester les interactions

### **Priorité 3 - Formulaires**
- Adapter l'UI des formulaires
- Maintenir la validation et la logique
- Tester l'UX

### **Priorité 4 - Composants complexes**
- ShoppingCart, Orders, MenuSettings
- Migration progressive
- Tests approfondis requis

### **Priorité 5 - Pages**
- Adapter le layout et la navigation
- Intégrer les composants mis à jour
- Tests end-to-end
