import React from 'react';
import { Table2, ShoppingBag, TrendingUp } from 'lucide-react';

/**
 * Composant pour afficher les statistiques d'un établissement
 */
const PlaceStats = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex gap-2 mt-2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-12 bg-gray-100 rounded-md animate-pulse min-w-0" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="flex gap-2 mt-2 overflow-hidden">
      <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 bg-green-50 rounded-md min-w-0">
        <Table2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 overflow-hidden">
          <span className="text-xs text-muted-text truncate">Tables</span>
          <span className="text-sm font-semibold text-green-700 truncate">{stats.tables_count || 0}</span>
        </div>
      </div>
      <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 bg-blue-50 rounded-md min-w-0">
        <ShoppingBag className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 overflow-hidden">
          <span className="text-xs text-muted-text truncate">Aujourd'hui</span>
          <span className="text-sm font-semibold text-blue-700 truncate">{stats.orders_today || 0}</span>
        </div>
      </div>
      <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 bg-purple-50 rounded-md min-w-0">
        <TrendingUp className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
        <div className="flex flex-col min-w-0 overflow-hidden">
          <span className="text-xs text-muted-text truncate">Semaine</span>
          <span className="text-sm font-semibold text-purple-700 truncate">{stats.orders_week || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceStats;


