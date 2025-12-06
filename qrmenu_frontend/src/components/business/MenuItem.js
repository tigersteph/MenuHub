import React, { useState, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Edit, Trash2 } from 'lucide-react';

const MenuItem = memo(({ item, onEdit, onRemove, onOrder, onItemClick, color }) => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isAvailable = item.isAvailable !== undefined ? item.isAvailable : item.is_available;
  // Convertir le prix en nombre (peut être une string depuis la DB)
  const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
  const priceFormatted = price ? price.toFixed(2).replace('.', ',') : '0,00';
  
  const handleItemClick = useCallback(() => {
    if (onItemClick && isAvailable) {
      onItemClick(item);
    }
  }, [onItemClick, isAvailable, item]);

  const handleKeyDown = useCallback((e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onItemClick && isAvailable) {
      e.preventDefault();
      onItemClick(item);
    }
  }, [onItemClick, isAvailable, item]);
  
  return (
    <div 
      className={`flex items-center gap-3 sm:gap-4 bg-white p-2.5 sm:p-3 rounded-lg min-h-[64px] sm:min-h-[72px] justify-between border border-transparent active:border-gray-200 active:shadow-md transition-all duration-200 ${
        !isAvailable ? 'relative opacity-50' : ''
      }`}
    >
      <div 
        className={`flex items-center gap-3 sm:gap-4 flex-1 min-w-0 ${onItemClick && isAvailable ? 'cursor-pointer' : ''}`}
        onClick={handleItemClick}
        role={onItemClick && isAvailable ? 'button' : undefined}
        tabIndex={onItemClick && isAvailable ? 0 : undefined}
        onKeyDown={handleKeyDown}
        aria-label={onItemClick && isAvailable ? `${item.name} - ${priceFormatted} XAF` : undefined}
      >
        <div 
          className={`relative bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-14 h-14 sm:w-16 sm:h-16 shrink-0 overflow-hidden ${
            !isAvailable ? 'filter grayscale' : ''
          }`}
        >
          {(item.image || item.imageUrl || item.image_url) && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse" />
              )}
              <img
                src={item.image || item.imageUrl || item.image_url}
                alt={item.name ? `${item.name} - ${t('menu.itemDetail.noDescription')}` : "Image du plat"}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
              <Image className="w-6 h-6" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <p className="text-slate-900 text-[15px] sm:text-base font-bold leading-normal truncate">
            {item.name}
          </p>
          <p className="text-slate-500 text-xs sm:text-sm font-normal leading-normal line-clamp-2">
            {item.description || ''}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 gap-1 sm:gap-1.5 ml-1.5 sm:ml-2">
        <p className="text-slate-900 font-bold text-sm sm:text-base">
          {priceFormatted} XAF
        </p>
        {onOrder && isAvailable ? (
          <button 
            className="flex min-w-[72px] sm:min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-8 px-3 sm:px-4 text-xs sm:text-sm font-bold leading-normal w-fit transition-all duration-200 active:scale-95 shadow-sm active:shadow-md touch-manipulation"
            style={{
              color: color || '#fa7938', 
              backgroundColor: color ? `${color}15` : '#fa793815',
              border: `1px solid ${color ? `${color}30` : '#fa793830'}`
            }}
            onClick={(e) => {
              e.stopPropagation();
              onOrder(item);
            }}
            aria-label={item.quantity ? `${t('menu.addMore')} (${item.quantity})` : t('menu.addToCart')}
          >
            <span className="truncate">{t('add')}</span>
          </button>
        ) : !isAvailable ? (
          <div className="flex items-center justify-center rounded-full h-8 px-4 bg-slate-200 text-slate-500 text-sm font-semibold leading-normal">
            <span>{t('menu.unavailable')}</span>
          </div>
        ) : null}
        
        {/* Edit and Remove buttons for admin (if provided) */}
        {(onEdit || onRemove) && (
          <div className="flex gap-2 mt-1">
            {onEdit && (
              <button 
                className="text-primary hover:text-primary/80 transition-colors"
                onClick={() => onEdit(item)}
                aria-label="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onRemove && (
              <button 
                className="text-red-500 hover:text-red-600 transition-colors"
                onClick={() => onRemove(item)}
                aria-label="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

MenuItem.displayName = 'MenuItem';

export default MenuItem;
