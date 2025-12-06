import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import PlaceStats from './PlaceStats';
import PlaceContextMenu from './PlaceContextMenu';
import NotificationBadge from './NotificationBadge';

/**
 * Composant carte d'établissement avec memoization
 */
const PlaceCard = React.memo(({ 
  place, 
  isSelected, 
  onSelect, 
  onManage, 
  onQRCodes,
  onDelete,
  onEdit,
  onDuplicate,
  onViewStats,
  stats,
  notificationCount = 0,
  t 
}) => {
  return (
    <div 
      className={`group flex flex-col gap-4 rounded-lg border-2 bg-card-surface p-4 shadow-custom-light transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer relative ${
        isSelected 
          ? 'border-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/20' 
          : 'border-gray-border hover:border-[#FF5A1F]/30'
      }`}
      onClick={onSelect}
    >
      {/* Menu contextuel en haut à droite */}
      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
        <PlaceContextMenu
          place={place}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onViewStats={onViewStats}
        />
      </div>

      {/* Badge Actif et Notifications */}
      <div className="flex items-center justify-between">
        {isSelected && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Actif
          </span>
        )}
        {notificationCount > 0 && (
          <NotificationBadge count={notificationCount} />
        )}
      </div>

      <div
        className="aspect-video w-full rounded-md bg-cover bg-center bg-gray-200"
        style={{ backgroundImage: `url('${place.logoUrl || place.logo_url || "/img/hero-restaurant.jpg"}')` }}
        loading="lazy"
      />
      <div className="flex flex-col">
        <p className="text-xl font-semibold text-dark-text">{place.name}</p>
        <p className="text-sm text-muted-text">{place.address || t('places.noAddress')}</p>
        {stats && <PlaceStats stats={stats} />}
      </div>
      <div className="mt-2 flex flex-1 items-end justify-stretch gap-3">
        <button
          className="flex h-11 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-primary px-4 text-sm font-bold text-light-text shadow-custom-orange transition-transform group-hover:scale-105 hover:bg-primary/80 focus:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={(e) => {
            e.stopPropagation();
            onManage();
          }}
        >
          <span className="truncate">{t('places.manage')}</span>
        </button>
        <button
          className="flex h-11 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-4 text-sm font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
          style={{
            backgroundColor: '#6C63FF'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5A52E5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6C63FF';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onQRCodes();
          }}
        >
          <span className="truncate">{t('places.qrCodes')}</span>
        </button>
      </div>
    </div>
  );
});

PlaceCard.displayName = 'PlaceCard';

export default PlaceCard;

