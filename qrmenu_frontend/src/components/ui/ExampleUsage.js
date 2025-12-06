/**
 * Exemple d'utilisation des composants LanguageToggle et ThemeToggle
 * 
 * Ces composants peuvent être intégrés dans n'importe quel header ou navbar.
 * 
 * Exemple 1: Dans un header simple
 */
import React from 'react';
import { LanguageToggle, ThemeToggle } from './index';

export const ExampleHeader = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-900">
      <h1 className="text-xl font-bold">MenuHub</h1>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </header>
  );
};

/**
 * Exemple 2: Dans la navbar RestaurantNavbar
 */
import { LanguageToggle, ThemeToggle } from '../ui';

export const RestaurantNavbarWithToggles = ({ place }) => {
  return (
    <NavbarWrapper>
      <NavbarContent>
        {/* ... contenu existant ... */}
        <Toolbar>
          <LanguageToggle className="mr-2" />
          <ThemeToggle />
          {/* ... autres boutons ... */}
        </Toolbar>
      </NavbarContent>
    </NavbarWrapper>
  );
};

/**
 * Exemple 3: Dans la page Orders
 */
export const OrdersWithToggles = () => {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-md mx-auto">
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-md flex items-center justify-between border-b border-subtle-light/20 dark:border-subtle-dark/20">
          <h1 className="text-xl font-bold text-content-light dark:text-content-dark">Orders</h1>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            {/* ... autres boutons ... */}
          </div>
        </header>
        {/* ... reste du contenu ... */}
      </div>
    </div>
  );
};

