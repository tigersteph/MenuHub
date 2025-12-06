import React, { useEffect, useState, useContext, useMemo } from 'react';
import { toast } from '../utils/toast';
import { useParams, useHistory, useLocation } from 'react-router-dom';
// import { useTranslation } from 'react-i18next'; // Réservé pour usage futur
import AuthContext from '../contexts/AuthContext';
import MenuItemForm from '../forms/MenuItemForm';
import QRCodeModal from '../components/business/QRCodeModal';
import TablesManagerModern from '../components/business/TablesManagerModern';
import CategoryListEnhanced from '../components/business/CategoryListEnhanced';
import { Modal, Button, Input, useSnackbar, Loader } from '../components/ui';
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal';
import BackButton from '../components/ui/BackButton';
import { usePlaceData } from '../hooks/usePlaceData';
import { fetchPlaces } from '../services';
import { addMenuItems } from '../services/api/menu';
import { fetchPlaceStats, refreshPlaceStats } from '../services/api/places';
import { debounce } from '../utils/helpers';
import { API_BASE } from '../config';
import { Edit, Trash2, Plus, QrCode, Menu as MenuIcon, ShoppingCart, Settings, ChevronDown, ChevronUp, Table2, UtensilsCrossed, ChevronRight, AlertTriangle, X, Grid3x3, List, CheckSquare } from 'lucide-react';
import io from 'socket.io-client';
import PlaceStats from '../components/places/PlaceStats';

