import React, { useState, useContext } from 'react';
import { toast } from '../utils/toast';
import { X, Plus, Trash2, QrCode } from 'lucide-react';
import { addCategory, addMenuItems, updateMenuItem, removeCategory } from '../services';
import AuthContext from '../contexts/AuthContext';
import ImageDropzone from './ImageDropzone';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
// import { Modal } from '../components/ui'; // Réservé pour usage futur

export const MenuItemForm = ({ place, onDone, item = {} }) => {
  // Suggestions de catégories courantes
  const categorySuggestions = [
    "Entrée", "Plat principal", "Dessert", "Boisson", "Vin", "Whisky", "Cocktail", "Accompagnement"
  ];

  // Catégories de l'utilisateur uniquement
  const baseCategories = place?.categories || [];
  const auth = useContext(AuthContext);

  // États du formulaire
  const [category, setCategory] = useState(item.category || "");
  const [categoryError, setCategoryError] = useState("");
  const [name, setName] = useState(item.name || "");
  const [nameError, setNameError] = useState("");
  const [price, setPrice] = useState(item.price || 0);
  const [priceError, setPriceError] = useState("");
  const [description, setDescription] = useState(item.description || "");
  const [image, setImage] = useState(item.image || "");
  const [isAvailable, setIsAvailable] = useState(
    (item.isAvailable !== undefined ? item.isAvailable : item.is_available) === undefined ? true : !!(item.isAvailable !== undefined ? item.isAvailable : item.is_available)
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Suppression d'une catégorie
  const onRemoveCategory = async (catId) => {
    if (window.confirm("Supprimer cette catégorie ?")) {
      await removeCategory(catId, auth.token);
      if (typeof onDone === 'function') onDone();
      if (category === catId) setCategory("");
    }
  };

  const onAddMenuItems = async () => {
    try {
      let categoryId = null;
      let categoryObj = baseCategories.find(c => c.name.toLowerCase() === category.trim().toLowerCase());
      
      // Si la catégorie n'existe pas, on la crée d'abord
      if (!categoryObj) {
        const created = await addCategory({ name: category.trim(), placeId: place.id }, auth.token);
        if (!created) {
          toast.error("Erreur lors de la création de la catégorie");
          return;
        }
        // Extraire l'ID depuis la réponse (peut être dans data ou directement)
        categoryId = created?.data?.id || created?.id;
        if (!categoryId) {
          toast.error("Erreur : impossible de récupérer l'ID de la catégorie créée");
          return;
        }
      } else {
        categoryId = categoryObj.id;
      }
      
      // Création du plat
      const response = await addMenuItems({
        placeId: place.id,
        categoryId,
        name,
        price,
        description,
        imageUrl: image,
        isAvailable
      }, auth.token);
      
      // Log pour déboguer (en développement uniquement)
      if (process.env.NODE_ENV === 'development') {
        console.log('[MenuItemForm] Réponse de addMenuItems:', response);
      }
      
      // Vérifier si la réponse est null (erreur)
      if (!response) {
        toast.error("Erreur lors de la création du plat. Veuillez réessayer.");
        return;
      }
      
      // Extraire les données depuis la réponse (format peut varier)
      const menuItem = response?.data || response;
      
      if (menuItem && (menuItem.id || menuItem.name)) {
        const itemName = menuItem.name || name;
        toast.success(`Plat "${itemName}" créé avec succès`);
        
        // Réinitialiser le formulaire
        setCategory("");
        setName("");
        setPrice(0);
        setDescription("");
        setImage("");
        setIsAvailable(true);
        
        // Appeler onDone pour recharger les données - attendre que ce soit terminé
        if (typeof onDone === 'function') {
          try {
            await onDone();
          } catch (reloadError) {
            console.error('Erreur lors du rechargement des données:', reloadError);
            // Ne pas bloquer l'utilisateur si le rechargement échoue
            // Le plat a été créé avec succès
          }
        }
      } else {
        // Log détaillé pour déboguer
        console.error('Réponse invalide du serveur:', {
          response,
          hasData: !!response?.data,
          hasId: !!(response?.data?.id || response?.id),
          hasName: !!(response?.data?.name || response?.name)
        });
        toast.error("Erreur : réponse invalide du serveur. Le plat a peut-être été créé, veuillez rafraîchir la page.");
        
        // Essayer quand même de recharger les données au cas où le plat aurait été créé
        if (typeof onDone === 'function') {
          try {
            await onDone();
          } catch (reloadError) {
            console.error('Erreur lors du rechargement:', reloadError);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création du plat:', error);
      const errorMessage = error?.message || "Erreur lors de la création du plat. Veuillez réessayer.";
      toast.error(errorMessage);
    }
  };

  const onUpdateMenuItem = async () => {
    const json = await updateMenuItem(
      item.id,
      {
        place: place.id,
        category,
        name,
        price,
        description,
        image,
        is_available: isAvailable
      },
      auth.token
    );

    if (json) {
      toast.success(`Plat "${json.name}" mis à jour avec succès`);
      setCategory("");
      setName("");
      setPrice(0);
      setDescription("");
      setImage("");
      setIsAvailable(false);
      onDone();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 w-full max-w-full sm:max-w-lg md:max-w-xl mx-auto max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-dark-text leading-tight flex-1 min-w-0">
          {item.id ? 'Modifier le plat' : 'Créer un nouveau plat'}
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/qrcodes'}
            icon={<QrCode className="w-4 h-4 sm:w-5 sm:h-5" />}
            className="text-primary hover:bg-primary/10 min-h-[44px] min-w-[44px] p-2"
          >
            <span className="hidden sm:inline">QR Codes</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDone}
            icon={<X className="w-4 h-4 sm:w-5 sm:h-5" />}
            className="text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] p-2"
          />
        </div>
      </div>

      {/* Formulaire */}
      <div className="space-y-3 sm:space-y-4">
        {/* Catégorie */}
        <div>
          <label className="block text-sm sm:text-base font-semibold text-dark-text mb-2">
            Catégorie <span className="text-red-500">*</span>
          </label>
          {baseCategories.length === 0 && (
            <div className="text-xs sm:text-sm text-blue-700 mb-2 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
              <p className="font-medium mb-1">💡 Aucune catégorie pour le moment</p>
              <p>Saisissez le nom d'une nouvelle catégorie (ex: "Entrées", "Plats principaux", "Desserts") et elle sera créée automatiquement avec votre plat.</p>
            </div>
          )}
          <div className="relative">
            <Input
              type="text"
              placeholder="Ex: Entrée, Dessert..."
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (!e.target.value.trim()) {
                  setCategoryError("La catégorie est requise.");
                } else {
                  setCategoryError("");
                }
              }}
              list="category-list"
              className={`w-full min-h-[44px] text-sm sm:text-base ${categoryError ? 'border-red-500' : 'border-gray-300'}`}
            />
            {categoryError && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">{categoryError}</p>
            )}
            <datalist id="category-list">
              {baseCategories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            
            {/* Dropdown des catégories */}
            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors min-h-[44px] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Gérer les catégories</span>
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-auto min-w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 sm:p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-dark-text mb-3">Catégories proposées</h3>
                    <div className="flex flex-wrap gap-2">
                      {categorySuggestions.map(sugg => (
                        <button
                          key={sugg}
                          type="button"
                          onClick={() => {
                            setCategory(sugg);
                            setShowCategoryDropdown(false);
                          }}
                          className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors"
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm font-semibold text-dark-text mb-3">Mes catégories</h3>
                    {baseCategories.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucune catégorie créée</p>
                    ) : (
                      <div className="space-y-2">
                        {baseCategories.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm font-medium text-dark-text">{c.name}</span>
                            <button
                              type="button"
                              onClick={() => onRemoveCategory(c.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nom du plat et Prix en grille sur écrans moyens et plus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Nom du plat */}
          <div className="sm:col-span-2">
            <label className="block text-sm sm:text-base font-semibold text-dark-text mb-2 sm:mb-2.5 md:mb-3">
            Nom du plat <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Ex: Poulet braisé, Tiramisu..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!e.target.value.trim()) {
                setNameError("Le nom du plat est requis.");
              } else {
                setNameError("");
              }
            }}
            className={`w-full min-h-[44px] text-sm sm:text-base ${nameError ? 'border-red-500' : 'border-gray-300'}`}
          />
          {nameError && (
            <p className="text-xs sm:text-sm text-red-600 mt-1">{nameError}</p>
          )}
        </div>

        {/* Prix */}
        <div>
            <label className="block text-sm sm:text-base font-semibold text-dark-text mb-2">
            Prix (FCFA) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="Ex: 3500"
            value={price}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              setPrice(value);
              if (value <= 0) {
                setPriceError("Le prix doit être positif.");
              } else {
                setPriceError("");
              }
            }}
            className={`w-full min-h-[44px] text-sm sm:text-base ${priceError ? 'border-red-500' : 'border-gray-300'}`}
            min="0"
            step="100"
          />
          {priceError && (
            <p className="text-xs sm:text-sm text-red-600 mt-1">{priceError}</p>
          )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm sm:text-base font-semibold text-dark-text mb-2 sm:mb-2.5 md:mb-3">
            Description
          </label>
          <textarea
            placeholder="Description de l'article"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm sm:text-base font-semibold text-dark-text mb-2">
            Image
          </label>
          <ImageDropzone value={image} onChange={setImage} />
        </div>

        {/* Disponibilité */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="isAvailable"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="w-5 h-5 sm:w-6 sm:h-6 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
          />
          <label htmlFor="isAvailable" className="text-sm sm:text-base font-medium text-dark-text cursor-pointer flex-1">
            Disponible à la commande
          </label>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-gray-200 sticky bottom-0 bg-white pb-2">
          <Button
            variant="light"
            onClick={onDone}
            className="w-full sm:w-auto px-4 sm:px-6 min-h-[44px] text-sm sm:text-base order-2 sm:order-1"
          >
            Annuler
          </Button>
          {item.id ? (
            <Button
              variant="primary"
              onClick={onUpdateMenuItem}
              className="w-full sm:w-auto px-4 sm:px-6 min-h-[44px] text-sm sm:text-base order-1 sm:order-2"
            >
              Mettre à jour
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={onAddMenuItems}
              disabled={
                !category || !name || !price ||
                !!categoryError || !!nameError || !!priceError
              }
              className="w-full sm:w-auto px-4 sm:px-6 min-h-[44px] text-sm sm:text-base order-1 sm:order-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter le plat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemForm;
