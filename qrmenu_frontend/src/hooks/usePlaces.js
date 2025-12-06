import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { fetchPlaces, addPlace, updatePlace, removePlace } from '../services';

/**
 * Hook personnalisé pour gérer les restaurants
 * @returns {Object} Objet contenant les données et méthodes des restaurants
 */
export const usePlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const { makeRequest } = useApi();

  // Charger tous les restaurants
  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const placesData = await makeRequest(fetchPlaces);
      setPlaces(placesData || []);
    } catch (error) {
      console.error('Error loading places:', error);
    } finally {
      setLoading(false);
    }
  }, [makeRequest]);

  // Ajouter un nouveau restaurant
  const addNewPlace = useCallback(async (placeData) => {
    try {
      const newPlace = await makeRequest(addPlace, placeData);
      setPlaces(prev => [...prev, newPlace]);
      return newPlace;
    } catch (error) {
      console.error('Error adding place:', error);
      throw error;
    }
  }, [makeRequest]);

  // Mettre à jour un restaurant
  const updateExistingPlace = useCallback(async (placeId, placeData) => {
    try {
      const updatedPlace = await makeRequest(updatePlace, placeId, placeData);
      setPlaces(prev => 
        prev.map(place => place.id === placeId ? updatedPlace : place)
      );
      return updatedPlace;
    } catch (error) {
      console.error('Error updating place:', error);
      throw error;
    }
  }, [makeRequest]);

  // Supprimer un restaurant
  const removeExistingPlace = useCallback(async (placeId) => {
    try {
      await makeRequest(removePlace, placeId);
      setPlaces(prev => prev.filter(place => place.id !== placeId));
    } catch (error) {
      console.error('Error removing place:', error);
      throw error;
    }
  }, [makeRequest]);

  // Obtenir un restaurant par ID
  const getPlaceById = useCallback((placeId) => {
    return places.find(place => place.id === placeId);
  }, [places]);

  // Recharger les restaurants
  const refreshPlaces = useCallback(() => {
    loadPlaces();
  }, [loadPlaces]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  return {
    places,
    loading,
    addPlace: addNewPlace,
    updatePlace: updateExistingPlace,
    removePlace: removeExistingPlace,
    getPlaceById,
    refreshPlaces
  };
};

export default usePlaces;
