import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// import { useParams } from 'react-router-dom'; // Réservé pour usage futur
import { toast } from '../utils/toast';
import { createOrder } from '../services/api/orders';

// Version simplifiée sans paiement (pour version future)
const PaymentForm = ({ amount, items, onDone, color, placeId, tableId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Marquer le composant comme monté
    isMountedRef.current = true;
    
    return () => {
      // Marquer le composant comme démonté lors du cleanup
      isMountedRef.current = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!placeId || !tableId || !items || items.length === 0) {
      toast.error(t('menu.order.error.missingData'), {type: "error"});
      return;
    }

    if (isMountedRef.current) {
      setLoading(true);
    }
    
    try {
      const result = await createOrder(placeId, tableId, items);
      
      if (result?.success) {
        toast.success(t('menu.order.success', { orderNumber: result.order?.id || 'N/A' }), {
          type: "success",
          position: "bottom-center",
          // Using default duration (3500ms for success notifications)
        });
        // Passer les données de la commande à onDone
        // Note: onDone peut déclencher une navigation/fermeture du composant
        onDone({
          order: result.order,
          totalAmount: amount
        });
      } else {
        if (isMountedRef.current) {
          toast.error(result?.message || t('menu.order.error.generic'), {type: "error"});
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      if (isMountedRef.current) {
        toast.error(error?.message || t('menu.order.error.generic'), {type: "error"});
      }
    } finally {
      // Ne mettre à jour l'état que si le composant est encore monté
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs sm:text-sm text-blue-800">
          {t('menu.order.paymentNote')}
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[44px] h-11 sm:h-12 rounded-xl text-white font-bold text-sm sm:text-base shadow-md active:shadow-lg transition-all duration-200 active:scale-[0.98] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: color || '#fa7938',
          boxShadow: `0 4px 14px 0 ${(color || '#fa7938')}30`
        }}
        aria-label={loading ? t('menu.order.processing') : t('menu.order.confirm')}
      >
        {loading ? t('menu.order.processing') : t('menu.order.confirm')}
      </button>
    </form>
  );
};

export default PaymentForm;