const Place = () => {
  // const { t } = useTranslation(); // Réservé pour usage futur
  const [menuItemFormShow, setMenuItemFormShow] = useState(false);
  const [selectedCategoryForItem, setSelectedCategoryForItem] = useState(null);
  const [selectedItemToEdit, setSelectedItemToEdit] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [qrCode, setQrCode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPlace, setDeletingPlace] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categorySearchInput, setCategorySearchInput] = useState('');
  
  // États pour tri et filtres des plats
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [filterAvailable, setFilterAvailable] = useState('all'); // 'all', 'available', 'unavailable'
  
  // États pour vue alternative et actions en masse
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid'
  const [selectedItems, setSelectedItems] = useState(new Set()); // IDs des items sélectionnés
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  // États pour la gestion des restaurants multiples
  const [allPlaces, setAllPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [showPlaceSelector, setShowPlaceSelector] = useState(false);
  
  // États pour les confirmations de suppression
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // État d'erreur global
  const [error, setError] = useState(null);
  
  // État pour les statistiques récapitulatives
  const [placeStats, setPlaceStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  const auth = useContext(AuthContext);
  const params = useParams();
  const history = useHistory();
  const location = useLocation();
  const { showSnackbarWithUndo } = useSnackbar();

  // Utiliser le hook centralisé pour les données
  const {
    place,
    tables,
    loading: placeLoading,
    loadPlace,
    loadTables,
    updatePlaceData,
    deletePlace,
    addTableData,
    updateTableData,
    deleteTable,
    addCategoryData,
    updateCategoryData,
    deleteCategory,
    updateMenuItemData,
    deleteMenuItem,
  } = usePlaceData(params.id, auth.token);

  // Debounce pour la recherche de catégories
  const debouncedSetCategorySearch = useMemo(
    () => debounce((value) => {
      setCategorySearchQuery(value);
    }, 300),
    []
  );

  // Mettre à jour la recherche avec debounce
  useEffect(() => {
    debouncedSetCategorySearch(categorySearchInput);
  }, [categorySearchInput, debouncedSetCategorySearch]);

  // Charger tous les restaurants de l'utilisateur
  useEffect(() => {
    const fetchAllPlaces = async () => {
      if (!auth || !auth.token) {
        console.warn('Token non disponible pour charger les établissements');
        return;
      }
      setError(null);
      try {
        const response = await fetchPlaces(auth.token);
        // Extraire les données depuis la réponse standardisée { success: true, data: [...] }
        const placesArray = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
        
        if (placesArray && placesArray.length > 0) {
          setAllPlaces(placesArray);
          
          // Vérifier que l'établissement demandé appartient à l'utilisateur
          if (params.id) {
            const requestedPlace = placesArray.find(p => p.id === params.id);
            if (requestedPlace) {
              // L'établissement appartient à l'utilisateur
              setSelectedPlaceId(params.id);
            } else {
              // L'établissement n'appartient pas à l'utilisateur ou n'existe pas
              toast.error('Cet établissement ne vous appartient pas ou n\'existe pas');
              history.push('/places');
              return;
            }
          } else if (placesArray.length > 0) {
            // Aucun ID dans l'URL, sélectionner le premier
            setSelectedPlaceId(placesArray[0].id);
          }
        } else {
          // Aucun établissement trouvé
          if (params.id) {
            // L'utilisateur essaie d'accéder à un établissement spécifique mais n'en a aucun
            toast.error('Aucun établissement trouvé');
            history.push('/places');
          }
        }
      } catch (error) {
        console.error('Error fetching places:', error);
        const errorMsg = error.message || 'Erreur lors du chargement des établissements';
        if (errorMsg.includes('UNAUTHORIZED') || errorMsg.includes('401')) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          // Rediriger vers la page de connexion après un court délai
          setTimeout(() => {
            history.push('/login');
          }, 2000);
        } else {
          setError(errorMsg);
          toast.error('Erreur lors du chargement des établissements');
        }
      }
    };
    fetchAllPlaces();
  }, [auth, params.id, history]);

  // Synchroniser selectedPlaceId avec params.id quand l'URL change
  useEffect(() => {
    if (params.id && params.id !== selectedPlaceId) {
      setSelectedPlaceId(params.id);
    }
  }, [params.id, selectedPlaceId]);

  // Fermer le sélecteur quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPlaceSelector && !event.target.closest('.place-selector-container')) {
        setShowPlaceSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlaceSelector]);


  // Charger les données au montage - seulement si l'établissement appartient à l'utilisateur
  useEffect(() => {
    if (!params.id || !auth || !auth.token) {
      console.warn('Token ou ID non disponible pour charger les données');
      return;
    }
    
    // Si on a déjà chargé les établissements, vérifier que celui demandé appartient à l'utilisateur
    if (allPlaces.length > 0) {
      const requestedPlace = allPlaces.find(p => p.id === params.id);
      if (!requestedPlace) {
        // L'établissement n'appartient pas à l'utilisateur
        toast.error('Cet établissement ne vous appartient pas');
        history.push('/places');
        return;
      }
    }
    
    setError(null);
    const loadData = async () => {
      try {
        await Promise.all([loadPlace(), loadTables()]);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        const errorMsg = err.message || 'Erreur lors du chargement des données';
        
        // Si erreur d'autorisation, rediriger
        if (errorMsg.includes('non autorisé') || errorMsg.includes('propriétaire') || 
            errorMsg.includes('UNAUTHORIZED') || errorMsg.includes('401')) {
          toast.error('Vous n\'êtes pas autorisé à accéder à cet établissement');
          history.push('/places');
          return;
        }
        
        setError(errorMsg);
        toast.error('Erreur lors du chargement des données');
      }
    };
    
    // Charger les données (le backend vérifiera aussi la propriété)
    loadData();
  }, [params.id, auth, loadPlace, loadTables, allPlaces, history]);

  // Fonction pour charger les statistiques récapitulatives
  const loadPlaceStats = React.useCallback(async (forceRefresh = false) => {
    if (!params.id || !auth?.token) return;
    
    setLoadingStats(true);
    try {
      const response = forceRefresh
        ? await refreshPlaceStats(params.id, auth.token)
        : await fetchPlaceStats(params.id, auth.token);
      
      // Extraire les données depuis la réponse standardisée { success: true, data: {...} }
      let stats = response?.data || response;
      
      // Si stats est un objet avec les propriétés attendues, l'utiliser directement
      // Sinon, essayer de construire l'objet depuis les propriétés disponibles
      if (!stats || typeof stats !== 'object') {
        stats = {
          tables_count: 0,
          orders_today: 0,
          orders_week: 0
        };
      }
      
      // S'assurer que toutes les propriétés existent avec des valeurs par défaut
      const normalizedStats = {
        tables_count: stats.tables_count ?? stats.tablesCount ?? (tables?.length || 0),
        orders_today: stats.orders_today ?? stats.ordersToday ?? 0,
        orders_week: stats.orders_week ?? stats.ordersWeek ?? 0
      };
      
      setPlaceStats(normalizedStats);
    } catch (err) {
      console.error('Erreur lors du chargement des stats:', err);
      // En cas d'erreur, utiliser les données locales disponibles
      setPlaceStats({
        tables_count: tables?.length || 0,
        orders_today: 0,
        orders_week: 0
      });
    } finally {
      setLoadingStats(false);
    }
  }, [params.id, auth?.token, tables?.length]);

  // Charger les statistiques récapitulatives au montage uniquement
  // Ne pas recharger à chaque changement de tables/categories pour éviter les appels excessifs
  useEffect(() => {
    if (params.id && auth?.token) {
      loadPlaceStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, auth?.token]); // Retirer loadPlaceStats, tables.length, place?.categories?.length des dépendances

  // Fonction pour notifier Places.js des modifications
  const notifyPlacesPage = React.useCallback((eventType) => {
    // Déclencher un événement personnalisé pour notifier Places.js avec les stats actuelles
    const event = new CustomEvent('place:stats-updated', {
      detail: {
        placeId: params.id,
        eventType: eventType, // 'table-changed', 'menu-changed', 'order-changed'
        stats: placeStats, // Inclure les stats actuelles pour synchronisation immédiate
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  }, [params.id, placeStats]);

  // Rafraîchissement périodique des stats (toutes les 60 secondes pour réduire la charge)
  useEffect(() => {
    if (!params.id || !auth?.token) return;

    const interval = setInterval(() => {
      loadPlaceStats(false); // Utiliser le cache si disponible, sinon rafraîchir
    }, 60000); // 60 secondes au lieu de 30 pour réduire la charge serveur

    return () => clearInterval(interval);
  }, [params.id, auth?.token, loadPlaceStats]);

  // Écouter les nouvelles commandes via WebSocket pour rafraîchir les stats
  useEffect(() => {
    if (!params.id) return;

    const handleNewOrder = () => {
      // Rafraîchir les stats après une nouvelle commande
      setTimeout(() => {
        loadPlaceStats(true); // Forcer le rafraîchissement
      }, 1000); // Petit délai pour laisser le temps à la DB de s'actualiser
    };
    
    // Créer une connexion WebSocket temporaire pour écouter les nouvelles commandes
    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      socket.emit('join-place', params.id);
    });

    socket.on('new-order', (data) => {
      if (data && (data.placeId === params.id || data.place_id === params.id)) {
        handleNewOrder();
      }
    });

    socket.on('order-status-changed', (data) => {
      if (data && (data.placeId === params.id || data.place_id === params.id)) {
        handleNewOrder();
      }
    });

    socket.on('connect_error', (error) => {
      console.warn('WebSocket connection error (stats will still refresh periodically):', error.message);
    });

    return () => {
      if (socket && socket.connected) {
        socket.emit('leave-place', params.id);
        socket.disconnect();
      }
    };
  }, [params.id, loadPlaceStats]);

  // Fonctions de gestion
  const hideModal = () => {
    setMenuItemFormShow(false);
    setSelectedCategoryForItem(null);
    setSelectedItemToEdit(null);
  };
  const hideQRModal = () => setQrCode(false);

  const onRemovePlace = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeletingPlace(true);
    try {
      const response = await deletePlace();
      
      // Vérifier que la suppression a réussi
      if (response === null) {
        throw new Error('Erreur lors de la suppression de l\'établissement');
      }
      
      // Afficher un message de succès avec les statistiques si disponibles
      const deletedStats = response?.data?.deletedStats;
      let successMessage = 'Établissement supprimé avec succès';
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
      
      showSnackbarWithUndo(
        successMessage,
        async () => {
          // Note: L'undo de suppression d'établissement nécessiterait de recréer toutes les données
          toast.info('La restauration complète n\'est pas disponible');
        },
        { duration: 5000 }
      );
      setShowDeleteModal(false);
      history.push('/places');
    } catch (e) {
      const errorMessage = e?.message || "Erreur lors de la suppression de l'établissement.";
      toast.error(errorMessage);
    } finally {
      setDeletingPlace(false);
    }
  };

  const onUpdatePlace = (tables) => {
    updatePlaceData({ number_of_tables: tables }).then((json) => {
      if (json) {
        toast.success('Nombre de tables mis à jour');
      }
    });
  };

  // Gestion des catégories
  const handleAddCategory = async () => {
    if (newCategoryName.trim().length < 2) {
      setCategoryError("Le nom doit contenir au moins 2 caractères.");
      return;
    }
    setAddingCategory(true);
    setError(null);
    try {
      await addCategoryData({ name: newCategoryName.trim() });
      toast.success('Catégorie ajoutée avec succès');
      setShowAddCategory(false);
      setNewCategoryName("");
      setCategoryError("");
      // La mise à jour optimiste a déjà été faite dans usePlaceData
      await loadPlaceStats(true); // Forcer le rafraîchissement
      notifyPlacesPage('menu-changed'); // Notifier Places.js
    } catch (e) {
      const errorMsg = e.message || "Erreur lors de l'ajout de la catégorie";
      toast.error(errorMsg);
      setError(errorMsg);
      setCategoryError(errorMsg);
    } finally {
      setAddingCategory(false);
    }
  };

  const handleUpdateCategory = async (categoryId, data) => {
    try {
      if (categoryId === null) {
        // Créer une nouvelle catégorie
        await addCategoryData(data);
        toast.success('Catégorie créée avec succès');
        // Recharger les données pour afficher la nouvelle catégorie
        await loadPlace();
        await loadPlaceStats(true); // Forcer le rafraîchissement
        notifyPlacesPage('menu-changed'); // Notifier Places.js
      } else {
        // Mettre à jour une catégorie existante
        await updateCategoryData(categoryId, data);
        toast.success('Catégorie mise à jour avec succès');
        // Recharger les données pour mettre à jour l'affichage
        await loadPlace();
        await loadPlaceStats(true); // Forcer le rafraîchissement
        notifyPlacesPage('menu-changed'); // Notifier Places.js
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de la mise à jour de la catégorie';
      toast.error(errorMsg);
      setError(errorMsg);
      throw err;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    setCategoryToDelete(category);
    setShowDeleteCategoryModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      const response = await deleteCategory(categoryToDelete.id);
      
      // Le message de succès est déjà affiché dans deleteCategory
      // Mais on peut afficher un message supplémentaire avec le nom de la catégorie
      const deletedItemsCount = response?.data?.deletedItemsCount;
      if (deletedItemsCount !== undefined && deletedItemsCount > 0) {
        // Le message avec le nombre d'items est déjà affiché dans deleteCategory
      }
      
      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
      // La mise à jour optimiste a déjà été faite dans usePlaceData
      await loadPlaceStats(true); // Forcer le rafraîchissement
    } catch (err) {
      console.error('Erreur suppression catégorie:', err);
      let errorMsg = err.message || 'Erreur lors de la suppression de la catégorie';
      
      // Message plus spécifique pour les erreurs 400
      if (errorMsg.includes('Impossible de supprimer') || errorMsg.includes('contient')) {
        errorMsg = 'Cette catégorie contient des plats. Veuillez d\'abord supprimer ou déplacer les plats, ou redémarrer le serveur backend pour activer la suppression en cascade.';
      }
      
      // Le toast d'erreur est déjà affiché dans deleteCategory
      setError(errorMsg);
      // Ne pas fermer la modal en cas d'erreur pour que l'utilisateur puisse réessayer
    }
  };

  const handleReorderCategories = async (newOrder) => {
    // Mettre à jour l'ordre des catégories
    // Note: Cette fonctionnalité nécessiterait un endpoint API pour mettre à jour l'ordre
    // Pour l'instant, on peut juste mettre à jour localement
    try {
      // Si l'API supporte l'ordre, mettre à jour chaque catégorie avec son nouvel ordre
      // await Promise.all(newOrder.map((cat, index) => 
      //   updateCategory(cat.id, { order: index }, auth.token)
      // ));
      toast.info('Réorganisation enregistrée (fonctionnalité à implémenter côté API)');
      await loadPlace();
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de la réorganisation';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  // Placeholders pour le menu si non présent
  const categories = place?.categories || [];
  
  // Log pour déboguer les catégories (en développement uniquement)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && place) {
      const categoriesDetail = categories.map(c => {
        // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
        const items = c.menu_items || c.menuItems || c.items || [];
        return {
          id: c.id,
          name: c.name,
          itemsCount: items.length,
          items: items.map(i => ({ 
            id: i.id, 
            name: i.name, 
            price: i.price,
            isAvailable: i.isAvailable !== undefined ? i.isAvailable : i.is_available
          })),
          hasMenuItems: !!(c.menu_items || c.menuItems),
          hasItems: !!c.items,
          menuItemsKeys: items.length > 0 ? Object.keys(items[0] || {}) : []
        };
      });
      
      console.log('[Place] Catégories mises à jour:', {
        categoriesCount: categories.length,
        categories: categoriesDetail,
        placeCategories: place?.categories?.length || 0,
        placeHasCategories: !!place?.categories
      });
    }
  }, [categories, place]);

  // Gestion des items de menu
  const handleAddItem = (category) => {
    // Permettre d'ajouter un plat même sans catégorie (la catégorie sera créée si nécessaire)
    setSelectedCategoryForItem(category);
    setSelectedItemToEdit(null); // S'assurer qu'on est en mode création
    setMenuItemFormShow(true);
  };

  const handleEditItem = (item, category) => {
    setSelectedItemToEdit(item);
    setSelectedCategoryForItem(category);
    setMenuItemFormShow(true);
  };

  const handleUpdateItem = async (itemId, data) => {
    try {
      await updateMenuItemData(itemId, data);
      toast.success('Plat mis à jour avec succès');
      // La mise à jour optimiste a déjà été faite dans usePlaceData
      await loadPlaceStats(true); // Forcer le rafraîchissement
      notifyPlacesPage('menu-changed'); // Notifier Places.js
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de la mise à jour du plat';
      toast.error(errorMsg);
      setError(errorMsg);
      throw err;
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    // Trouver l'item dans toutes les catégories
    let itemToDelete = null;
    for (const category of categories) {
      // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
      const items = category.menu_items || category.menuItems || [];
      const item = items.find(i => i.id === itemId);
      if (item) {
        itemToDelete = { ...item, categoryName: category.name };
        break;
      }
    }
    
    if (!itemToDelete) {
      itemToDelete = { id: itemId, name: itemName || 'ce plat' };
    }
    
    setItemToDelete(itemToDelete);
    setShowDeleteItemModal(true);
  };

  // Duplication d'un plat
  const handleDuplicateItem = async (item, category) => {
    try {
      // Si item est un ID (ancien format), trouver l'item
      let itemToDuplicate = item;
      let categoryForItem = category;
      
      if (typeof item === 'string' || typeof item === 'number') {
        // Format ancien : itemId seulement
        itemToDuplicate = null;
        categoryForItem = null;
        
        for (const cat of categories) {
          // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
          const items = cat.menu_items || cat.menuItems || [];
          const foundItem = items.find(i => i.id === item);
          if (foundItem) {
            itemToDuplicate = foundItem;
            categoryForItem = cat;
            break;
          }
        }
      }
      
      if (!itemToDuplicate || !categoryForItem) {
        toast.error('Plat introuvable');
        return;
      }

      // Créer une copie avec " (Copie)" ajouté au nom
      const duplicatedItem = await addMenuItems({
        placeId: place?.id || params.id,
        categoryId: categoryForItem.id,
        name: `${itemToDuplicate.name} (Copie)`,
        price: itemToDuplicate.price,
        description: itemToDuplicate.description || '',
        imageUrl: itemToDuplicate.image || itemToDuplicate.imageUrl || itemToDuplicate.image_url || '',
        isAvailable: itemToDuplicate.isAvailable !== undefined ? itemToDuplicate.isAvailable : (itemToDuplicate.is_available !== false)
      }, auth.token);

      if (duplicatedItem) {
        toast.success(`Plat "${itemToDuplicate.name}" dupliqué avec succès`);
        // Recharger pour afficher le nouveau plat dupliqué
        await loadPlace(true);
        await loadPlaceStats(true); // Forcer le rafraîchissement
      }
    } catch (err) {
      toast.error('Erreur lors de la duplication du plat');
      console.error(err);
    }
  };

  // Actions en masse
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${selectedItems.size} plat${selectedItems.size > 1 ? 's' : ''} ?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const deletePromises = Array.from(selectedItems).map(itemId => deleteMenuItem(itemId));
      await Promise.all(deletePromises);
      toast.success(`${selectedItems.size} plat${selectedItems.size > 1 ? 's' : ''} supprimé${selectedItems.size > 1 ? 's' : ''} avec succès`);
      setSelectedItems(new Set());
      setIsSelectMode(false);
      // Les mises à jour optimistes ont déjà été faites dans usePlaceData
      await loadPlaceStats(true); // Forcer le rafraîchissement
    } catch (err) {
      toast.error('Erreur lors de la suppression en masse');
    }
  };

  const handleBulkToggleAvailability = async (makeAvailable) => {
    if (selectedItems.size === 0) return;

    try {
      const updatePromises = Array.from(selectedItems).map(itemId => 
        updateMenuItemData(itemId, { isAvailable: makeAvailable })
      );
      await Promise.all(updatePromises);
      toast.success(`${selectedItems.size} plat${selectedItems.size > 1 ? 's' : ''} ${makeAvailable ? 'activé' : 'désactivé'}${selectedItems.size > 1 ? 's' : ''} avec succès`);
      setSelectedItems(new Set());
      setIsSelectMode(false);
      // Les mises à jour optimistes ont déjà été faites dans usePlaceData
    } catch (err) {
      toast.error('Erreur lors de la modification en masse');
    }
  };

  // Toggle disponibilité d'un seul item avec mise à jour instantanée
  const handleToggleItemAvailability = async (itemId, currentAvailability) => {
    try {
      const newAvailability = !currentAvailability;
      
      // Mise à jour backend (mise à jour optimiste dans usePlaceData)
      await updateMenuItemData(itemId, { isAvailable: newAvailability });
      
      toast.success(`Plat ${newAvailability ? 'activé' : 'désactivé'} avec succès`);
      
      // La mise à jour optimiste a déjà été faite dans usePlaceData
      await loadPlaceStats(true); // Forcer le rafraîchissement
    } catch (err) {
      toast.error('Erreur lors de la mise à jour de la disponibilité');
      // En cas d'erreur, usePlaceData restaure déjà l'état précédent
      await loadPlaceStats(true); // Forcer le rafraîchissement
    }
  };


  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteMenuItem(itemToDelete.id);
      // Le message de succès est déjà affiché dans deleteMenuItem
      // Mais on peut afficher un message supplémentaire avec le nom du plat
      toast.success(`Plat "${itemToDelete.name}" supprimé avec succès`);
      setShowDeleteItemModal(false);
      setItemToDelete(null);
      // La mise à jour optimiste a déjà été faite dans usePlaceData
      await loadPlaceStats(true); // Forcer le rafraîchissement
      notifyPlacesPage('menu-changed'); // Notifier Places.js
    } catch (err) {
      // Le toast d'erreur est déjà affiché dans deleteMenuItem
      const errorMsg = err.message || 'Erreur lors de la suppression du plat';
      setError(errorMsg);
      setShowDeleteItemModal(false);
      setItemToDelete(null);
    }
  };

  // Fonction pour changer de restaurant
  const handlePlaceChange = (placeId) => {
    setSelectedPlaceId(placeId);
    setShowPlaceSelector(false);
    // Rediriger vers la nouvelle page du restaurant
    history.push(`/places/${placeId}`);
  };

  // Obtenir le restaurant actuellement sélectionné (celui de l'URL)
  const currentPlaceId = params.id;
  const currentPlace = allPlaces.find(p => p.id === currentPlaceId) || place;

  // Fonctions helper pour détecter l'état actif de chaque bouton (comme dans Places.js)
  const isTablesActive = () => {
    return location.pathname === `/places/${currentPlaceId}` && 
           !location.pathname.includes('/settings') && 
           !location.pathname.includes('/orders') && 
           !location.pathname.includes('/edit') && 
           (!location.hash || location.hash === '#tables' || location.hash === '');
  };

  const isMenuActive = () => {
    return location.pathname === `/places/${currentPlaceId}` && location.hash === '#menu';
  };

  const isOrdersActive = () => {
    return location.pathname.includes('/orders');
  };

  const isSettingsActive = () => {
    return location.pathname.includes('/edit');
  };

  // État pour le menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full font-display bg-light-surface">
      {/* SideNavBar - Fixe lors du scroll */}
      <aside className={`hidden lg:flex w-64 flex-col justify-between border-r border-gray-border bg-card-surface p-4 flex-shrink-0 sticky top-0 h-screen overflow-y-auto`}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-3">
            <h1 className="text-dark-text text-2xl font-bold tracking-tight">MenuHub</h1>
          </div>

          {/* Sélecteur de restaurant */}
          {allPlaces.length > 1 && (
            <div className="relative place-selector-container">
              <button
                onClick={() => setShowPlaceSelector(!showPlaceSelector)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 bg-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/50 animate-pulse"></div>
                  <span className="text-sm font-semibold text-dark-text truncate">
                    {currentPlace?.name || 'Sélectionner...'}
                  </span>
                </div>
                {showPlaceSelector ? (
                  <ChevronUp className="w-4 h-4 text-muted-text flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-text flex-shrink-0" />
                )}
              </button>
              
              {showPlaceSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                  {allPlaces.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePlaceChange(p.id)}
                      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                        p.id === currentPlaceId ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        p.id === currentPlaceId 
                          ? 'bg-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/50 animate-pulse' 
                          : 'bg-gray-300'
                      }`}></div>
                      <span className={`text-sm font-medium truncate ${
                        p.id === currentPlaceId 
                          ? 'text-primary' 
                          : 'text-dark-text'
                      }`}>
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Widget récapitulatif - Identique à Places.js */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-dark-text mb-3">Récapitulatif</h3>
            <PlaceStats 
              stats={placeStats ? {
                tables_count: placeStats.tables_count ?? placeStats.tablesCount ?? tables?.length ?? 0,
                orders_today: placeStats.orders_today ?? placeStats.ordersToday ?? 0,
                orders_week: placeStats.orders_week ?? placeStats.ordersWeek ?? 0
              } : null}
              isLoading={loadingStats}
            />
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                history.push(`/places/${currentPlaceId}#tables`);
                setTimeout(() => {
                  const element = document.getElementById('tables');
                  if (element) {
                    const headerOffset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }, 100);
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200 ${
                isTablesActive()
                  ? 'bg-[#16a34a]/10 text-[#16a34a] shadow-sm'
                  : 'text-muted-text hover:bg-[#16a34a]/10 hover:text-[#16a34a] active:bg-[#16a34a]/20'
              } focus:outline-none focus:ring-2 focus:ring-[#16a34a] group`}
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
                history.push(`/places/${currentPlaceId}#menu`);
                setTimeout(() => {
                  const element = document.getElementById('menu');
                  if (element) {
                    const headerOffset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }, 300);
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200 ${
                isMenuActive()
                  ? 'bg-[#6C63FF]/10 text-[#6C63FF] shadow-sm'
                  : 'text-muted-text hover:bg-[#6C63FF]/10 hover:text-[#6C63FF] active:bg-[#6C63FF]/20'
              } focus:outline-none focus:ring-2 focus:ring-[#6C63FF] group`}
            >
              <UtensilsCrossed className="w-5 h-5 flex-shrink-0" />
              <span className="text-base flex-1 text-left">Menu</span>
              {isMenuActive() && (
                <ChevronRight className="w-4 h-4 text-[#6C63FF] flex-shrink-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() => history.push(`/places/${currentPlaceId}/orders`)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200 ${
                isOrdersActive()
                  ? 'bg-[#FFD600]/10 text-[#FFD600] shadow-sm'
                  : 'text-muted-text hover:bg-[#FFD600]/10 hover:text-[#FFD600] active:bg-[#FFD600]/20'
              } focus:outline-none focus:ring-2 focus:ring-[#FFD600] group`}
            >
              <ShoppingCart className="w-5 h-5 flex-shrink-0" />
              <span className="text-base flex-1 text-left">Commandes</span>
              {isOrdersActive() && (
                <ChevronRight className="w-4 h-4 text-[#FFD600] flex-shrink-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() => history.push(`/places/${currentPlaceId}/edit`)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200 ${
                isSettingsActive()
                  ? 'bg-[#1f1f1f]/10 text-[#1f1f1f] shadow-sm'
                  : 'text-muted-text hover:bg-[#1f1f1f]/10 hover:text-[#1f1f1f] active:bg-[#1f1f1f]/20'
              } focus:outline-none focus:ring-2 focus:ring-[#1f1f1f] group`}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed lg:hidden top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 px-3">
                <h1 className="text-dark-text text-2xl font-bold tracking-tight">MenuHub</h1>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-[#FF5A1F] hover:border-[#FF5A1F] hover:shadow-md transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 text-[#FF5A1F] hover:text-white transition-colors duration-200" />
              </button>
            </div>

            {/* Sélecteur de restaurant mobile */}
            {allPlaces.length > 1 && (
              <div className="relative place-selector-container">
                <button
                  onClick={() => setShowPlaceSelector(!showPlaceSelector)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-white hover:border-[#FF5A1F]/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0 bg-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/50 animate-pulse"></div>
                    <span className="text-sm font-semibold text-dark-text truncate">
                      {currentPlace?.name || 'Sélectionner...'}
                    </span>
                  </div>
                  {showPlaceSelector ? (
                    <ChevronUp className="w-4 h-4 text-muted-text flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-text flex-shrink-0" />
                  )}
                </button>
                
                {showPlaceSelector && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                    {allPlaces.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          handlePlaceChange(p.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                          p.id === currentPlaceId ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          p.id === currentPlaceId 
                            ? 'bg-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/50 animate-pulse' 
                            : 'bg-gray-300'
                        }`}></div>
                        <span className={`text-sm font-medium truncate ${
                          p.id === currentPlaceId 
                            ? 'text-primary' 
                            : 'text-dark-text'
                        }`}>
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation mobile */}
            <nav className="flex flex-col gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  history.push(`/places/${currentPlaceId}#tables`);
                  setTimeout(() => {
                    const element = document.getElementById('tables');
                    if (element) {
                      const headerOffset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }, 100);
                }}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-semibold transition-all duration-200 ${
                  isTablesActive()
                    ? 'bg-[#16a34a] text-white shadow-md shadow-[#16a34a]/30'
                    : 'text-gray-700 bg-gray-50 hover:bg-[#16a34a]/10 hover:text-[#16a34a] active:bg-[#16a34a]/20 border border-transparent hover:border-[#16a34a]/20'
                } focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-2 group`}
              >
                <Table2 className={`w-5 h-5 flex-shrink-0 ${isTablesActive() ? 'text-white' : 'text-[#16a34a]'}`} />
                <span className="text-base flex-1 text-left">Tables</span>
                {isTablesActive() && (
                  <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  history.push(`/places/${currentPlaceId}#menu`);
                  setTimeout(() => {
                    const element = document.getElementById('menu');
                    if (element) {
                      const headerOffset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }, 300);
                }}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-semibold transition-all duration-200 ${
                  isMenuActive()
                    ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/30'
                    : 'text-gray-700 bg-gray-50 hover:bg-[#6C63FF]/10 hover:text-[#6C63FF] active:bg-[#6C63FF]/20 border border-transparent hover:border-[#6C63FF]/20'
                } focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 group`}
              >
                <UtensilsCrossed className={`w-5 h-5 flex-shrink-0 ${isMenuActive() ? 'text-white' : 'text-[#6C63FF]'}`} />
                <span className="text-base flex-1 text-left">Menu</span>
                {isMenuActive() && (
                  <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  history.push(`/places/${currentPlaceId}/orders`);
                }}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-semibold transition-all duration-200 ${
                  isOrdersActive()
                    ? 'bg-[#FFD600] text-gray-900 shadow-md shadow-[#FFD600]/30'
                    : 'text-gray-700 bg-gray-50 hover:bg-[#FFD600]/10 hover:text-[#FFD600] active:bg-[#FFD600]/20 border border-transparent hover:border-[#FFD600]/20'
                } focus:outline-none focus:ring-2 focus:ring-[#FFD600] focus:ring-offset-2 group`}
              >
                <ShoppingCart className={`w-5 h-5 flex-shrink-0 ${isOrdersActive() ? 'text-gray-900' : 'text-[#FFD600]'}`} />
                <span className="text-base flex-1 text-left">Commandes</span>
                {isOrdersActive() && (
                  <ChevronRight className="w-4 h-4 text-gray-900 flex-shrink-0" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  history.push(`/places/${currentPlaceId}/edit`);
                }}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-semibold transition-all duration-200 ${
                  isSettingsActive()
                    ? 'bg-[#1f1f1f] text-white shadow-md shadow-[#1f1f1f]/30'
                    : 'text-gray-700 bg-gray-50 hover:bg-[#1f1f1f]/10 hover:text-[#1f1f1f] active:bg-[#1f1f1f]/20 border border-transparent hover:border-[#1f1f1f]/20'
                } focus:outline-none focus:ring-2 focus:ring-[#1f1f1f] focus:ring-offset-2 group`}
              >
                <Settings className={`w-5 h-5 flex-shrink-0 ${isSettingsActive() ? 'text-white' : 'text-[#1f1f1f]'}`} />
                <span className="text-base flex-1 text-left">Paramètres</span>
                {isSettingsActive() && (
                  <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />
                )}
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col bg-light-surface min-h-0">
        {/* Header établissement */}
        <header className="bg-card-surface/80 backdrop-blur-sm shadow-custom-light sticky top-0 z-30 border-b border-gray-border transition-all duration-200 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-[32px] py-4 sm:py-5 lg:py-[20px] flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Bouton retour */}
              <BackButton 
                onClick={() => history.push('/places')} 
                ariaLabel="Retour à la liste des établissements"
              />
              {/* Bouton menu mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-lg bg-white border border-gray-200 hover:bg-[#FF5A1F] hover:border-[#FF5A1F] hover:shadow-md transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center relative z-50 shadow-sm"
                aria-label="Ouvrir le menu"
              >
                <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF5A1F] hover:text-white transition-colors duration-200" />
              </button>
              <div className="w-3 h-3 rounded-full bg-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/50 animate-pulse flex-shrink-0"></div>
              <h1 className="text-lg sm:text-xl font-bold text-dark-text truncate">{currentPlace?.name || place?.name || 'Chargement...'}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-[20px]">
              <Button
                variant="light"
                onClick={() => history.push(`/places/${currentPlaceId}/edit`)}
                icon={<Edit className="w-4 h-4 sm:w-5 sm:h-5" />}
                title="Paramètres de l'établissement"
                className="text-xs sm:text-sm px-2 sm:px-4 min-h-[44px]"
              >
                <span className="hidden sm:inline">Paramètres</span>
                <span className="sm:hidden">⚙️</span>
              </Button>
              <Button
                variant="danger"
                onClick={onRemovePlace}
                icon={<Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                title="Supprimer l'établissement"
                className="text-xs sm:text-sm px-2 sm:px-4 min-h-[44px]"
              >
                <span className="hidden sm:inline">Supprimer</span>
                <span className="sm:hidden">🗑️</span>
              </Button>
            </div>
          </div>
          
          {/* Indicateur de chargement global */}
          {placeLoading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
              <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}
          
          {/* Message d'erreur global */}
          {error && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-50 border-t border-red-200 px-4 py-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700 flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </header>

        <div className="container mx-auto px-4 sm:px-6 lg:px-[32px] py-4 sm:py-6 lg:py-[32px] flex-grow min-h-0">
          {/* État de chargement global */}
          {placeLoading && !place && (
            <div className="flex items-center justify-center py-16">
              <Loader text="Chargement des données..." />
            </div>
          )}
          
          {/* Contenu principal */}
          {!placeLoading || place ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-[32px]">
            {/* Section Tables */}
            <div className="lg:col-span-2">
              <section id="tables" className="scroll-mt-20">
                <h2 className="text-lg sm:text-xl lg:text-[22px] font-bold text-dark-text mb-4 sm:mb-5 lg:mb-[20px]">Tables</h2>
              <div className="bg-white rounded-lg shadow-custom-light p-3 sm:p-4 border border-gray-border">
                <TablesManagerModern
                  placeId={place?.id || params.id}
                  token={auth.token}
                  tables={tables}
                  loading={placeLoading}
                  onAddTable={async (tableData) => {
                    const result = await addTableData(tableData);
                    await loadPlaceStats(true); // Forcer le rafraîchissement
                    notifyPlacesPage('table-changed'); // Notifier Places.js
                    return result;
                  }}
                  onUpdateTable={async (tableId, data) => {
                    await updateTableData(tableId, data);
                    await loadPlaceStats(true); // Forcer le rafraîchissement
                    notifyPlacesPage('table-changed'); // Notifier Places.js
                  }}
                  onDeleteTable={async (tableId) => {
                    try {
                      await deleteTable(tableId);
                      // Rafraîchir les statistiques après suppression réussie
                      await loadPlaceStats(true);
                      notifyPlacesPage('table-changed'); // Notifier Places.js
                    } catch (err) {
                      console.error('Erreur suppression table:', err);
                      // L'erreur est déjà gérée dans deleteTable (rechargement + toast)
                      throw err; // Propager l'erreur pour que le composant puisse l'afficher
                    }
                  }}
                  onRefresh={async () => {
                    await loadTables();
                    await loadPlaceStats(true); // Forcer le rafraîchissement
                  }}
                />
              </div>
              </section>

              {/* Section Menu */}
              <section id="menu" className="mt-4 sm:mt-6 lg:mt-[32px] scroll-mt-20">
              <div className="flex flex-col gap-3 mb-4 sm:mb-5 lg:mb-[20px]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg sm:text-xl lg:text-[22px] font-bold text-dark-text">Menu</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Toggle vue grille/liste */}
                    <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setViewMode('list');
                        }}
                        className={`p-1.5 rounded transition-all ${
                          viewMode === 'list' 
                            ? 'bg-primary text-white shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                        }`}
                        title="Vue liste"
                        aria-label="Vue liste"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setViewMode('grid');
                        }}
                        className={`p-1.5 rounded transition-all ${
                          viewMode === 'grid' 
                            ? 'bg-primary text-white shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                        }`}
                        title="Vue grille"
                        aria-label="Vue grille"
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Toggle mode sélection */}
                    {categories.length > 0 && (
                    <Button
                      variant="light"
                      onClick={() => {
                        setIsSelectMode(!isSelectMode);
                        if (isSelectMode) setSelectedItems(new Set());
                      }}
                      icon={isSelectMode ? <X className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                      className={`text-xs sm:text-sm ${isSelectMode ? 'bg-primary/10 text-primary' : ''}`}
                      title={isSelectMode ? 'Annuler la sélection' : 'Sélection multiple'}
                    >
                      <span className="hidden sm:inline">{isSelectMode ? 'Annuler' : 'Sélection'}</span>
                    </Button>
                    )}
                    {/* Bouton ajouter un plat - toujours visible */}
                    <Button
                      onClick={() => handleAddItem(null)}
                      icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                      className="text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <span className="hidden sm:inline">Ajouter un plat</span>
                      <span className="sm:hidden">Ajouter plat</span>
                    </Button>
                    {/* Bouton ajouter une catégorie */}
                    <Button
                      variant="light"
                      onClick={() => setShowAddCategory(true)}
                      icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                      className="text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <span className="hidden sm:inline">Ajouter une catégorie</span>
                      <span className="sm:hidden">Ajouter catégorie</span>
                    </Button>
                  </div>
                </div>

                {/* Barre d'actions en masse */}
                {isSelectMode && selectedItems.size > 0 && (
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium text-primary">
                      {selectedItems.size} plat{selectedItems.size > 1 ? 's' : ''} sélectionné{selectedItems.size > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleBulkToggleAvailability(true)}
                        className="text-xs"
                      >
                        Activer
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleBulkToggleAvailability(false)}
                        className="text-xs"
                      >
                        Désactiver
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="text-xs"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Liste des catégories avec leurs items */}
              <div className="space-y-4">
                <CategoryListEnhanced
                  categories={categories}
                  loading={placeLoading}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onReorderCategories={handleReorderCategories}
                  onAddItem={handleAddItem}
                  onEditItem={handleEditItem}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  onDuplicateItem={handleDuplicateItem}
                  onToggleItemAvailability={handleToggleItemAvailability}
                  placeId={place?.id || params.id}
                  searchQuery={categorySearchQuery}
                  searchInputValue={categorySearchInput}
                  onSearchChange={setCategorySearchInput}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={(newSortBy, newSortOrder) => {
                    // Si un ordre est fourni, l'utiliser, sinon basculer si même critère
                    if (newSortOrder) {
                      setSortBy(newSortBy);
                      setSortOrder(newSortOrder);
                    } else if (sortBy === newSortBy) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(newSortBy);
                      setSortOrder('asc');
                    }
                  }}
                  filterAvailable={filterAvailable}
                  onFilterChange={setFilterAvailable}
                  viewMode={viewMode}
                  isSelectMode={isSelectMode}
                  selectedItems={selectedItems}
                  onToggleItemSelection={(itemId) => {
                    const newSelected = new Set(selectedItems);
                    if (newSelected.has(itemId)) {
                      newSelected.delete(itemId);
                    } else {
                      newSelected.add(itemId);
                    }
                    setSelectedItems(newSelected);
                  }}
                  onSelectAll={(itemIds) => {
                    setSelectedItems(new Set(itemIds));
                  }}
                  onDeselectAll={() => {
                    setSelectedItems(new Set());
                  }}
                />
              </div>
              </section>
            </div>
          </div>
          ) : null}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-[32px] sm:right-[32px] bg-primary text-light-text rounded-lg shadow-custom-orange p-3 sm:p-4 flex items-center justify-center gap-x-2 hover:bg-primary/90 transition-colors z-50 hover:scale-105 transform transition-transform focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => history.push(`/qrcodes/${currentPlaceId}`)}
        aria-label="Générer le QR global"
      >
        <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="font-bold text-sm sm:text-lg hidden sm:inline">Générer QR</span>
      </button>

      {/* Modals */}
      {/* Modal de confirmation suppression établissement */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer l'établissement ?"
        itemName={place?.name || ''}
        itemType="restaurant"
        requiresConfirmation={true}
        confirmationPlaceholder={`Saisir "${place?.name || 'nom de l\'établissement'}"`}
        isLoading={deletingPlace}
      />

      {/* Modal ajout catégorie */}
      <Modal
        show={showAddCategory}
        onHide={() => {
          setShowAddCategory(false);
          setNewCategoryName("");
          setCategoryError("");
        }}
        size="sm"
        ariaLabel="Ajouter une catégorie"
      >
        <h3 className="text-lg font-bold text-dark-text mb-4">Ajouter une catégorie</h3>
        <Input
          type="text"
          placeholder="Nom de la catégorie"
          value={newCategoryName}
          onChange={(e) => {
            setNewCategoryName(e.target.value);
            if (e.target.value.trim().length < 2) {
              setCategoryError("Le nom doit contenir au moins 2 caractères.");
            } else {
              setCategoryError("");
            }
          }}
          disabled={addingCategory}
          autoFocus
          error={categoryError}
          aria-label="Nom de la catégorie"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="light"
            onClick={() => {
              setShowAddCategory(false);
              setNewCategoryName("");
              setCategoryError("");
            }}
            disabled={addingCategory}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim() || addingCategory || !!categoryError}
            loading={addingCategory}
          >
            Ajouter
          </Button>
        </div>
      </Modal>

      {/* Modal ajout/modification item */}
      <Modal
        show={menuItemFormShow}
        onHide={hideModal}
        size="md"
        ariaLabel={selectedItemToEdit ? "Modifier le plat" : (selectedCategoryForItem ? "Ajouter un plat à la catégorie" : "Ajouter un plat")}
      >
        <MenuItemForm 
          place={place}
          onDone={async () => { 
            // Forcer le rechargement avec un délai pour s'assurer que le backend a bien enregistré
            notifyPlacesPage('menu-changed'); // Notifier Places.js
            // Recharger pour afficher le nouveau plat ajouté
            await loadPlace(true); 
            await loadPlaceStats(true); // Forcer le rafraîchissement
            hideModal(); 
          }}
          item={selectedItemToEdit || (selectedCategoryForItem ? { category: selectedCategoryForItem.name } : {})}
        />
      </Modal>

      {/* Modal QR Code global */}
      <QRCodeModal 
        show={qrCode} 
        onHide={hideQRModal} 
        place={place || { id: params.id, number_of_tables: 0 }} 
        onUpdatePlace={onUpdatePlace}
      />

      {/* Modal confirmation suppression catégorie */}
      <DeleteConfirmModal
        isOpen={showDeleteCategoryModal}
        onClose={() => {
          setShowDeleteCategoryModal(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDeleteCategory}
        title="Supprimer la catégorie ?"
        itemName={categoryToDelete?.name || ''}
        itemType="catégorie"
        relatedItemsCount={(categoryToDelete?.menu_items || categoryToDelete?.menuItems || []).length}
        relatedItemsLabel="plat(s)"
        isLoading={false}
      />

      {/* Modal confirmation suppression plat */}
      <DeleteConfirmModal
        isOpen={showDeleteItemModal}
        onClose={() => {
          setShowDeleteItemModal(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDeleteItem}
        title="Supprimer le plat ?"
        itemName={itemToDelete?.name || ''}
        itemType="plat"
        warningMessage={itemToDelete?.categoryName 
          ? `Le plat "${itemToDelete.name}" de la catégorie "${itemToDelete.categoryName}" sera supprimé définitivement. Cette action est irréversible.`
          : undefined
        }
        isLoading={false}
      />
    </div>
  );
};

export default Place;