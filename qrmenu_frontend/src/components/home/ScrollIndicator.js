import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Indicateur de scroll "Scroll pour découvrir"
 */
const ScrollIndicator = () => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <div className="flex flex-col items-center text-white">
        <span className="text-sm font-medium mb-2 opacity-80">
          Scroll pour découvrir
        </span>
        <ChevronDown className="h-6 w-6 animate-pulse" />
      </div>
    </div>
  );
};

export default ScrollIndicator;

