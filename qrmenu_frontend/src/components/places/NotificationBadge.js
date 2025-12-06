import React from 'react';
import { Bell } from 'lucide-react';

/**
 * Badge de notification pour nouvelles commandes
 */
const NotificationBadge = ({ count, className = "" }) => {
  if (!count || count === 0) {
    return null;
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Bell className="w-5 h-5 text-muted-text" />
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  );
};

export default NotificationBadge;


