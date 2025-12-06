import React, { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, Plus } from 'lucide-react';
import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';
import CategoryWithItems from './CategoryWithItems';

/**
 * Liste de catégories améliorée avec affichage organisé des items
 * Décentralise la gestion des catégories et permet une meilleure organisation
 */
const CategoryListEnhanced = React.memo(({
  categories = [],
  loading = false,
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
  searchQuery = '',
  onSearchChange,
  searchInputValue = '',
  sortBy = 'name',
  sortOrder = 'asc',
  onSortChange,
  filterAvailable = 'all',
  onFilterChange,
  viewMode = 'list',
  isSelectMode = false,
  selectedItems = new Set(),
  onToggleItemSelection,
  onSelectAll,
  onDeselectAll
}) => {
  // Filtrer et trier les catégories et items
  const filteredCategories = useMemo(() => {
    let result = categories;

    // Appliquer la recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = categories
        .map(category => {
          const matchesCategory = category.name?.toLowerCase().includes(query);
          // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
          const items = category.menu_items || category.menuItems || [];
          const matchingItems = items.filter(item =>
            item.name?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          ) || [];

          if (matchesCategory || matchingItems.length > 0) {
            return {
              ...category,
              menu_items: matchesCategory 
                ? items 
                : matchingItems
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    // Appliquer le filtre de disponibilité et le tri sur les items de chaque catégorie
    result = result.map(category => {
      // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
      let items = [...(category.menu_items || category.menuItems || [])];

      // Filtrer par disponibilité
      if (filterAvailable !== 'all') {
        items = items.filter(item => {
          const isAvailable = (item.isAvailable !== undefined ? item.isAvailable : item.is_available) !== false; // Par défaut disponible si non spécifié
          return filterAvailable === 'available' ? isAvailable : !isAvailable;
        });
      }

      // Trier les items
      items.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            // Tri alphabétique insensible à la casse
            const nameA = (a.name || '').toLowerCase().trim();
            const nameB = (b.name || '').toLowerCase().trim();
            comparison = nameA.localeCompare(nameB, 'fr', { numeric: true, sensitivity: 'base' });
            break;
          case 'price':
            // Tri par prix (numérique)
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            comparison = priceA - priceB;
            break;
          case 'date':
            // Tri par date de création (plus récent ou plus ancien)
            const dateA = new Date(a.createdAt || a.created_at || a.created || 0);
            const dateB = new Date(b.createdAt || b.created_at || b.created || 0);
            // Vérifier que les dates sont valides
            if (isNaN(dateA.getTime())) comparison = 1;
            else if (isNaN(dateB.getTime())) comparison = -1;
            else comparison = dateA.getTime() - dateB.getTime();
            break;
          default:
            comparison = 0;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return {
        ...category,
        menu_items: items
      };
    });

    return result;
  }, [categories, searchQuery, sortBy, sortOrder, filterAvailable]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorderCategories(items);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="space-y-3">
        {/* Recherche */}
        {onSearchChange && (
          <SearchInput
            value={searchInputValue !== undefined ? searchInputValue : searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher une catégorie ou un plat..."
            className="w-full"
          />
        )}

        {/* Filtres et tri */}
        {(onSortChange || onFilterChange) && (
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {/* Filtre disponibilité */}
            {onFilterChange && (
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <Filter className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <select
                  value={filterAvailable}
                  onChange={(e) => onFilterChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-auto"
                >
                  <option value="all">Tous les plats</option>
                  <option value="available">Disponibles uniquement</option>
                  <option value="unavailable">Indisponibles uniquement</option>
                </select>
              </div>
            )}

            {/* Tri */}
            {onSortChange && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:ml-auto">
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Trier par:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newOrder = sortBy === 'name' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
                      onSortChange('name', newOrder);
                    }}
                    className={`text-xs px-2 sm:px-3 ${sortBy === 'name' ? 'bg-primary/10 text-primary' : ''}`}
                    icon={sortBy === 'name' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
                    title={sortBy === 'name' ? `Trier par nom (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})` : 'Trier par nom'}
                  >
                    <span className="hidden sm:inline">Nom</span>
                    <span className="sm:hidden">N</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newOrder = sortBy === 'price' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
                      onSortChange('price', newOrder);
                    }}
                    className={`text-xs px-2 sm:px-3 ${sortBy === 'price' ? 'bg-primary/10 text-primary' : ''}`}
                    icon={sortBy === 'price' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
                    title={sortBy === 'price' ? `Trier par prix (${sortOrder === 'asc' ? 'croissant' : 'décroissant'})` : 'Trier par prix'}
                  >
                    <span className="hidden sm:inline">Prix</span>
                    <span className="sm:hidden">P</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newOrder = sortBy === 'date' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
                      onSortChange('date', newOrder);
                    }}
                    className={`text-xs px-2 sm:px-3 ${sortBy === 'date' ? 'bg-primary/10 text-primary' : ''}`}
                    icon={sortBy === 'date' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
                    title={sortBy === 'date' ? `Trier par date (${sortOrder === 'asc' ? 'plus ancien' : 'plus récent'})` : 'Trier par date'}
                  >
                    <span className="hidden sm:inline">Date</span>
                    <span className="sm:hidden">D</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Liste des catégories avec drag & drop */}
      {filteredCategories.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? 'Aucune catégorie ou plat ne correspond à votre recherche' 
              : 'Aucune catégorie'}
          </p>
          {!searchQuery && (
            <>
              <p className="text-sm text-gray-400 mb-6">
                Commencez par créer votre premier plat. Une catégorie sera créée automatiquement si nécessaire.
              </p>
              {onAddItem && (
                <Button
                  onClick={() => onAddItem(null)}
                  icon={<Plus className="w-4 h-4" />}
                  className="min-h-[44px]"
                >
                  Ajouter votre premier plat
                </Button>
              )}
            </>
          )}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6 sm:space-y-8">
                {filteredCategories.map((category, index) => (
                  <div key={category.id} className="relative">
                    {/* Séparateur visuel entre catégories */}
                    {index > 0 && (
                      <div className="absolute -top-4 left-0 right-0 flex items-center">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        <div className="px-4">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-transparent"></div>
                      </div>
                    )}
                    <Draggable draggableId={String(category.id)} index={index}>
                      {(provided, snapshot) => (
                        <CategoryWithItems
                          category={category}
                          index={index}
                          onUpdateCategory={onUpdateCategory}
                          onDeleteCategory={onDeleteCategory}
                          onReorderCategories={onReorderCategories}
                          onAddItem={onAddItem}
                          onUpdateItem={onUpdateItem}
                          onDeleteItem={onDeleteItem}
                          onEditItem={onEditItem}
                          onDuplicateItem={onDuplicateItem}
                          onToggleItemAvailability={onToggleItemAvailability}
                          placeId={placeId}
                          isDragging={snapshot.isDragging}
                          provided={provided}
                          snapshot={snapshot}
                          viewMode={viewMode}
                          isSelectMode={isSelectMode}
                          selectedItems={selectedItems}
                          onToggleItemSelection={onToggleItemSelection}
                          onSelectAll={onSelectAll}
                          onDeselectAll={onDeselectAll}
                        />
                      )}
                    </Draggable>
                  </div>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
});

CategoryListEnhanced.displayName = 'CategoryListEnhanced';

export default CategoryListEnhanced;

