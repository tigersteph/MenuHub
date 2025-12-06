import React from 'react';
import { useTranslation } from 'react-i18next';
import Order from './Order';

/**
 * Composant pour afficher les commandes groupées par table
 */
const OrdersByTable = ({ orders, onAccept, onDecline, onReadyForPickup, onServed, onComplete }) => {
  const { t } = useTranslation();

  // Grouper les commandes par table (les commandes sont déjà filtrées dans Orders.js)
  const ordersByTable = React.useMemo(() => {
    const grouped = {};
    
    orders.forEach(order => {
      const tableKey = order.table || order.table_name || order.table_id || 'Sans table';
      const tableName = order.table_name || order.table || `Table ${order.table_id?.substring(0, 8) || 'N/A'}`;
      
      if (!grouped[tableKey]) {
        grouped[tableKey] = {
          tableName,
          tableId: order.table_id,
          orders: []
        };
      }
      
      grouped[tableKey].orders.push(order);
    });
    
    // Trier les commandes dans chaque groupe par statut et date
    Object.keys(grouped).forEach(tableKey => {
      grouped[tableKey].orders.sort((a, b) => {
        const statusPriority = {
          'pending': 0,
          'new': 0,
          'processing': 1,
          'in_progress': 1,
          'preparing': 1,
          'ready': 1.5, // Entre préparation et servi
          'served': 2,
          'completed': 3,
          'cancelled': 4
        };
        
        const aPriority = statusPriority[a.status] ?? 99;
        const bPriority = statusPriority[b.status] ?? 99;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        const aDate = new Date(a.createdAt || a.created_at || 0);
        const bDate = new Date(b.createdAt || b.created_at || 0);
      return bDate - aDate;
    });
  });
  
  return grouped;
}, [orders]);

  // Compter les commandes par statut pour chaque table
  const getTableStats = (tableOrders) => {
    const stats = {
      pending: 0,
      preparing: 0,
      served: 0,
      total: tableOrders.length
    };
    
    tableOrders.forEach(order => {
      if (order.status === 'pending' || order.status === 'new') {
        stats.pending++;
      } else if (order.status === 'processing' || order.status === 'in_progress' || order.status === 'preparing') {
        stats.preparing++;
      } else if (order.status === 'ready') {
        stats.preparing++; // Prête à servir compte comme "en préparation" visuellement
      } else if (order.status === 'served') {
        stats.served++;
      }
    });
    
    return stats;
  };

  const tableKeys = Object.keys(ordersByTable).sort((a, b) => {
    // Trier par nombre de commandes en attente (pending)
    const aPending = ordersByTable[a].orders.filter(o => o.status === 'pending' || o.status === 'new').length;
    const bPending = ordersByTable[b].orders.filter(o => o.status === 'pending' || o.status === 'new').length;
    
    if (aPending !== bPending) {
      return bPending - aPending; // Plus de commandes en attente en premier
    }
    
    // Ensuite par nombre total de commandes actives
    const aActive = ordersByTable[a].orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
    const bActive = ordersByTable[b].orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
    
    return bActive - aActive;
  });

  if (tableKeys.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {tableKeys.map(tableKey => {
        const { tableName, orders: tableOrders } = ordersByTable[tableKey];
        const stats = getTableStats(tableOrders);
        
        return (
          <div key={tableKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* En-tête de la table */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                    {tableName}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  {stats.pending > 0 && (
                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                      {stats.pending} {stats.pending === 1 ? 'en attente' : 'en attente'}
                    </span>
                  )}
                  {stats.preparing > 0 && (
                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                      {stats.preparing} {stats.preparing === 1 ? 'en préparation' : 'en préparation'}
                    </span>
                  )}
                  {stats.ready > 0 && (
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                      {stats.ready} {stats.ready === 1 ? 'prête' : 'prêtes'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Liste des commandes pour cette table */}
            <div className="divide-y divide-gray-100">
              {tableOrders.map(order => (
                <div key={order.id} className="p-4">
                  <Order
                    order={order}
                    onAccept={onAccept}
                    onDecline={onDecline}
                    onReadyForPickup={onReadyForPickup}
                    onServed={onServed}
                    onComplete={onComplete}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrdersByTable;
