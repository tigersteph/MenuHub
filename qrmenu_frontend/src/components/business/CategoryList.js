import React, { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from '../../utils/toast';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import EditableText from '../ui/EditableText';
import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';
import { useSnackbar } from '../ui/Snackbar';

/**
 * Liste de catégories avec drag & drop, édition inline et recherche
 */
const CategoryList = React.memo(({
  categories = [],
  loading = false,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onSelectCategory,
  searchQuery = '',
  onSearchChange
}) => {
  const { showSnackbarWithUndo } = useSnackbar();

  // Filtrer les catégories
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => {
      // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
      const items = cat.menu_items || cat.menuItems || [];
      return cat.name?.toLowerCase().includes(query) ||
        items.some(item => item.name?.toLowerCase().includes(query));
    });
  }, [categories, searchQuery]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorderCategories(items);
  };

  const handleUpdateCategoryName = async (categoryId, newName) => {
    try {
      await onUpdateCategory(categoryId, { name: newName });
    } catch (err) {
      throw new Error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    try {
      await onDeleteCategory(categoryId);
      showSnackbarWithUndo(
        `Catégorie "${category.name}" supprimée`,
        async () => {
          // Undo: recréer la catégorie
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

  if (loading && categories.length === 0) {
    return <div className="text-center p-8">Chargement des catégories...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Recherche */}
      {onSearchChange && (
        <SearchInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher une catégorie ou un item..."
          className="mb-4"
        />
      )}

      {/* Liste avec drag & drop */}
      {filteredCategories.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">
            {searchQuery ? 'Aucune catégorie ne correspond à votre recherche' : 'Aucune catégorie'}
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {filteredCategories.map((category, index) => (
                  <Draggable key={category.id} draggableId={String(category.id)} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white rounded-lg shadow-sm p-4 transition-all ${
                          snapshot.isDragging ? 'shadow-lg scale-105' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-5 h-5 text-gray-400 hover:text-primary" />
                            </div>
                            <EditableText
                              value={category.name}
                              onSave={(newName) => handleUpdateCategoryName(category.id, newName)}
                              placeholder="Nom de la catégorie"
                              textClassName="text-lg font-bold text-text-dark"
                              validate={(value) => {
                                if (!value || value.trim().length < 2) {
                                  return 'Le nom doit contenir au moins 2 caractères';
                                }
                                return null;
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSelectCategory && onSelectCategory(category)}
                              icon={<Plus className="w-5 h-5" />}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              icon={<Trash2 className="w-5 h-5" />}
                            />
                          </div>
                        </div>
                        {/* Items de la catégorie */}
                        {(() => {
                          // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
                          const items = category.menu_items || category.menuItems || [];
                          return items.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600">
                                {items.length} item{items.length > 1 ? 's' : ''} •{' '}
                                {items.map(item => item.name).join(', ')}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </Draggable>
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

CategoryList.displayName = 'CategoryList';

export default CategoryList;
