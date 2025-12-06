import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ArrowLeft, X } from 'lucide-react';

const OrderConfirmation = ({ orderNumber, totalAmount, onBack, onCancel, color, placeName }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8 safe-area-inset-bottom">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg"
            style={{backgroundColor: color ? `${color}15` : '#fa793815'}}
          >
            <CheckCircle2 
              className="w-12 h-12 sm:w-16 sm:h-16" 
              style={{color: color || '#fa7938'}} 
            />
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          {t('menu.orderConfirmation.title')}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mb-6">
          {t('menu.orderConfirmation.message', { placeName: placeName || t('menu.orderConfirmation.restaurant') })}
        </p>

        {/* Order Details */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-6 mb-6 border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm sm:text-base text-slate-600">
              {t('menu.orderConfirmation.orderNumber')}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900">
              #{orderNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base text-slate-600">
              {t('menu.orderConfirmation.total')}
            </span>
            <span className="text-base sm:text-lg font-bold" style={{color: color || '#fa7938'}}>
              {totalAmount.toFixed(2).replace('.', ',')} XAF
            </span>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <p className="text-sm text-blue-800">
            {t('menu.orderConfirmation.info')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onBack}
            className="w-full h-12 rounded-xl text-white font-bold text-base shadow-md active:shadow-lg transition-all duration-200 active:scale-95 touch-manipulation flex items-center justify-center gap-2"
            style={{
              backgroundColor: color || '#fa7938',
              boxShadow: `0 4px 14px 0 ${(color || '#fa7938')}30`
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            {t('menu.orderConfirmation.backToMenu')}
          </button>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full h-11 rounded-xl text-slate-700 font-semibold text-sm border-2 border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 transition-all duration-200 active:scale-95 touch-manipulation flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              {t('menu.orderConfirmation.cancelOrder')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

