
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from '../utils/toast';
import { fetchPlaces } from '../services';
import AuthContext from '../contexts/AuthContext';
import { LanguageToggle } from '../components/ui';
import PlaceFormModal from '../components/places/PlaceFormModal';
import PlaceCard from '../components/places/PlaceCard';
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal';
import PlaceSelector from '../components/places/PlaceSelector';
import PlaceSort from '../components/places/PlaceSort';
import UserMenu from '../components/places/UserMenu';
import PlacesDashboard from '../components/places/PlacesDashboard';
import useHashNavigation from '../hooks/useHashNavigation';
import { removePlace, fetchPlaceStats, refreshPlaceStats, duplicatePlace } from '../services/api/places';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Table2, 
  ShoppingBag, 
  Settings,
  ChevronRight,
  LayoutGrid,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import illustrationRestaurant from '../assets/images/illustration-restaurant.jpg';

const Places = () => {
  const { t } = useTranslation();
  const [places, setPlaces] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [placesStats, setPlacesStats] = useState({});
  const [loadingStats, setLoadingStats] = useState({});
  const [notifications, setNotifications] = useState({});
  const [sortOption, setSortOption] = useState(() => {
    return localStorage.getItem('placesSort') || PlaceSort.SORT_OPTIONS.DEFAULT;
  });
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('placesViewMode') || 'grid';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const auth = useContext(AuthContext);
  const history = useHistory();
  const location = useLocation();

  const onHide = useCallback(() => setShow(false), []);
  const onShow = useCallback(() => setShow(true), []);

  // Fonction pour charger/rafraîchir les stats d'un établissement
  const loadPlaceStats = useCallback(async (placeId, forceRefresh = false) => {
    if (!placeId || !auth.token) return;
    
    // Si on ne force pas le rafraîchissement et que les stats existent déjà, ne pas recharger
    if (!forceRefresh && placesStats[placeId] && !loadingStats[placeId]) {
      return;
    }
    
    setLoadingStats(prev => ({ ...prev, [placeId]: true }));
    try {
      const response = forceRefresh 
        ? await refreshPlaceStats(placeId, auth.token)
        : await fetchPlaceStats(placeId, auth.token);
      
      // Extraire les données depuis la réponse standardisée { success: true, data: {...} }
      let stats = response?.data || response;
      
      // Normaliser les stats de la même manière que dans Place.js
      // S'assurer que toutes les propriétés existent avec des valeurs par défaut
      if (!stats || typeof stats !== 'object') {
        stats = {
          tables_count: 0,
          orders_today: 0,
          orders_week: 0
        };
      }
      
      // Normaliser les stats pour gérer à la fois snake_case et camelCase
      const normalizedStats = {
        tables_count: stats.tables_count ?? stats.tablesCount ?? 0,
        orders_today: stats.orders_today ?? stats.ordersToday ?? 0,
        orders_week: stats.orders_week ?? stats.ordersWeek ?? 0
      };
      
      setPlacesStats(prev => ({ ...prev, [placeId]: normalizedStats }));
      
      // Simuler des notifications (à remplacer par un vrai système de notifications)
      // Pour l'instant, on utilise les commandes du jour comme indicateur
      if (normalizedStats.orders_today > 0) {
        setNotifications(prev => ({ ...prev, [placeId]: normalizedStats.orders_today }));
      } else {
        // Retirer la notification si plus de commandes
        setNotifications(prev => {
          const newNotifs = { ...prev };
          delete newNotifs[placeId];
          return newNotifs;
        });
      }
    } catch (err) {
      console.error(`Error loading stats for place ${placeId}:`, err);
      // En cas d'erreur, utiliser des valeurs par défaut
      setPlacesStats(prev => ({ 
        ...prev, 
        [placeId]: {
          tables_count: 0,
          orders_today: 0,
          orders_week: 0
        }
      }));
    } finally {
      setLoadingStats(prev => ({ ...prev, [placeId]: false }));
    }
  }, [auth.token, placesStats, loadingStats]);

  const onFetchPlaces = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
    const json = await fetchPlaces(auth.token);
      if (json) {
        // Le backend retourne { success: true, data: [...], message: '...' }
        // Extraire le tableau de places depuis json.data ou utiliser json directement si c'est déjà un tableau
        const placesArray = Array.isArray(json) ? json : (json.data || []);
        setPlaces(placesArray);
        // Debug: afficher la structure des données pour vérifier les champs disponibles
        if (placesArray.length > 0) {
          console.log('Structure des données place:', placesArray[0]);
        }
        // Si l'URL contient un ID d'établissement, l'utiliser comme sélectionné
        const pathMatch = location.pathname.match(/\/places\/(\d+)/);
        if (pathMatch && pathMatch[1]) {
          const placeIdFromUrl = parseInt(pathMatch[1]);
          if (placesArray.find(p => p.id === placeIdFromUrl)) {
            setSelectedPlaceId(placeIdFromUrl);
            return;
          }
        }
        // Définir le premier établissement comme sélectionné si aucun n'est sélectionné
        if (placesArray.length > 0 && !selectedPlaceId) {
          // Vérifier localStorage d'abord
          const savedPlaceId = localStorage.getItem('selectedPlaceId');
          if (savedPlaceId && placesArray.find(p => p.id === parseInt(savedPlaceId))) {
            setSelectedPlaceId(parseInt(savedPlaceId));
          } else {
            setSelectedPlaceId(placesArray[0].id);
            localStorage.setItem('selectedPlaceId', placesArray[0].id.toString());
          }
        }
      }
    } catch (err) {
      setError(t('places.error'));
      console.error('Error fetching places:', err);
    } finally {
      setLoading(false);
    }
  }, [auth.token, location.pathname, selectedPlaceId, t]);

  const onDone = useCallback(async () => {
    await onFetchPlaces();
    // Les stats seront rafraîchies automatiquement via le useEffect qui dépend de places
    onHide();
  }, [onFetchPlaces, onHide]);

  // Gestion de la suppression
  const handleDeleteClick = useCallback((place) => {
    setPlaceToDelete(place);
    setDeleteModalOpen(true);
  }, []);

  // Gestion de la duplication
  const handleDuplicateClick = useCallback(async (place) => {
    try {
      const newPlace = await duplicatePlace(place.id, auth.token);
      toast.success(`L'établissement "${newPlace.name}" a été créé avec succès.`);
      await onFetchPlaces();
    } catch (err) {
      console.error('Error duplicating place:', err);
      toast.error('Erreur lors de la duplication de l\'établissement.');
    }
  }, [auth.token, onFetchPlaces]);

  // Confirmation de suppression
  const handleDeleteConfirm = useCallback(async () => {
    if (!placeToDelete) return;

    try {
      setIsDeleting(true);
      const response = await removePlace(placeToDelete.id, auth.token);
      
      // Vérifier que la suppression a réussi
      if (response === null) {
        throw new Error('Erreur lors de la suppression de l\'établissement');
      }
      
      // Afficher un message de succès avec les statistiques si disponibles
      const deletedStats = response?.data?.deletedStats;
      let successMessage = `L'établissement "${placeToDelete.name}" a été supprimé avec succès.`;
      if (deletedStats) {
        const statsParts = [];
        if (deletedStats.tablesCount > 0) statsParts.push(`${deletedStats.tablesCount} table${deletedStats.tablesCount > 1 ? 's' : ''}`);
        if (deletedStats.categoriesCount > 0) statsParts.push(`${deletedStats.categoriesCount} catégorie${deletedStats.categoriesCount > 1 ? 's' : ''}`);
        if (deletedStats.menuItemsCount > 0) statsParts.push(`${deletedStats.menuItemsCount} plat${deletedStats.menuItemsCount > 1 ? 's' : ''}`);
        if (deletedStats.ordersCount > 0) statsParts.push(`${deletedStats.ordersCount} commande${deletedStats.ordersCount > 1 ? 's' : ''}`);
        
        if (statsParts.length > 0) {
          successMessage += ` (${statsParts.join(', ')} supprimé${statsParts.length > 1 ? 's' : ''})`;
        }
      }
      toast.success(successMessage);
      
      // Si l'établissement supprimé était sélectionné, sélectionner le premier disponible
      if (selectedPlaceId === placeToDelete.id) {
        const remainingPlaces = places.filter(p => p.id !== placeToDelete.id);
        if (remainingPlaces.length > 0) {
          setSelectedPlaceId(remainingPlaces[0].id);
        } else {
          setSelectedPlaceId(null);
        }
      }
      
      // Nettoyer les stats
      setPlacesStats(prev => {
        const newStats = { ...prev };
        delete newStats[placeToDelete.id];
        return newStats;
      });
      setNotifications(prev => {
        const newNotifs = { ...prev };
        delete newNotifs[placeToDelete.id];
        return newNotifs;
      });
      
      // Rafraîchir la liste
      await onFetchPlaces();
      setDeleteModalOpen(false);
      setPlaceToDelete(null);
    } catch (err) {
      console.error('Error deleting place:', err);
      const errorMessage = err?.message || 'Erreur lors de la suppression de l\'établissement.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [placeToDelete, auth.token, selectedPlaceId, places, onFetchPlaces]);

  useEffect(() => {
    onFetchPlaces();
  }, [onFetchPlaces]);

  // Synchroniser selectedPlaceId avec localStorage
  useEffect(() => {
    if (selectedPlaceId) {
      localStorage.setItem('selectedPlaceId', selectedPlaceId.toString());
    }
  }, [selectedPlaceId]);

  // Charger les statistiques pour chaque établissement au montage et après modifications
  useEffect(() => {
    const loadStats = async () => {
      for (const place of places) {
        // Charger seulement si les stats n'existent pas encore
        if (!placesStats[place.id] && !loadingStats[place.id]) {
          await loadPlaceStats(place.id, false);
        }
      }
    };

    if (places.length > 0) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, auth.token]);

  // Rafraîchir les stats après chaque fetchPlaces (quand places change)
  useEffect(() => {
    if (places.length > 0 && auth.token) {
      // Rafraîchir les stats pour tous les établissements après un court délai
      const timeoutId = setTimeout(async () => {
        for (const place of places) {
          await loadPlaceStats(place.id, true);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places.length, auth.token]);


  // Rafraîchir les stats quand on revient sur la page (focus)
  useEffect(() => {
    const handleFocus = () => {
      // Rafraîchir les stats de l'établissement sélectionné quand on revient sur la page
      if (selectedPlaceId && auth.token) {
        loadPlaceStats(selectedPlaceId, true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedPlaceId, auth.token, loadPlaceStats]);

  // Écouter les événements de modification depuis Place.js pour synchroniser les stats
  useEffect(() => {
    const handlePlaceStatsUpdate = (event) => {
      const { placeId, stats, eventType } = event.detail || {};
      
      // Si les stats sont directement fournies dans l'événement, les utiliser
      // Sinon, rafraîchir depuis le backend
      if (placeId && auth.token) {
        if (stats && typeof stats === 'object') {
          // Normaliser les stats reçues de la même manière
          const normalizedStats = {
            tables_count: stats.tables_count ?? stats.tablesCount ?? 0,
            orders_today: stats.orders_today ?? stats.ordersToday ?? 0,
            orders_week: stats.orders_week ?? stats.ordersWeek ?? 0
          };
          
          // Mettre à jour immédiatement avec les stats reçues
          setPlacesStats(prev => ({ ...prev, [placeId]: normalizedStats }));
          
          // Mettre à jour les notifications
          if (normalizedStats.orders_today > 0) {
            setNotifications(prev => ({ ...prev, [placeId]: normalizedStats.orders_today }));
          } else {
            setNotifications(prev => {
              const newNotifs = { ...prev };
              delete newNotifs[placeId];
              return newNotifs;
            });
          }
        } else {
          // Si pas de stats dans l'événement, rafraîchir depuis le backend
          // Délai court pour laisser le temps au backend de se mettre à jour
          setTimeout(() => {
            loadPlaceStats(placeId, true);
          }, 300);
        }
      }
    };

    window.addEventListener('place:stats-updated', handlePlaceStatsUpdate);
    return () => {
      window.removeEventListener('place:stats-updated', handlePlaceStatsUpdate);
    };
  }, [auth.token, loadPlaceStats]);

  // Gérer le scroll vers les sections avec hash (pour Tables et Menu)
  useHashNavigation({ delay: 300 });

  const isFirstLogin = places.length === 0;
  
  // Navigation handlers avec gestion d'erreur
  const handleNavigation = (route) => {
    const placeId = selectedPlaceId || (places.length > 0 ? places[0].id : null);
    if (placeId) {
      try {
        const finalRoute = route.replace(':id', placeId);
        history.push(finalRoute);
      } catch (error) {
        console.error('Erreur de navigation:', error);
        toast.error('Erreur lors de la navigation');
      }
    } else {
      toast.warning('Veuillez d\'abord créer un établissement');
    }
  };

  // Déterminer la route active de manière plus précise
  const isActiveRoute = (routePattern) => {
    const currentPath = location.pathname;
    
    if (routePattern === '/places') {
      return currentPath === '/places';
    }
    
    // Extraire l'ID de l'établissement depuis l'URL actuelle
    const pathMatch = currentPath.match(/\/places\/(\d+)/);
    const currentPlaceId = pathMatch ? parseInt(pathMatch[1]) : null;
    const activePlaceId = selectedPlaceId || currentPlaceId || (places.length > 0 ? places[0].id : null);
    
    if (activePlaceId) {
      const fullRoute = routePattern.replace(':id', activePlaceId);
      // Vérification exacte ou si le chemin commence par la route
      if (currentPath === fullRoute) return true;
      if (currentPath.startsWith(fullRoute + '/')) return true;
    }
    
    return false;
  };

  // Fonctions helper pour détecter l'état actif de chaque bouton
  const isTablesActive = () => {
    return isActiveRoute('/places/:id') && 
           !location.pathname.includes('/settings') && 
           !location.pathname.includes('/orders') && 
           !location.pathname.includes('/edit') && 
           location.pathname !== '/places' && 
           (!location.hash || location.hash === '#tables' || location.hash === '');
  };

  const isMenuActive = () => {
    return isActiveRoute('/places/:id') && location.hash === '#menu';
  };

  const isOrdersActive = () => {
    return location.pathname.includes('/orders');
  };

  const isSettingsActive = () => {
    return location.pathname.includes('/edit');
  };

  // Calculer les places triées
  const sortedPlaces = useMemo(() => {
    // S'assurer que places est un tableau
    if (!Array.isArray(places)) {
      return [];
    }
    let sorted = [...places];
    
    switch (sortOption) {
      case PlaceSort.SORT_OPTIONS.NAME_ASC:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case PlaceSort.SORT_OPTIONS.NAME_DESC:
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case PlaceSort.SORT_OPTIONS.DATE_ASC:
        sorted.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        break;
      case PlaceSort.SORT_OPTIONS.DATE_DESC:
        sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      default:
        // Ordre par défaut (tel que retourné par l'API)
        break;
    }
    
    return sorted;
  }, [places, sortOption]);

  return (
    <div className="flex min-h-screen w-full font-display bg-light-surface">
      {/* Overlay pour menu mobile/tablette */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SideNavBar - Desktop visible, Mobile/Tablette caché */}
      <aside className={`hidden lg:flex w-64 flex-col justify-between border-r border-gray-border bg-white p-4 flex-shrink-0 shadow-sm`}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-3">
            <h1 className="text-dark-text text-2xl font-bold tracking-tight">MenuHub</h1>
          </div>
          <nav className="flex flex-col gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                try {
                  history.push('/places');
                } catch (error) {
                  console.error('Erreur de navigation:', error);
                }
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold transition-all duration-200 ${
                location.pathname === '/places'
                  ? 'bg-primary/15 text-primary shadow-sm border border-primary/20'
                  : 'text-muted-text hover:bg-gray-50 hover:text-primary border border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 group`}
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className="text-base flex-1 text-left">{t('places.dashboard')}</span>
              {location.pathname === '/places' && (
                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const placeId = selectedPlaceId || (places.length > 0 ? places[0].id : null);
                if (placeId) {
                  history.push(`/places/${placeId}#tables`);
                  // Scroll vers la section tables après un court délai
                  setTimeout(() => {
                    const element = document.getElementById('tables');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                } else {
                  toast.warning('Veuillez d\'abord créer un établissement');
                }
              }}
              disabled={!selectedPlaceId && places.length === 0}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200 ${
                isTablesActive()
                  ? 'bg-[#16a34a]/15 text-[#16a34a] shadow-sm border border-[#16a34a]/20'
                  : 'text-muted-text hover:bg-gray-50 hover:text-[#16a34a] active:bg-[#16a34a]/10 border border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-text group`}
            >
              <Table2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-base flex-1 text-left">Tables</span>
              {isTablesActive() && (
                <ChevronRight className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const placeId = selectedPlaceId || (places.length > 0 ? places[0].id : null);
                if (placeId) {
                  // Rediriger vers la même page que Tables
                  history.push(`/places/${placeId}`);
                  // Scroll vers la section menu après un court délai
                  setTimeout(() => {
                    const element = document.getElementById('menu');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 300);
                } else {
                  toast.warning('Veuillez d\'abord créer un établissement');
                }
              }}
              disabled={!selectedPlaceId && places.length === 0}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200 ${
                isMenuActive()
                  ? 'bg-[#6C63FF]/15 text-[#6C63FF] shadow-sm border border-[#6C63FF]/20'
                  : 'text-muted-text hover:bg-gray-50 hover:text-[#6C63FF] active:bg-[#6C63FF]/10 border border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-text group`}
            >
              <UtensilsCrossed className="w-5 h-5 flex-shrink-0" />
              <span className="text-base flex-1 text-left">Menu</span>
              {isMenuActive() && (
                <ChevronRight className="w-4 h-4 text-[#6C63FF] flex-shrink-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleNavigation('/places/:id/orders')}
              disabled={!selectedPlaceId && places.length === 0}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200 ${
                isOrdersActive()
                  ? 'bg-[#FFD600]/15 text-[#F59E0B] shadow-sm border border-[#FFD600]/20'
                  : 'text-muted-text hover:bg-gray-50 hover:text-[#F59E0B] active:bg-[#FFD600]/10 border border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-[#FFD600] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-text group`}
            >
              <ShoppingBag className="w-5 h-5 flex-shrink-0" />
              <span className="text-base flex-1 text-left">Commandes</span>
              {isOrdersActive() && (
                <ChevronRight className="w-4 h-4 text-[#FFD600] flex-shrink-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleNavigation('/places/:id/edit')}
              disabled={!selectedPlaceId && places.length === 0}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200 ${
                isSettingsActive()
                  ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200'
                  : 'text-muted-text hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 border border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-text group`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="text-base flex-1 text-left">Paramètres</span>
              {isSettingsActive() && (
                <ChevronRight className="w-4 h-4 text-[#1f1f1f] flex-shrink-0" />
              )}
            </button>
          </nav>
        </div>
      </aside>

      {/* SideNavBar - Mobile/Tablette (overlay) */}
      <aside className={`fixed lg:hidden top-0 left-0 h-full w-72 sm:w-80 md:w-64 bg-white border-r border-gray-border z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header avec logo et bouton fermer */}
          <div className="flex items-center justify-between p-4 border-b border-gray-border bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <h1 className="text-dark-text text-xl sm:text-2xl font-bold tracking-tight">MenuHub</h1>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-text hover:text-dark-text"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation scrollable */}
          <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                try {
                  history.push('/places');
                  setMobileMenuOpen(false);
                } catch (error) {
                  console.error('Erreur de navigation:', error);
                }
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2.5 font-semibold transition-all duration-200 min-h-[48px] sm:min-h-[44px] active:scale-[0.98] ${
                location.pathname === '/places'
                  ? 'bg-primary/15 text-primary shadow-sm border border-primary/20'
                  : 'text-muted-text hover:bg-gray-50 hover:text-primary active:bg-primary/10 border border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 group`}
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base flex-1 text-left font-medium">{t('places.dashboard')}</span>
              {location.pathname === '/places' && (
                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const placeId = selectedPlaceId || (places.length > 0 ? places[0].id : null);
                if (placeId) {
                  history.push(`/places/${placeId}#tables`);
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const element = document.getElementById('tables');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                } else {
                  toast.warning('Veuillez d\'abord créer un établissement');
                }
              }}
              disabled={!selectedPlaceId && places.length === 0}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2.5 font-medium transition-all duration-200 min-h-[48px] sm:min-h-[44px] active:scale-[0.98] ${
                isTablesActive()
                  ? 'bg-[#16a34a]/15 text-[#16a34a] shadow-sm border border-[#16a34a]/20'
                  : 'text-muted-text hover:bg-gray-50 hover:text-[#16a34a] active:bg-[#16a34a]/10 border border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-text group`}
            >
              <Table2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base flex-1 text-left">Tables</span>
              {isTablesActive() && (
                <ChevronRight className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const placeId = selectedPlaceId || (places.length > 0 ? places[0].id : null);
                if (placeId) {
                  history.push(`/places/${placeId}`);
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const element = document.getElementById('menu');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 300);
                } else {
                  toast.warning('Veuillez d\'abord créer un établissement');
                }
              }}
              disabled={!selectedPlaceId && places.length === 0}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2.5 font-medium transition-all duration-200 min-h-[48px] sm:min-h-[44px] active:scale-[0.98] ${
                isMenuActive()
                  ? 'bg-[#6C63FF]/15 text-[#6C63FF] shadow-sm border border-[#6C63FF]/20'
                  : 'text-muted-text hover:bg-gray-50 hover:text-[#6C63FF] active:bg-[#6C63FF]/10 border border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-text group`}
            >
              <UtensilsCrossed className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base flex-1 text-left">Menu</span>
              {isMenuActive() && (
                <ChevronRight className="w-4 h-4 text-[#6C63FF] flex-shrink-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                handleNavigation('/places/:id/orders');
                setMobileMenuOpen(false);
              }}
              disabled={!selectedPlaceId && places.length === 0}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2.5 font-medium transition-all duration-200 min-h-[48px] sm:min-h-[44px] active:scale-[0.98] ${
                isOrdersActive()
                  ? 'bg-[#FFD600]/15 text-[#F59E0B] shadow-sm border border-[#FFD600]/20'
                  : 'text-muted-text hover:bg-gray-50 hover:text-[#F59E0B] active:bg-[#FFD600]/10 border border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-[#FFD600] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-text group`}
            >
              <ShoppingBag className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base flex-1 text-left">Commandes</span>
              {isOrdersActive() && (
                <ChevronRight className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                handleNavigation('/places/:id/edit');
                setMobileMenuOpen(false);
              }}
              disabled={!selectedPlaceId && places.length === 0}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2.5 font-medium transition-all duration-200 min-h-[48px] sm:min-h-[44px] active:scale-[0.98] ${
                isSettingsActive()
                  ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200'
                  : 'text-muted-text hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 border border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-text group`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base flex-1 text-left">Paramètres</span>
              {isSettingsActive() && (
                <ChevronRight className="w-4 h-4 text-[#1f1f1f] flex-shrink-0" />
              )}
            </button>
          </nav>
          
          {/* Footer avec UserMenu sur mobile */}
          <div className="p-4 border-t border-gray-border bg-white sticky bottom-0">
            <UserMenu />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col bg-light-surface">
        {/* TopNavBar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-border bg-card-surface px-4 sm:px-6 lg:px-8 py-3 sm:py-4 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Bouton menu mobile/tablette */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-dark-text hover:text-primary"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6 sm:w-5 sm:h-5" />
            </button>
            {places.length > 0 && (
              <>
                <PlaceSelector
                  places={places}
                  selectedPlaceId={selectedPlaceId}
                  onSelect={setSelectedPlaceId}
                />
                <div className="text-xs sm:text-sm text-muted-text whitespace-nowrap">
                  {places.length} {places.length === 1 ? 'établissement' : 'établissements'}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2">
              <LanguageToggle />
            </div>
            <UserMenu />
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Page Heading */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark-text drop-shadow-sm">
                {auth.user?.firstName 
                  ? `Bonjour ${auth.user.firstName}, ${t('places.myEstablishments').toLowerCase()}`
                  : t('places.myEstablishments')
                }
              </h1>
              <p className="text-sm sm:text-base text-muted-text">Gérez tous vos restaurants depuis un seul endroit.</p>
            </div>
            {places.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center border border-gray-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('grid');
                      localStorage.setItem('placesViewMode', 'grid');
                    }}
                    className={`px-3 py-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary text-white'
                        : 'bg-card-surface text-muted-text hover:bg-gray-100'
                    }`}
                    aria-label="Vue grille"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('dashboard');
                      localStorage.setItem('placesViewMode', 'dashboard');
                    }}
                    className={`px-3 py-2 transition-colors ${
                      viewMode === 'dashboard'
                        ? 'bg-primary text-white'
                        : 'bg-card-surface text-muted-text hover:bg-gray-100'
                    }`}
                    aria-label="Vue dashboard"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
                <PlaceSort
                  currentSort={sortOption}
                  onSortChange={setSortOption}
                />
              </div>
            )}
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-base font-medium text-muted-text">{t('places.loading')}</p>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <div className="flex h-full items-center justify-center">
              <div className="flex max-w-md flex-col items-center gap-4 text-center p-8 bg-card-surface rounded-lg border border-gray-border">
                <div className="text-red-500 text-4xl">⚠️</div>
                <h2 className="text-xl font-bold text-dark-text">{t('places.error')}</h2>
                <p className="text-base text-muted-text">{error}</p>
                <button
                  onClick={onFetchPlaces}
                  className="flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-6 text-sm font-bold text-white shadow-custom-orange transition-transform hover:scale-105"
                >
                  {t('places.retry')}
                </button>
              </div>
            </div>
          )}
          
          {/* Onboarding/Empty State */}
          {!loading && !error && isFirstLogin ? (
            <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center p-4 sm:p-6 lg:p-8">
              <div className="flex max-w-2xl w-full flex-col items-center gap-8 text-center">
                {/* Illustration Container avec gradient background */}
                <div className="relative w-full max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl blur-3xl"></div>
                  <div className="relative bg-white rounded-2xl p-6 sm:p-8 lg:p-12 shadow-xl border border-gray-100 overflow-hidden">
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary to-[#E54A0F] shadow-lg shadow-primary/30">
                        <UtensilsCrossed className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      </div>
                      <div className="relative w-full max-w-sm overflow-hidden rounded-xl shadow-lg">
                        <img 
                          src={illustrationRestaurant} 
                          alt="Illustration restaurant - Menu digital avec QR code" 
                          className="w-full h-auto object-cover object-center rounded-xl transition-transform duration-300 hover:scale-105"
                          style={{
                            aspectRatio: '16/9',
                            minHeight: '200px',
                            maxHeight: '400px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col gap-4 max-w-xl">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-text tracking-tight">
                      {auth.user?.firstName 
                        ? `${t('places.welcome')}, ${auth.user.firstName} !`
                        : t('places.welcome')
                      }
                    </h2>
                    <p className="text-lg sm:text-xl text-muted-text leading-relaxed">
                      Commencez par créer votre premier établissement pour gérer vos menus, tables et bien plus encore.
                    </p>
                  </div>

                  {/* Features Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#16a34a]/10">
                        <Table2 className="w-5 h-5 text-[#16a34a]" />
                      </div>
                      <span className="text-sm font-medium text-dark-text">Gestion des tables</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#6C63FF]/10">
                        <UtensilsCrossed className="w-5 h-5 text-[#6C63FF]" />
                      </div>
                      <span className="text-sm font-medium text-dark-text">Menu digital</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#FFD600]/10">
                        <ShoppingBag className="w-5 h-5 text-[#F59E0B]" />
                      </div>
                      <span className="text-sm font-medium text-dark-text">Commandes en temps réel</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-4">
                    <button
                      className="group flex h-14 w-full sm:w-auto sm:min-w-[240px] mx-auto cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-[#E54A0F] px-8 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={onShow}
                    >
                      <span className="truncate">{t('places.createEstablishment')}</span>
                      <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
              <PlaceFormModal 
                isOpen={show}
                onClose={onHide}
                onDone={onDone}
                title={t('places.addEstablishment')}
              />
            </div>
          ) : viewMode === 'dashboard' ? (
            <PlacesDashboard 
              places={places} 
              placesStats={placesStats}
              onCreatePlace={onShow}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {sortedPlaces.map((place, index) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isSelected={selectedPlaceId === place.id}
                  onSelect={() => setSelectedPlaceId(place.id)}
                  onManage={() => history.push(`/places/${place.id}`)}
                  onQRCodes={() => history.push(`/qrcodes/${place.id}`)}
                  onDelete={() => handleDeleteClick(place)}
                  onEdit={() => history.push(`/places/${place.id}/edit`)}
                  onDuplicate={() => handleDuplicateClick(place)}
                  onViewStats={() => {
                    toast.info(`Statistiques: ${placesStats[place.id]?.tables_count || 0} tables, ${placesStats[place.id]?.orders_today || 0} commandes aujourd'hui`);
                  }}
                  stats={placesStats[place.id]}
                  notificationCount={notifications[place.id] || 0}
                  t={t}
                  style={{
                    animationDelay: `${index * 0.05}s`
                  }}
                />
              ))}
              {/* Add Establishment Card */}
              <div
                className="group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-primary bg-primary/10 p-4 sm:p-6 transition-all hover:border-solid hover:bg-primary/20 hover:shadow-custom-orange focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px] sm:min-h-[240px]"
                onClick={onShow}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onShow();
                  }
                }}
                aria-label="Créer un nouvel établissement"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-light-text">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-primary">{t('places.addEstablishment')}</p>
              </div>
              <PlaceFormModal 
                isOpen={show}
                onClose={onHide}
                onDone={onDone}
                title={t('places.addEstablishment')}
              />
            </div>
          )}

          {/* Modal de confirmation de suppression */}
          <DeleteConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setPlaceToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Supprimer l'établissement ?"
            itemName={placeToDelete?.name || ''}
            itemType="restaurant"
            requiresConfirmation={true}
            confirmationPlaceholder={`Saisir "${placeToDelete?.name || 'nom de l\'établissement'}"`}
            isLoading={isDeleting}
          />
        </div>
      </main>
    </div>
  );
};

export default Places;