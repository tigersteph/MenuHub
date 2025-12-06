import React, { useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { UtensilsCrossed, SearchX } from 'lucide-react';
import MenuItem from './MenuItem';

const MenuList = memo(({ place, shoppingCart = {}, onOrder, onItemClick, font = "", color = "", selectedCategory = null, searchQuery = "" }) => {
  const { t } = useTranslation();
  
  const hasItems = useMemo(() => 
    place?.categories?.some(
      (category) => {
        // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
        const items = category.menu_items || category.menuItems || [];
        return items.filter((i) => (i.isAvailable !== undefined ? i.isAvailable : i.is_available)).length > 0;
      }
    ),
    [place?.categories]
  );

  // Filter categories and items based on selectedCategory and searchQuery
  const filteredCategories = useMemo(() => place?.categories
    ?.filter((category) => {
      // Filter by selected category if one is selected
      if (selectedCategory && category.id !== selectedCategory) {
        return false;
      }
      // Only show categories with available items
      // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
      const items = category.menu_items || category.menuItems || [];
      return items.filter((i) => (i.isAvailable !== undefined ? i.isAvailable : i.is_available)).length > 0;
    })
    .map((category) => {
      // Gérer les deux formats : menu_items (snake_case) et menuItems (camelCase)
      const items = category.menu_items || category.menuItems || [];
      const filteredItems = items.filter((item) => {
        // Filter by availability
        if (!(item.isAvailable !== undefined ? item.isAvailable : item.is_available)) return false;
        // Filter by search query if provided
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            item.name?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          );
        }
        return true;
      });
      
      return {
        ...category,
        menu_items: filteredItems
      };
    })
    .filter((category) => category.menu_items?.length > 0) || [],
    [place?.categories, selectedCategory, searchQuery]
  );

  if (!hasItems) {
    return (
      <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-sm mb-4 border border-gray-100">
        <div className="flex justify-center mb-4">
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
            style={{backgroundColor: color ? `${color}15` : '#fa793815'}}
          >
            <UtensilsCrossed 
              className="w-7 h-7 sm:w-8 sm:h-8" 
              style={{color: color || '#fa7938'}} 
            />
          </div>
        </div>
        <h5 className="mb-2 text-base sm:text-lg font-bold" style={{color: color || '#fa7938'}}>{t('menu.noItemsAvailable')}</h5>
        <p className="text-slate-600 text-xs sm:text-sm px-2">{t('menu.notConfigured')}</p>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 px-2">{t('menu.addFirstItems')}</p>
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-sm mb-4 border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-slate-100">
            <SearchX className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
          </div>
        </div>
        <h5 className="mb-2 text-base sm:text-lg font-bold text-slate-900">{t('menu.noResults')}</h5>
        <p className="text-slate-600 text-xs sm:text-sm px-2">{t('menu.noResultsDescription')}</p>
      </div>
    );
  }

  return (
    <div style={{fontFamily: font}}>
      {filteredCategories.map((category) => (
        <div key={category.id}>
          {category.menu_items
            .map((item, index) => (
              <div key={item.id} className="animate-item-enter" style={{opacity: 0}}>
                <MenuItem 
                  item={{  
                    ...item,
                    quantity: shoppingCart[item.id]?.quantity,
                  }} 
                  onOrder={onOrder}
                  onItemClick={onItemClick}
                  color={color}
                />
              </div>
            ))
          }
        </div>
      ))}
    </div>
  );
});

MenuList.displayName = 'MenuList';

export default MenuList;
