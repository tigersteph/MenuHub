import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UtensilsCrossed, ShoppingCart as ShoppingCartIcon, Search, SlidersHorizontal, X, AlertCircle, ChefHat } from 'lucide-react';
import { toast } from '../utils/toast';
import { fetchPlacePublic } from '../services/api/places';
import { fetchTablePublic } from '../services/api/tables';

import MenuList from '../components/business/MenuList';
import ShoppingCart from '../components/business/ShoppingCart';
import ItemDetail from '../components/business/ItemDetail';
import OrderConfirmation from '../components/business/OrderConfirmation';
import SplashScreen from '../components/business/SplashScreen';

const Menu = () => {
  const { t } = useTranslation();
  const [place, setPlace] = useState({});
  const [shoppingCart, setShoppingCart] = useState({});
  const [tableStatus, setTableStatus] = useState('active');
  const [showShoppingCart, setShowShoppingCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  const params = useParams();

  const onFetchPlace = React.useCallback(async () => {
    try {
      const response = await fetchPlacePublic(params.id);
      // Extraire les données depuis la réponse standardisée { success: true, data: {...} }
      const json = response?.data || response;
      console.log('Données établissement reçues:', json);
      
      if (json) {
        // Normaliser les données : convertir menuItems (camelCase) en menu_items (snake_case)
        // Le backend transforme automatiquement menu_items → menuItems via transformResponse
        // On normalise ici pour assurer la compatibilité avec le reste du code frontend
        const normalizedPlace = {
          ...json,
          categories: json.categories?.map(category => ({
            ...category,
            menu_items: category.menu_items || category.menuItems || []
          })) || []
        };
        
        // Log pour déboguer (en développement uniquement)
        if (process.env.NODE_ENV === 'development') {
          console.log('[Menu] Données normalisées:', {
            categoriesCount: normalizedPlace.categories?.length || 0,
            firstCategoryItems: normalizedPlace.categories?.[0]?.menu_items?.length || 0,
            hasMenuItems: !!normalizedPlace.categories?.[0]?.menuItems,
            hasMenu_items: !!normalizedPlace.categories?.[0]?.menu_items
          });
        }
        
        setPlace(normalizedPlace);
      } else {
        console.warn('Aucune donnée reçue pour l\'établissement');
        setPlace({});
      }
    } catch (e) {
      console.error('Erreur lors de la récupération de l\'établissement:', e);
      // En cas d'erreur, définir un objet vide pour éviter les erreurs de rendu
      setPlace({});
    }
  }, [params.id]);

  const onFetchTable = React.useCallback(async () => {
    if (!params.table) return;
    try {
      const t = await fetchTablePublic(params.table);
      if (t && t.status) setTableStatus(t.status);
    } catch (e) {
      // Si non accessible, on laisse actif par défaut
      console.error('Erreur lors de la récupération de la table:', e);
    }
  }, [params.table]);

  const onAddItemtoShoppingCart = useCallback((item) => {
    setShoppingCart(prevCart => ({
      ...prevCart,
      [item.id]: {
        ...item,
        quantity: (prevCart[item.id]?.quantity || 0) + 1,
      }
    }));
    // Show toast notification
    // Using shorter duration for quick feedback (action completed)
    toast.success(`'${item.name}' ${t('menu.shoppingCart.addedToCart')}`, {
      position: "bottom-center",
      autoClose: 2500, // Shorter for quick action feedback
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
    });
  }, [t]);

  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const handleCloseItemDetail = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const onRemoveItemToShoppingCart = useCallback((item) => {
    setShoppingCart(prevCart => {
      const newQuantity = (prevCart[item.id]?.quantity || 0) - 1;
      if (newQuantity <= 0) {
        const newCart = { ...prevCart };
        delete newCart[item.id];
        if (Object.keys(newCart).length === 0) {
          setShowShoppingCart(false);
        }
        return newCart;
      }
      return {
        ...prevCart,
        [item.id]: {
          ...item,
          quantity: newQuantity,
        }
      };
    });
  }, []);

  const onPaymentDone = useCallback((orderData) => {
    setConfirmedOrder(orderData);
    setShoppingCart({});
    setShowShoppingCart(false);
    setOrderConfirmed(true);
  }, []);

  const handleBackToMenu = useCallback(() => {
    setOrderConfirmed(false);
    setConfirmedOrder(null);
    setShoppingCart({});
    setSelectedCategory(null);
    setSearchQuery('');
  }, []);

  const handleCancelOrder = useCallback(async () => {
    if (!confirmedOrder?.order?.id || !params.id) {
      toast.error(t('menu.orderConfirmation.cancelError'));
      return;
    }

    // Demander confirmation avant d'annuler
    if (!window.confirm(t('menu.orderConfirmation.cancelConfirm'))) {
      return;
    }

    try {
      const { cancelOrder } = await import('../services/api/orders');
      const result = await cancelOrder(params.id, confirmedOrder.order.id);
      
      // Le backend peut retourner { success: true, message: ... } ou directement l'objet
      if (result && (result.success || result.id)) {
        toast.success(result.message || t('menu.orderConfirmation.cancelSuccess'), {
          type: "success",
          position: "bottom-center",
          // Using default duration (3500ms for success)
        });
        handleBackToMenu();
      } else if (result === null) {
        // Erreur gérée par la fonction request
        toast.error(t('menu.orderConfirmation.cancelError'));
      } else {
        toast.error(result?.message || result?.error || t('menu.orderConfirmation.cancelError'));
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
      toast.error(error?.message || t('menu.orderConfirmation.cancelError'));
    }
  }, [confirmedOrder, params.id, handleBackToMenu, t]);

  const totalQuantity = useMemo(
    () => Object.keys(shoppingCart)
            .map((i) => shoppingCart[i].quantity)
            .reduce((a,b) => a + b, 0),
      [shoppingCart]
  );

  const totalPrice = useMemo(
    () => Object.keys(shoppingCart)
            .map((i) => {
              const item = shoppingCart[i];
              const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
              return item.quantity * price;
            })
            .reduce((a,b) => a + b, 0),
      [shoppingCart]
  );

  // Get all categories from place
  const categories = useMemo(() => place?.categories || [], [place?.categories]);
  
  // Set first category as selected if none selected
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Chargement initial
  useEffect(() => {
    onFetchPlace();
    onFetchTable();
  }, [onFetchPlace, onFetchTable]);

  // Rafraîchissement automatique du menu toutes les 30 secondes
  // pour que les modifications du restaurateur soient visibles côté client
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      // Ne rafraîchir que si la page est visible et qu'on n'est pas en train de passer commande
      if (!document.hidden && !orderConfirmed && !showShoppingCart && !selectedItem) {
        onFetchPlace();
      }
    }, 30000); // 30 secondes

    return () => clearInterval(refreshInterval);
  }, [onFetchPlace, orderConfirmed, showShoppingCart, selectedItem]);

  // Panneau d'introduction si menu vide ou première visite
  // Le menu est vide si aucune catégorie n'a de plats disponibles
  // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
  const isMenuEmpty = categories.length === 0 || 
    categories.every(cat => {
      const items = cat.menu_items || cat.menuItems || [];
      return items.length === 0 || 
        items.every(item => !(item.isAvailable !== undefined ? item.isAvailable : item.is_available));
    });

  // Afficher l'écran de confirmation si la commande est confirmée
  if (orderConfirmed && confirmedOrder) {
    return (
      <OrderConfirmation
        orderNumber={confirmedOrder.order?.id || 'N/A'}
        totalAmount={confirmedOrder.totalAmount || 0}
        onBack={handleBackToMenu}
        onCancel={handleCancelOrder}
        color={place.color}
        placeName={place.name}
      />
    );
  }

  // Show ItemDetail if an item is selected
  if (selectedItem) {
    return (
      <div className="relative w-full max-w-md mx-auto" style={{fontFamily: place.font || 'inherit'}}>
        <ItemDetail 
          item={selectedItem}
          onClose={handleCloseItemDetail}
          onAddToCart={onAddItemtoShoppingCart}
          color={place.color}
        />
      </div>
    );
  }
  
  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-md mx-auto flex-col bg-white group/design-root overflow-x-hidden pb-32 safe-area-inset-bottom" style={{fontFamily: place.font || 'inherit'}}>
      {/* Splash Screen avec animation */}
      {showSplash && (
        <SplashScreen 
          onComplete={() => setShowSplash(false)}
          color={place.color}
        />
      )}
      {tableStatus !== 'active' ? (
        <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-md mb-4 mx-3 sm:mx-4 border border-red-200 bg-red-50">
          <div className="flex justify-center mb-3">
            <AlertCircle 
              className="w-8 h-8 sm:w-10 sm:h-10" 
              style={{color: place.color || '#fa7938'}} 
            />
          </div>
          <h4 className="mb-2 text-base sm:text-lg font-bold text-zinc-900" style={{color: place.color || '#fa7938'}}>{t('menu.tableInactive')}</h4>
          <p className="text-zinc-600 text-sm px-2">{t('menu.tableInactiveDescription')}</p>
        </div>
      ) : isMenuEmpty ? (
        <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-lg mb-4 mx-3 sm:mx-4 border border-gray-200">
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
              style={{backgroundColor: place.color ? `${place.color}15` : '#fa793815'}}
            >
              <ChefHat 
                className="w-8 h-8 sm:w-10 sm:h-10" 
                style={{color: place.color || '#fa7938'}} 
              />
            </div>
          </div>
          <h4 className="mb-2 text-lg sm:text-xl font-bold text-zinc-900" style={{color: place.color || '#fa7938'}}>{t('menu.welcome')}</h4>
          <p className="text-zinc-600 mb-1 text-sm sm:text-base">{t('menu.empty')}</p>
          <p className="text-zinc-500 text-xs sm:text-sm px-2">{t('menu.emptyDescription')}</p>
        </div>
      ) : showShoppingCart ? (
        <div className="px-4 py-4">
          <ShoppingCart 
            items={Object.keys(shoppingCart)
              .map((key) => shoppingCart[key])
              .filter((item) => item.quantity > 0)
            }
            onAdd={onAddItemtoShoppingCart}
            onRemove={onRemoveItemToShoppingCart}
            onPaymentDone={onPaymentDone}
            color={place.color}
            title={t('menu.shoppingCart.title')}
            placeId={params.id}
            tableId={params.table}
          />
        </div>
      ) : (
        <>
          {/* Top App Bar - Mobile Optimized */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-md backdrop-blur-sm bg-white/95 safe-area-inset-top">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {(place.logoUrl || place.logo_url) ? (
                <img
                  src={place.logoUrl || place.logo_url}
                  alt={place.name || 'Logo'} 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shadow-sm flex-shrink-0" 
                  loading="eager"
                />
              ) : (
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{backgroundColor: place.color ? `${place.color}15` : '#fa793815'}}
                >
                  <UtensilsCrossed 
                    className="w-5 h-5 sm:w-6 sm:h-6" 
                    style={{color: place.color || '#fa7938'}} 
                  />
                </div>
              )}
              <h2 className="text-lg sm:text-xl font-bold leading-tight tracking-[-0.015em] flex-1 min-w-0 truncate text-slate-900">
                {place.name || 'MenuHub'}
              </h2>
            </div>
            <div className="relative ml-2 sm:ml-3">
              <button 
                className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-transparent text-slate-800 hover:bg-gray-100 active:bg-gray-200 transition-all active:scale-95 touch-manipulation"
                onClick={() => setShowShoppingCart(true)}
                aria-label={t('menu.viewCart')}
              >
                <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              {totalQuantity > 0 && (
                <div 
                  className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-white text-[10px] sm:text-xs font-bold shadow-lg"
                  style={{backgroundColor: place.color || '#fa7938'}}
                >
                  {totalQuantity > 99 ? '99+' : totalQuantity}
                </div>
              )}
            </div>
          </div>

          {/* SearchBar - Mobile Optimized */}
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex gap-2 sm:gap-3 items-center">
            <div className="flex w-full items-center relative">
              <div className="absolute left-3 sm:left-4 z-10 text-slate-500">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input 
                className="w-full h-11 sm:h-12 pl-11 sm:pl-12 pr-9 sm:pr-10 rounded-xl text-slate-900 bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all placeholder:text-slate-500 text-base font-normal leading-normal touch-manipulation" 
                placeholder={t('menu.searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                inputMode="search"
                aria-label={t('menu.searchPlaceholder')}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  className="absolute right-2.5 sm:right-3 z-10 flex items-center justify-center w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-slate-300 text-slate-600 active:bg-slate-400 transition-colors touch-manipulation"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('menu.clearSearch')}
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            <button 
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-200 text-slate-800 active:bg-slate-300 transition-all active:scale-95 touch-manipulation"
              aria-label={t('menu.filters')}
            >
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Chips - Mobile Optimized */}
          <div className="flex gap-2 px-3 sm:px-4 py-2.5 sm:py-3 overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth snap-x snap-mandatory">
            {categories
              .filter((category) => {
                // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
                const items = category.menu_items || category.menuItems || [];
                return items.filter((i) => (i.isAvailable !== undefined ? i.isAvailable : i.is_available)).length > 0;
              })
              .map((category) => (
                <button
                  key={category.id}
                  className={`flex h-9 sm:h-10 shrink-0 items-center justify-center gap-x-1.5 sm:gap-x-2 rounded-full px-4 sm:px-5 transition-all duration-200 transform touch-manipulation snap-start ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white shadow-md scale-105'
                      : 'bg-slate-200 text-slate-800 active:bg-slate-300'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                  aria-pressed={selectedCategory === category.id}
                  aria-label={`${t('menu.filters')}: ${category.name}`}
                  style={selectedCategory === category.id ? {
                    backgroundColor: place.color || '#fa7938',
                    boxShadow: `0 4px 12px ${place.color ? `${place.color}40` : '#fa793840'}`
                  } : {}}
                >
                  <p className="text-xs sm:text-sm font-semibold leading-normal whitespace-nowrap">{category.name}</p>
                </button>
              ))}
          </div>

          {/* Item List - Mobile Optimized */}
          <div className="flex flex-col gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3">
            <MenuList 
              place={place} 
              shoppingCart={shoppingCart} 
              onOrder={onAddItemtoShoppingCart}
              onItemClick={handleItemClick}
              color={place.color} 
              font={place.font}
              selectedCategory={selectedCategory}
              searchQuery={debouncedSearchQuery}
            />
          </div>

        </>
      )}

      {/* Sticky Bottom Bar - Mobile Optimized */}
      {!showShoppingCart && totalQuantity > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-10 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg animate-slide-up safe-area-inset-bottom">
          <div className="mx-auto max-w-md px-3 sm:px-4 pt-3 pb-3 sm:pb-4">
            <div className="flex w-full items-center justify-between gap-3 sm:gap-4 rounded-xl bg-white p-3 sm:p-4 shadow-lg border border-gray-100">
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">{totalQuantity} {totalQuantity === 1 ? t('menu.article') : t('menu.articles')}</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">{totalPrice.toFixed(2).replace('.', ',')} XAF</p>
              </div>
              <button 
                className="flex h-11 sm:h-12 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-xl px-4 sm:px-6 text-sm sm:text-base font-bold text-white shadow-md active:shadow-lg transition-all duration-200 active:scale-95 min-w-[100px] sm:min-w-[120px] touch-manipulation"
                style={{
                  backgroundColor: place.color || '#fa7938',
                  boxShadow: `0 4px 14px ${place.color ? `${place.color}40` : '#fa793840'}`
                }}
                onClick={() => setShowShoppingCart(true)}
                aria-label={`${t('menu.order')} - ${totalPrice.toFixed(2).replace('.', ',')} XAF`}
              >
                <span className="truncate">{t('menu.order')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
