import React from 'react';
import { useTranslation } from 'react-i18next';

const Order = ({ order, onAccept, onDecline, onReadyForPickup, onServed, onComplete }) => {
  const { t } = useTranslation();
  
  if (!order) return null;

  // Parse order details - support both 'detail' (string JSON) and 'items' (array)
  let orderDetails = [];
  if (order.items && Array.isArray(order.items)) {
    orderDetails = order.items;
  } else if (order.detail) {
    orderDetails = typeof order.detail === 'string' ? JSON.parse(order.detail) : order.detail;
  }
  
  // Format items string
  const itemsString = orderDetails.length > 0 
    ? orderDetails.map(item => `${item.quantity}x ${item.name || 'Item'}`).join(', ')
    : t('orders.noItems', 'Aucun article');
  
  // Calculate time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return t('orders.timeAgo.justNow', 'À l\'instant');
    if (diffMins < 60) return t('orders.timeAgo.minutes', { count: diffMins }, '{{count}} min');
    if (diffHours < 24) return t('orders.timeAgo.hours', { count: diffHours }, '{{count}}h');
    return t('orders.timeAgo.days', { count: diffDays }, '{{count}}j');
  };

  // Map status to design status
  const getStatusDisplay = (status) => {
    switch(status) {
      case 'pending':
      case 'new':
        return { 
          label: t('orders.status.new', 'Nouvelle'), 
          color: 'primary', 
          bgClass: 'bg-red-100 text-red-700' 
        };
      case 'processing':
      case 'in_progress':
      case 'preparing':
        return { 
          label: t('orders.status.preparing', 'En préparation'), 
          color: 'primary', 
          bgClass: 'bg-yellow-100 text-yellow-700' 
        };
      case 'ready':
        return { 
          label: t('orders.status.ready', 'Prête à servir'), 
          color: 'success', 
          bgClass: 'bg-blue-100 text-blue-700' 
        };
      case 'served':
        return { 
          label: t('orders.status.served', 'Servie'), 
          color: 'success', 
          bgClass: 'bg-green-100 text-green-700' 
        };
      case 'completed':
        return { 
          label: t('orders.status.completed', 'Terminée'), 
          color: 'subtle', 
          bgClass: 'bg-zinc-200 text-zinc-700' 
        };
      case 'cancelled':
        return { 
          label: t('orders.status.cancelled', 'Annulée'), 
          color: 'subtle', 
          bgClass: 'bg-zinc-200 text-zinc-700' 
        };
      default:
        return { 
          label: t('orders.status.new', 'Nouvelle'), 
          color: 'primary', 
          bgClass: 'bg-primary/10 text-primary' 
        };
    }
  };

  const statusDisplay = getStatusDisplay(order.status);
  const isServed = order.status === 'served';
  const isCompleted = order.status === 'completed';
  const isNew = order.status === 'pending' || order.status === 'new';
  const isPreparing = order.status === 'processing' || order.status === 'in_progress' || order.status === 'preparing';
  const isReady = order.status === 'ready';

  // Determine opacity based on status
  const opacityClass = isServed ? 'opacity-70' : isCompleted ? 'opacity-50' : '';

  // Calculer le total
  const totalAmount = order.total_amount || orderDetails.reduce((sum, item) => {
    const price = parseFloat(item.price || item.unitPrice || 0);
    const quantity = parseInt(item.quantity || 1, 10);
    return sum + (price * quantity);
  }, 0);

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden border-2 ${isNew ? 'border-red-300' : isPreparing ? 'border-yellow-300' : isReady ? 'border-blue-300' : 'border-gray-200'} ${opacityClass}`}>
      {/* En-tête avec Table et Statut */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg font-bold text-white ${isNew ? 'bg-red-500' : isPreparing ? 'bg-yellow-500' : isReady ? 'bg-blue-500' : 'bg-gray-500'}`}>
              {t('orders.table', 'Table')} {order.table || order.table_name || order.tableId || order.table_id || 'N/A'}
            </div>
            <div className="text-xs text-zinc-500">
              {getTimeAgo(order.createdAt || order.created_at)}
            </div>
          </div>
          {statusDisplay && (
            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${statusDisplay.bgClass}`}>
              {statusDisplay.label}
            </span>
          )}
        </div>
      </div>

      {/* Détails des plats à préparer */}
      <div className="px-4 py-3">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-zinc-700 mb-2">
            {t('orders.itemsToPrepare', 'Plats à préparer')} :
          </h4>
          <div className="space-y-2">
            {orderDetails.length > 0 ? (
              orderDetails.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-lg min-w-[2rem]">
                      {item.quantity}x
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">
                      {item.name || 'Item'}
                    </span>
                  </div>
                  {item.price && (
                    <span className="text-xs text-zinc-600">
                      {(parseFloat(item.price || item.unitPrice || 0) * parseInt(item.quantity || 1, 10)).toFixed(0)} XAF
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 italic">{t('orders.noItems', 'Aucun article')}</p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-sm font-semibold text-zinc-700">
            {t('orders.total', 'Total')} :
          </span>
          <span className="text-base font-bold text-primary">
            {totalAmount.toFixed(0)} XAF
          </span>
        </div>

        {/* Notes client si présentes */}
        {order.customerNotes && order.customerNotes.trim() && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-zinc-600 mb-1">
              {t('orders.customerNotes', 'Notes client')} :
            </p>
            <p className="text-sm text-zinc-700 bg-yellow-50 rounded px-2 py-1.5 border border-yellow-200">
              {order.customerNotes}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={`px-sm pb-sm pt-xs ${isNew ? 'flex gap-sm' : ''}`}>
        {isNew && onAccept && onDecline && (
          <>
            <button 
              className="w-full h-10 font-bold text-white rounded-md bg-primary hover:bg-primary/90 transition-colors"
              onClick={() => onAccept(order.id)}
            >
              {t('orders.action.accept', 'Accepter')}
            </button>
            <button 
              className="w-full h-10 font-bold rounded-md text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
              onClick={() => onDecline(order.id)}
            >
              {t('orders.action.decline', 'Refuser')}
            </button>
          </>
        )}
        {isPreparing && onReadyForPickup && (
          <button 
            className="w-full h-10 font-bold text-white rounded-md bg-yellow-500 hover:bg-yellow-600 transition-colors"
            onClick={() => onReadyForPickup(order.id)}
          >
            {t('orders.action.readyForPickup', 'Prête à servir')}
          </button>
        )}
        {isReady && onServed && (
          <button 
            className="w-full h-10 font-bold text-white rounded-md bg-green-600 hover:bg-green-700 transition-colors"
            onClick={() => onServed(order.id)}
          >
            {t('orders.action.markAsServed', 'Marquer comme servi')}
          </button>
        )}
        {/* Note: Les commandes servies sont supprimées automatiquement, donc pas de bouton "Terminer" */}
      </div>
    </div>
  );
};

export default Order;
