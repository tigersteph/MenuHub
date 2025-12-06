import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';
import PaymentForm from '../../forms/PaymentForm';

const ShoppingCart = ({ items, onAdd, onRemove, onPaymentDone, color, title, placeId, tableId }) => {
  const { t } = useTranslation();
  const displayTitle = title || t('menu.shoppingCart.title');
  const totalPrice = useMemo(
    () => items.map((i) => {
      const price = typeof i.price === 'string' ? parseFloat(i.price) : (i.price || 0);
      return i.quantity * price;
    }).reduce((a,b) => a + b, 0),
    [items]
  );
  
  return (
    <div className="w-full max-w-md mx-auto px-3 sm:px-0">
      <h3 className="text-center mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-slate-900">
        {displayTitle}
      </h3>
      
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        {items.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-slate-500 text-sm sm:text-base">{t('menu.shoppingCart.empty')}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {items.map((item) => {
                const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
                const priceFormatted = price ? price.toFixed(2).replace('.', ',') : '0,00';
                
                return (
                  <div key={item.id} className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-200 last:border-0">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-slate-900 truncate mb-1 text-sm sm:text-base">
                        {item.name}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {priceFormatted} XAF
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 ml-2 flex-shrink-0">
                      <button
                        className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gray-200 text-slate-700 active:bg-gray-300 transition-colors touch-manipulation"
                        onClick={() => onRemove(item)}
                        aria-label={t('menu.shoppingCart.decreaseQuantity')}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm sm:text-base font-semibold text-slate-900 min-w-[1.75rem] sm:min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gray-200 text-slate-700 active:bg-gray-300 transition-colors touch-manipulation"
                        onClick={() => onAdd(item)}
                        aria-label={t('menu.shoppingCart.increaseQuantity')}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-center">
                <h5 className="text-base sm:text-lg font-bold text-slate-900">{t('menu.shoppingCart.total')}</h5>
                <h5 className="text-base sm:text-lg font-bold text-slate-900">
                  {totalPrice.toFixed(2).replace('.', ',')} XAF
                </h5>
              </div>
            </div>

            <PaymentForm 
              amount={totalPrice} 
              items={items} 
              onDone={onPaymentDone} 
              color={color}
              placeId={placeId}
              tableId={tableId}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;