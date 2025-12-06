import { useState, useCallback } from 'react';
import { fetchPlace, updatePlace, removePlace } from '../services/api/places';
import { fetchTables, addTable, updateTable, removeTable } from '../services/api/tables';
import { addCategory, removeCategory, updateCategory, removeMenuItem, updateMenuItem } from '../services/api/menu';
import { toast } from '../utils/toast';

/**
 * Hook centralisé pour gérer les données d'un établissement
 */
export const usePlaceData = (placeId, token) => {
  const [place, setPlace] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les données de l'établissement
  const loadPlace = useCallback(async (forceRefresh = false) => {
    if (!placeId || !token) {
      console.warn('PlaceId ou token manquant pour charger l\'établissement');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Utiliser le cache sauf si forceRefresh est true
      const response = await fetchPlace(placeId, token, forceRefresh);
      // Extraire les données depuis la réponse standardisée { success: true, data: {...} }
      const placeData = response?.data || response;
      
      // Log pour déboguer (en développement uniquement)
      if (process.env.NODE_ENV === 'development') {
        const categoriesDetail = placeData?.categories?.map(c => ({
          id: c.id,
          name: c.name,
          itemsCount: c.menu_items?.length || 0,
          items: c.menu_items?.map(i => ({ id: i.id, name: i.name, price: i.price })) || [],
          hasMenuItems: !!c.menu_items,
          menuItemsType: Array.isArray(c.menu_items) ? 'array' : typeof c.menu_items
        })) || [];
        
        console.log('[usePlaceData] Réponse de fetchPlace:', {
          hasResponse: !!response,
          hasData: !!response?.data,
          placeDataKeys: placeData ? Object.keys(placeData) : [],
          categoriesCount: placeData?.categories?.length || 0,
          categories: categoriesDetail,
          fullPlaceData: placeData // Log complet pour voir la structure
        });
      }
      
      if (placeData) {
        // Normaliser les données : convertir menuItems (camelCase) en menu_items (snake_case)
        // pour assurer la compatibilité avec le reste du code frontend
        const normalizedPlaceData = {
          ...placeData,
          categories: placeData.categories?.map(category => ({
            ...category,
            menu_items: category.menu_items || category.menuItems || []
          })) || []
        };
        
        // Log pour déboguer (en développement uniquement)
        if (process.env.NODE_ENV === 'development') {
          console.log('[usePlaceData] Normalisation des données:', {
            originalMenuItems: placeData.categories?.[0]?.menuItems?.length || 0,
            normalizedMenuItems: normalizedPlaceData.categories?.[0]?.menu_items?.length || 0,
            hasMenuItems: !!placeData.categories?.[0]?.menuItems,
            hasMenu_items: !!placeData.categories?.[0]?.menu_items
          });
        }
        
        // Forcer une nouvelle référence pour que React détecte le changement
        setPlace(normalizedPlaceData);
      } else {
        throw new Error('Aucune donnée reçue pour cet établissement');
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'établissement:', err);
      const errorMsg = err.message || 'Erreur lors du chargement de l\'établissement';
      
      // Gérer les erreurs d'autorisation (établissement n'appartient pas à l'utilisateur)
      if (errorMsg.includes('UNAUTHORIZED') || errorMsg.includes('401') || 
          errorMsg.includes('non autorisé') || errorMsg.includes('propriétaire')) {
        toast.error('Vous n\'êtes pas autorisé à accéder à cet établissement');
        setError('Accès non autorisé');
        // Ne pas recharger pour éviter une boucle
        return;
      }
      
      setError(errorMsg);
      toast.error('Erreur lors du chargement de l\'établissement');
    } finally {
      setLoading(false);
    }
  }, [placeId, token]);

  // Charger les tables
  const loadTables = useCallback(async () => {
    if (!placeId || !token) {
      console.warn('PlaceId ou token manquant pour charger les tables');
      return;
    }
    setLoading(true);
    try {
      const response = await fetchTables(placeId, token);
      // Extraire les données depuis la réponse standardisée { success: true, data: [...] }
      const tablesData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
      
      if (tablesData) {
        setTables(tablesData);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des tables:', err);
      const errorMsg = err.message || 'Erreur lors du chargement des tables';
      if (errorMsg.includes('UNAUTHORIZED') || errorMsg.includes('401') ||
          errorMsg.includes('non autorisé') || errorMsg.includes('propriétaire')) {
        toast.error('Vous n\'êtes pas autorisé à accéder aux tables de cet établissement');
        setError('Accès non autorisé');
        return;
      }
      setError(errorMsg);
      toast.error('Erreur lors du chargement des tables');
    } finally {
      setLoading(false);
    }
  }, [placeId, token]);

  // Mettre à jour l'établissement
  const updatePlaceData = useCallback(async (data) => {
    if (!placeId || !token) return;
    try {
      const response = await updatePlace(placeId, data, token);
      // Extraire les données depuis la réponse standardisée { success: true, data: {...} }
      const updated = response?.data || response;
      if (updated) {
        setPlace(updated);
        return updated;
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de la mise à jour';
      if (errorMsg.includes('non autorisé') || errorMsg.includes('propriétaire') || 
          errorMsg.includes('UNAUTHORIZED') || errorMsg.includes('401')) {
        toast.error('Vous n\'êtes pas autorisé à modifier cet établissement');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
      throw err;
    }
  }, [placeId, token]);

  // Supprimer l'établissement
  const deletePlace = useCallback(async () => {
    if (!placeId || !token) {
      throw new Error('PlaceId ou token manquant pour supprimer l\'établissement');
    }
    try {
      const response = await removePlace(placeId, token);
      
      // Vérifier que la suppression a réussi
      if (response === null) {
        throw new Error('Erreur lors de la suppression de l\'établissement');
      }
      
      return response;
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de la suppression de l\'établissement';
      toast.error(errorMsg);
      throw err;
    }
  }, [placeId, token]);

  // Gestion des tables
  const addTableData = useCallback(async (tableData) => {
    if (!placeId || !token) return;
    try {
      const newTable = await addTable({ ...tableData, placeId: placeId, place_id: placeId }, token);
      await loadTables();
      return newTable;
    } catch (err) {
      toast.error('Erreur lors de l\'ajout de la table');
      throw err;
    }
  }, [placeId, token, loadTables]);

  const updateTableData = useCallback(async (tableId, data) => {
    if (!token) return;
    try {
      await updateTable(tableId, data, token);
      await loadTables();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour de la table');
      throw err;
    }
  }, [token, loadTables]);

  const deleteTable = useCallback(async (tableId) => {
    if (!token) {
      throw new Error('Token manquant pour supprimer la table');
    }
    
    let previousTables = null;
    
    try {
      // Sauvegarder l'état actuel et faire la mise à jour optimiste
      setTables(prevTables => {
        previousTables = [...prevTables];
        return prevTables.filter(t => t.id !== tableId);
      });
      
      // Appeler l'API de suppression
      const response = await removeTable(tableId, token);
      
      // Vérifier que la réponse indique un succès
      if (response === null) {
        // Erreur détectée (la fonction request retourne null en cas d'erreur)
        // Restaurer l'état précédent
        if (previousTables) {
          setTables(previousTables);
        } else {
          await loadTables();
        }
        throw new Error('Erreur lors de la suppression de la table');
      }
      
      // Vérifier les formats d'erreur possibles
      if (response && response.success === false) {
        // En cas d'erreur, restaurer l'état précédent
        if (previousTables) {
          setTables(previousTables);
        } else {
          await loadTables();
        }
        const errorMsg = response.error?.message || response.message || 'Erreur lors de la suppression de la table';
        throw new Error(errorMsg);
      }
      
      // Vérifier si la réponse indique un succès (format backend standard)
      // Le backend retourne { success: true, data: {...}, message: '...' }
      if (response && (response.success === true || response === true)) {
        // La suppression a réussi côté serveur
        // La mise à jour optimiste a déjà été faite, recharger pour synchroniser avec le serveur
        await loadTables();
        return response;
      }
      
      // Si la réponse est un objet sans success explicite, considérer comme succès si pas d'erreur
      // Recharger pour synchroniser
      await loadTables();
      return response || { success: true };
      
    } catch (err) {
      // En cas d'erreur, restaurer l'état précédent
      if (previousTables) {
        setTables(previousTables);
      } else {
        await loadTables();
      }
      const errorMsg = err.message || 'Erreur lors de la suppression de la table';
      toast.error(errorMsg);
      throw err;
    }
  }, [token, loadTables]);

  // Gestion des catégories
  const addCategoryData = useCallback(async (categoryData) => {
    if (!placeId || !token) return;
    try {
      const newCategory = await addCategory({ ...categoryData, placeId: placeId, place_id: placeId }, token);
      // Mise à jour optimiste : ajouter la catégorie localement sans recharger
      if (newCategory?.data) {
        setPlace(prevPlace => {
          if (!prevPlace) return prevPlace;
          return {
            ...prevPlace,
            categories: [...(prevPlace.categories || []), {
              ...newCategory.data,
              menu_items: []
            }]
          };
        });
      } else {
        // Si pas de données dans la réponse, recharger
        await loadPlace(true);
      }
      return newCategory;
    } catch (err) {
      toast.error('Erreur lors de l\'ajout de la catégorie');
      throw err;
    }
  }, [placeId, token, loadPlace]);

  const deleteCategory = useCallback(async (categoryId) => {
    if (!token) {
      throw new Error('Token manquant pour supprimer la catégorie');
    }
    
    // Mise à jour optimiste : supprimer la catégorie localement
    let previousPlace = null;
    setPlace(prevPlace => {
      if (!prevPlace) return prevPlace;
      previousPlace = prevPlace;
      return {
        ...prevPlace,
        categories: (prevPlace.categories || []).filter(c => c.id !== categoryId)
      };
    });
    
    try {
      const response = await removeCategory(categoryId, token);
      
      // Vérifier que la suppression a réussi
      if (response === null) {
        // Restaurer l'état précédent en cas d'erreur
        if (previousPlace) {
          setPlace(previousPlace);
        }
        throw new Error('Erreur lors de la suppression de la catégorie');
      }
      
      // Afficher un message avec le nombre d'items supprimés si disponible
      const deletedItemsCount = response?.data?.deletedItemsCount;
      if (deletedItemsCount !== undefined && deletedItemsCount > 0) {
        toast.success(`Catégorie et ${deletedItemsCount} plat${deletedItemsCount > 1 ? 's' : ''} supprimé${deletedItemsCount > 1 ? 's' : ''} avec succès`);
      } else {
        toast.success('Catégorie supprimée avec succès');
      }
      
      // Pas besoin de recharger, la mise à jour optimiste a déjà été faite
      return response;
    } catch (err) {
      // Restaurer l'état précédent en cas d'erreur
      if (previousPlace) {
        setPlace(previousPlace);
      }
      const errorMsg = err.message || 'Erreur lors de la suppression de la catégorie';
      toast.error(errorMsg);
      throw err;
    }
  }, [token]);

  const updateCategoryData = useCallback(async (categoryId, data) => {
    if (!token) return;
    
    // Mise à jour optimiste
    let previousPlace = null;
    setPlace(prevPlace => {
      if (!prevPlace) return prevPlace;
      previousPlace = prevPlace;
      return {
        ...prevPlace,
        categories: (prevPlace.categories || []).map(cat =>
          cat.id === categoryId ? { ...cat, ...data } : cat
        )
      };
    });
    
    try {
      await updateCategory(categoryId, data, token);
      // Pas besoin de recharger, la mise à jour optimiste a déjà été faite
    } catch (err) {
      // Restaurer l'état précédent en cas d'erreur
      if (previousPlace) {
        setPlace(previousPlace);
      }
      toast.error('Erreur lors de la mise à jour de la catégorie');
      throw err;
    }
  }, [token]);

  // Gestion des items
  const updateMenuItemData = useCallback(async (itemId, data) => {
    if (!token) return;
    
    // Mise à jour optimiste
    let previousPlace = null;
    setPlace(prevPlace => {
      if (!prevPlace) return prevPlace;
      previousPlace = prevPlace;
      return {
        ...prevPlace,
        categories: (prevPlace.categories || []).map(category => ({
          ...category,
          menu_items: (category.menu_items || []).map(item =>
            item.id === itemId ? { ...item, ...data } : item
          )
        }))
      };
    });
    
    try {
      await updateMenuItem(itemId, data, token);
      // Pas besoin de recharger, la mise à jour optimiste a déjà été faite
    } catch (err) {
      // Restaurer l'état précédent en cas d'erreur
      if (previousPlace) {
        setPlace(previousPlace);
      }
      toast.error('Erreur lors de la mise à jour de l\'item');
      throw err;
    }
  }, [token]);

  const deleteMenuItem = useCallback(async (itemId) => {
    if (!token) {
      throw new Error('Token manquant pour supprimer le plat');
    }
    
    // Mise à jour optimiste : supprimer l'item localement
    let previousPlace = null;
    setPlace(prevPlace => {
      if (!prevPlace) return prevPlace;
      previousPlace = prevPlace;
      return {
        ...prevPlace,
        categories: (prevPlace.categories || []).map(category => ({
          ...category,
          menu_items: (category.menu_items || []).filter(item => item.id !== itemId)
        }))
      };
    });
    
    try {
      const response = await removeMenuItem(itemId, token);
      
      // Vérifier que la suppression a réussi
      if (response === null) {
        // Restaurer l'état précédent en cas d'erreur
        if (previousPlace) {
          setPlace(previousPlace);
        }
        throw new Error('Erreur lors de la suppression du plat');
      }
      
      // Pas besoin de recharger, la mise à jour optimiste a déjà été faite
      return response;
    } catch (err) {
      // Restaurer l'état précédent en cas d'erreur
      if (previousPlace) {
        setPlace(previousPlace);
      }
      const errorMsg = err.message || 'Erreur lors de la suppression du plat';
      toast.error(errorMsg);
      throw err;
    }
  }, [token]);

  return {
    place,
    tables,
    loading,
    error,
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
    deleteMenuItem
  };
};

export default usePlaceData;
