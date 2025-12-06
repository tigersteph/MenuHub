import React, { useState } from 'react';
import { GripVertical, Plus, Trash2, Edit, ChevronDown, ChevronUp, Copy, CheckSquare, Square, ToggleLeft, ToggleRight } from 'lucide-react';
import EditableText from '../ui/EditableText';
import Button from '../ui/Button';
import { useSnackbar } from '../ui/Snackbar';
import { toast } from '../../utils/toast';
import { formatPrice } from '../../utils/helpers';

/**
 * Composant qui affiche une catégorie avec ses items de manière organisée
 * Permet d'ajouter/modifier/supprimer des items directement depuis la catégorie
 */
const CategoryWithItems = ({
  category,
  index,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onEditItem,
  onDuplicateItem,
  onToggleItemAvailability,
  placeId,
  isDragging = false,
  provided,
  snapshot,
  viewMode = 'list',
  isSelectMode = false,
  selectedItems = new Set(),
  onToggleItemSelection,
  onSelectAll,
  onDeselectAll
}) => {
  // Par défaut, les catégories sont ouvertes pour un accès immédiat aux plats
  // L'utilisateur peut cliquer sur la bannière pour réduire et voir uniquement les catégories
  const [isExpanded, setIsExpanded] = useState(true);
  const { showSnackbarWithUndo } = useSnackbar();

  // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
  const menuItems = category.menu_items || category.menuItems || [];
  const itemsCount = menuItems.length;

  const handleUpdateCategoryName = async (newName) => {
    try {
      await onUpdateCategory(category.id, { name: newName });
    } catch (err) {
      throw new Error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await onDeleteCategory(category.id);
      showSnackbarWithUndo(
        `Catégorie "${category.name}" supprimée`,
        async () => {
          try {
            await onUpdateCategory(null, { 
              name: category.name, 
              place_id: category.placeId || category.place_id 
            });
          } catch (err) {
            toast.error('Impossible de restaurer la catégorie');
          }
        },
        { duration: 5000 }
      );
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteItem = (itemId, itemName) => {
    // Appeler la fonction parente qui gère la confirmation
    if (onDeleteItem) {
      onDeleteItem(itemId, itemName);
    }
  };

  const handleEditItemClick = (item, category) => {
    if (onEditItem) {
      onEditItem(item, category);
    }
  };

  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className={`bg-white rounded-lg shadow-md border-2 border-gray-200 transition-all hover:shadow-lg hover:border-primary/30 ${
        snapshot?.isDragging ? 'shadow-xl scale-105 border-primary' : ''
      } ${isExpanded ? 'border-primary/50' : ''}`}
    >
      {/* Bannière de la catégorie - Cliquable pour expand/collapse */}
      <div 
        className={`bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20 cursor-pointer transition-all hover:from-primary/15 hover:via-primary/10 ${
          isExpanded ? 'border-primary/40' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Drag handle */}
              <div 
                {...provided?.dragHandleProps} 
                className="cursor-grab active:cursor-grabbing flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-5 h-5 text-gray-400 hover:text-primary transition-colors" />
              </div>

              {/* Nom de la catégorie - Bannière principale */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <EditableText
                      value={category.name}
                      onSave={handleUpdateCategoryName}
                      placeholder="Nom de la catégorie"
                      textClassName="text-xl sm:text-2xl font-bold text-primary truncate"
                      validate={(value) => {
                        if (!value || value.trim().length < 2) {
                          return 'Le nom doit contenir au moins 2 caractères';
                        }
                        return null;
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Cliquez pour {isExpanded ? 'réduire' : 'développer'} les plats
                    </p>
                  </div>
                </div>
              </div>

              {/* Compteur d'items - Badge */}
              <div className="px-4 py-2 bg-primary text-white rounded-full shadow-md flex-shrink-0">
                <span className="text-sm sm:text-base font-bold">
                  {itemsCount}
                </span>
              </div>
            </div>

            {/* Actions - Boutons */}
            <div 
              className="flex items-center gap-2 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAddItem && onAddItem(category)}
                icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                title="Ajouter un plat à cette catégorie"
                className="bg-primary text-white hover:bg-primary/90 shadow-sm"
              >
                <span className="hidden sm:inline">Ajouter plat</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                icon={
                  isExpanded ? (
                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                  )
                }
                title={isExpanded ? 'Réduire la catégorie' : 'Développer la catégorie'}
                className="hover:bg-primary/20 hover:text-primary"
              />
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteCategory}
                icon={<Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                title="Supprimer la catégorie"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des items (expandable) - Grille sous la bannière */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-gray-50/50">
          {/* Indicateur visuel de la catégorie avec bouton d'ajout */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent"></div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider px-3 py-1 bg-primary/10 rounded-full">
                {category.name}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent"></div>
            </div>
            {/* Bouton d'ajout de plat visible même quand il y a des plats */}
            {menuItems.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAddItem && onAddItem(category)}
                icon={<Plus className="w-4 h-4" />}
                title="Ajouter un plat à cette catégorie"
                className="bg-primary text-white hover:bg-primary/90 shadow-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">Ajouter plat</span>
                <span className="sm:hidden">+</span>
              </Button>
            )}
          </div>

          {menuItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-2">Aucun plat dans cette catégorie</p>
                <p className="text-sm text-gray-500 mb-4">
                  Commencez par ajouter votre premier plat à la catégorie "{category.name}"
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onAddItem && onAddItem(category)}
                  icon={<Plus className="w-5 h-5" />}
                >
                  Ajouter le premier plat
                </Button>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
              {menuItems.map((item, itemIndex) => {
                const isSelected = selectedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`${
                      viewMode === 'grid' 
                        ? 'flex flex-col' 
                        : 'flex items-start gap-3'
                    } p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all group ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5 border-primary' : ''
                    } ${isSelectMode ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (isSelectMode && onToggleItemSelection) {
                        onToggleItemSelection(item.id);
                      }
                    }}
                  >
                    {/* Checkbox de sélection */}
                    {isSelectMode && (
                      <div className="flex-shrink-0 mb-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleItemSelection && onToggleItemSelection(item.id)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Image du plat */}
                    <div className={`${
                      viewMode === 'grid' ? 'w-full aspect-square' : 'w-20 h-20 flex-shrink-0'
                    } rounded-lg overflow-hidden bg-gray-200`}>
                      {(item.image || item.imageUrl || item.image_url) ? (
                        <img
                          src={item.image || item.imageUrl || item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-gray-400">Aucune image</span>
                        </div>
                      )}
                    </div>

                    {/* Détails du plat */}
                    <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? 'mt-2' : ''}`}>
                      <div className={`flex items-start justify-between gap-2 ${viewMode === 'grid' ? 'flex-col' : ''} mb-1`}>
                        <div className="flex-1">
                          <h4 className="font-semibold text-text-dark mb-1">{item.name}</h4>
                          {item.description && (
                            <p className={`text-sm text-gray-600 ${viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-2'} mb-2`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        {!isSelectMode && (
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditItemClick(item, category);
                              }}
                              icon={<Edit className="w-4 h-4" />}
                              title="Modifier le plat"
                              className="hover:bg-blue-50 hover:text-blue-600"
                            />
                            {onDuplicateItem && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDuplicateItem(item, category);
                                }}
                                icon={<Copy className="w-4 h-4" />}
                                title="Dupliquer le plat"
                                className="hover:bg-purple-50 hover:text-purple-600"
                              />
                            )}
                            {onToggleItemAvailability && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentAvailability = (item.isAvailable !== undefined ? item.isAvailable : item.is_available) !== false;
                                  onToggleItemAvailability(item.id, currentAvailability);
                                }}
                                icon={(item.isAvailable !== undefined ? item.isAvailable : item.is_available) !== false ? (
                                  <ToggleRight className="w-4 h-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4 text-gray-400" />
                                )}
                                title={(item.isAvailable !== undefined ? item.isAvailable : item.is_available) !== false ? "Désactiver le plat" : "Activer le plat"}
                                className={(item.isAvailable !== undefined ? item.isAvailable : item.is_available) !== false 
                                  ? "hover:bg-red-50 hover:text-red-600" 
                                  : "hover:bg-green-50 hover:text-green-600"
                                }
                              />
                            )}
                            {onDeleteItem && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item.id, item.name);
                                }}
                                icon={<Trash2 className="w-4 h-4" />}
                                title="Supprimer le plat"
                                className="hover:bg-red-50 hover:text-red-600"
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col items-start gap-2' : 'justify-between'}`}>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(item.price)}
                          </span>
                          {(item.isAvailable !== undefined || item.is_available !== undefined) && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                (item.isAvailable !== undefined ? item.isAvailable : item.is_available)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {(item.isAvailable !== undefined ? item.isAvailable : item.is_available) ? 'Disponible' : 'Indisponible'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryWithItems;

