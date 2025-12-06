import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { fetchPlace, addCategory, addMenuItems, updateMenuItem as updateMenuItemApi, removeMenuItem as removeMenuItemApi } from '../services';

/**
 * Hook personnalisé pour gérer le menu d'un restaurant
 * @param {string} placeId - ID du restaurant
 * @returns {Object} Objet contenant les données et méthodes du menu
 */
export const useMenu = (placeId) => {
  const [place, setPlace] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { makeRequest } = useApi();

  // Charger les données du restaurant et du menu
  const loadMenuData = useCallback(async () => {
    if (!placeId) return;
    
    setLoading(true);
    try {
      const placeData = await makeRequest(fetchPlace, placeId);
      setPlace(placeData);
      setCategories(placeData.categories || []);
      setMenuItems(placeData.menu_items || []);
    } catch (error) {
      console.error('Error loading menu data:', error);
    } finally {
      setLoading(false);
    }
  }, [placeId, makeRequest]);

  // Ajouter une catégorie
  const addCategoryToMenu = useCallback(async (categoryData) => {
    try {
      const newCategory = await makeRequest(addCategory, categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }, [makeRequest]);

  // Ajouter un article au menu
  const addItemToMenu = useCallback(async (itemData) => {
    try {
      const newItem = await makeRequest(addMenuItems, { ...itemData, placeId });
      setMenuItems(prev => [...prev, newItem]);
      return newItem;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  }, [placeId, makeRequest]);

  // Mettre à jour un article du menu
  const updateMenuItem = useCallback(async (itemId, itemData) => {
    try {
      const updatedItem = await makeRequest(updateMenuItemApi, itemId, itemData);
      setMenuItems(prev => 
        prev.map(item => item.id === itemId ? updatedItem : item)
      );
      return updatedItem;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }, [makeRequest]);

  // Supprimer un article du menu
  const removeMenuItem = useCallback(async (itemId) => {
    try {
      await makeRequest(removeMenuItemApi, itemId);
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing menu item:', error);
      throw error;
    }
  }, [makeRequest]);

  // Recharger les données
  const refreshMenu = useCallback(() => {
    loadMenuData();
  }, [loadMenuData]);

  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  return {
    place,
    categories,
    menuItems,
    loading,
    addCategory: addCategoryToMenu,
    addMenuItem: addItemToMenu,
    updateMenuItem,
    removeMenuItem,
    refreshMenu
  };
};

export default useMenu;
