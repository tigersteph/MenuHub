import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeft, Minus, Plus, UtensilsCrossed } from 'lucide-react';

const ItemDetail = ({ item, onClose, onAddToCart, color }) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!item) return null;

  // Convertir le prix en nombre (peut être une string depuis la DB)
  const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
  const priceFormatted = price ? price.toFixed(2).replace('.', ',') : '0,00';
  const isAvailable = item.isAvailable !== undefined ? item.isAvailable : item.is_available;

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCartClick = () => {
    if (isAvailable && onAddToCart) {
      // Ajouter l'item plusieurs fois selon la quantité
      for (let i = 0; i < quantity; i++) {
        onAddToCart(item);
      }
      onClose();
    }
  };

  return (
    <div className="relative min-h-screen bg-white safe-area-inset-bottom">
      <div className="pb-24 sm:pb-36">
        {/* Image Section - Mobile Optimized */}
        <div className="relative">
          <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden">
            {(item.image || item.imageUrl || item.image_url) && !imageError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                )}
                <img
                  src={item.image || item.imageUrl || item.image_url}
                  alt={item.name || t('menu.itemDetail.noDescription')}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="eager"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <div 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
                  style={{backgroundColor: color ? `${color}15` : '#fa793815'}}
                >
                  <UtensilsCrossed 
                    className="w-10 h-10 sm:w-12 sm:h-12" 
                    style={{color: color || '#fa7938'}} 
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Close Button - Mobile Optimized */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
            <button 
              className="flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 shadow-lg active:bg-white transition-all active:scale-95 touch-manipulation"
              onClick={onClose}
              aria-label={t('menu.itemDetail.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Back Button - Mobile Optimized */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
            <button 
              className="flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 shadow-lg active:bg-white transition-all active:scale-95 touch-manipulation"
              onClick={onClose}
              aria-label={t('menu.itemDetail.back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Details - Mobile Optimized */}
        <div className="px-4 sm:px-6 py-5 sm:py-6">
          {/* Name and Price */}
          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex-1 min-w-0 leading-tight">
              {item.name}
            </h1>
            <div className="flex-shrink-0 text-right">
              <p className="text-2xl sm:text-3xl font-bold" style={{color: color || '#fa7938'}}>
                {priceFormatted} XAF
              </p>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="mb-6">
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Availability Badge */}
          {!isAvailable && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm font-semibold text-red-700">
                {t('menu.unavailable')}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-slate-200 my-6"></div>

          {/* Characteristics Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-slate-600">
                {t('menu.itemDetail.price')}
              </span>
              <span className="text-base font-bold text-slate-900" style={{color: color || '#fa7938'}}>
                {priceFormatted} XAF
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-slate-600">
                {t('menu.itemDetail.availability')}
              </span>
              <span className={`text-sm font-semibold ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isAvailable ? t('menu.itemDetail.available') : t('menu.itemDetail.unavailable')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar - Mobile Optimized */}
      {isAvailable && (
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-inset-bottom">
          <div className="max-w-md mx-auto">
            {/* Total Price Display */}
            <div className="flex justify-between items-center mb-3 px-2">
              <span className="text-sm font-medium text-slate-600">
                {t('menu.itemDetail.total')}
              </span>
              <span className="text-lg font-bold" style={{color: color || '#fa7938'}}>
                {(price * quantity).toFixed(2).replace('.', ',')} XAF
              </span>
            </div>

            {/* Quantity Selector and Add Button */}
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1">
                <button 
                  className="flex items-center justify-center w-9 h-9 rounded-full text-slate-700 active:bg-slate-200 transition-colors touch-manipulation"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  aria-label={t('menu.itemDetail.decreaseQuantity')}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-bold text-slate-900 min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button 
                  className="flex items-center justify-center w-9 h-9 rounded-full text-slate-700 active:bg-slate-200 transition-colors touch-manipulation"
                  onClick={handleIncrement}
                  aria-label={t('menu.itemDetail.increaseQuantity')}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button 
                className="flex-1 h-12 flex items-center justify-center rounded-full text-white font-bold text-base shadow-lg active:shadow-xl transition-all active:scale-95 touch-manipulation"
                style={{
                  backgroundColor: color || '#fa7938',
                  boxShadow: `0 4px 14px 0 ${(color || '#fa7938')}40`
                }}
                onClick={handleAddToCartClick}
              >
                {t('menu.itemDetail.addToCart')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Unavailable Message */}
      {!isAvailable && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-inset-bottom">
          <div className="max-w-md mx-auto text-center">
            <p className="text-sm font-medium text-slate-600">
              {t('menu.itemDetail.unavailableMessage')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;

