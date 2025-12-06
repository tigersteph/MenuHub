import React from 'react';
import { Table2, ShoppingBag, TrendingUp, Building2 } from 'lucide-react';

/**
 * Vue dashboard globale avec statistiques agrégées
 */
const PlacesDashboard = ({ places, placesStats, onCreatePlace }) => {
  // Calculer les statistiques globales
  const globalStats = React.useMemo(() => {
    const totalTables = Object.values(placesStats).reduce((sum, stats) => sum + (stats?.tables_count || 0), 0);
    const totalOrdersToday = Object.values(placesStats).reduce((sum, stats) => sum + (stats?.orders_today || 0), 0);
    const totalOrdersWeek = Object.values(placesStats).reduce((sum, stats) => sum + (stats?.orders_week || 0), 0);
    const activePlaces = places.length;

    return {
      totalTables,
      totalOrdersToday,
      totalOrdersWeek,
      activePlaces
    };
  }, [places, placesStats]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Carte: Établissements actifs */}
        <div className="bg-card-surface rounded-lg border border-gray-border p-6 shadow-custom-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-text mb-1">Établissements</p>
              <p className="text-3xl font-bold text-dark-text">{globalStats.activePlaces}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Carte: Tables totales */}
        <div className="bg-card-surface rounded-lg border border-gray-border p-6 shadow-custom-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-text mb-1">Tables totales</p>
              <p className="text-3xl font-bold text-green-600">{globalStats.totalTables}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Table2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Carte: Commandes aujourd'hui */}
        <div className="bg-card-surface rounded-lg border border-gray-border p-6 shadow-custom-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-text mb-1">Commandes (Aujourd'hui)</p>
              <p className="text-3xl font-bold text-blue-600">{globalStats.totalOrdersToday}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Carte: Commandes semaine */}
        <div className="bg-card-surface rounded-lg border border-gray-border p-6 shadow-custom-light">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-text mb-1">Commandes (Semaine)</p>
              <p className="text-3xl font-bold text-purple-600">{globalStats.totalOrdersWeek}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Section détaillée par établissement */}
      <div className="bg-card-surface rounded-lg border border-gray-border p-6 shadow-custom-light">
        <h3 className="text-lg font-bold text-dark-text mb-4">Détails par établissement</h3>
        <div className="space-y-3">
          {places.map((place) => {
            const stats = placesStats[place.id];
            return (
              <div
                key={place.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-dark-text">{place.name}</p>
                  {place.address && (
                    <p className="text-sm text-muted-text">{place.address}</p>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-text">Tables</p>
                    <p className="text-lg font-bold text-green-600">{stats?.tables_count || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-text">Aujourd'hui</p>
                    <p className="text-lg font-bold text-blue-600">{stats?.orders_today || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-text">Semaine</p>
                    <p className="text-lg font-bold text-purple-600">{stats?.orders_week || 0}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton de création d'établissement */}
      {onCreatePlace && (
        <div className="mt-6">
          <button
            onClick={onCreatePlace}
            className="group flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-primary bg-primary/10 p-6 transition-all hover:border-solid hover:bg-primary/20 hover:shadow-custom-orange focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-primary">Créer un nouvel établissement</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default PlacesDashboard;


