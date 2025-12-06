import React, { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { Menu as MenuIcon } from 'lucide-react';
import { LanguageToggle } from '../components/ui';

const MainLayout = ({ children }) => {
  const history = useHistory();
  const auth = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const handleMenuToggle = () => setMenuOpen(!menuOpen);

  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-sm border-b border-zinc-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl sm:text-2xl font-bold text-zinc-900 hover:text-[#FF5A1F] transition-colors duration-200">
                MenuHub
              </Link>
            </div>
            {/* Desktop Nav */}
            <div className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
              <div className="flex items-center gap-2">
                <LanguageToggle />
              </div>
              <Link 
                to="/"
                className="px-3 lg:px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-[#FF5A1F] transition-all duration-200 hover:bg-zinc-100 rounded-lg min-h-[44px] flex items-center"
              >
                Accueil
              </Link>
              <Link 
                to="/help"
                className="px-3 lg:px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-[#FF5A1F] transition-all duration-200 hover:bg-zinc-100 rounded-lg min-h-[44px] flex items-center"
              >
                Aide
              </Link>
              <Link 
                to="/contact"
                className="px-3 lg:px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-[#FF5A1F] transition-all duration-200 hover:bg-zinc-100 rounded-lg min-h-[44px] flex items-center"
              >
                Contact
              </Link>
              <Link 
                to="/about"
                className="px-3 lg:px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-[#FF5A1F] transition-all duration-200 hover:bg-zinc-100 rounded-lg min-h-[44px] flex items-center"
              >
                À propos
              </Link>
              {auth.token ? (
                <>
                  <Link 
                    to="/places"
                    className="inline-flex items-center justify-center px-4 lg:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#FF5A1F] hover:bg-[#E54A0F] rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2 min-h-[44px]"
                  >
                    Tableau de bord
                  </Link>
                  <button 
                    onClick={() => {auth.signOut(); history.push('/login')}}
                    className="px-3 lg:px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-red-600 transition-all duration-200 hover:bg-zinc-100 rounded-lg min-h-[44px] flex items-center"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="px-3 lg:px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-[#FF5A1F] transition-all duration-200 hover:bg-zinc-100 rounded-lg min-h-[44px] flex items-center"
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register"
                    className="inline-flex items-center justify-center px-4 lg:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#FF5A1F] hover:bg-[#E54A0F] rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2 min-h-[44px]"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
            {/* Mobile Nav */}
            <div className="md:hidden">
              <button 
                className="p-2 rounded-md text-zinc-600 hover:text-[#FF5A1F] hover:bg-zinc-100 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={handleMenuToggle}
                aria-label="Ouvrir le menu"
              >
                <MenuIcon size={24} />
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-background-light border-t border-zinc-200">
            <div className="px-4 py-2 space-y-1">
              <div className="flex items-center justify-center gap-2 py-2">
                <LanguageToggle />
              </div>
              <Link 
                to="/"
                className="block px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-700 hover:text-[#FF5A1F] hover:bg-zinc-100 rounded-lg transition-all duration-200 min-h-[44px] flex items-center" 
                onClick={() => setMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/help"
                className="block px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-700 hover:text-[#FF5A1F] hover:bg-zinc-100 rounded-lg transition-all duration-200 min-h-[44px] flex items-center" 
                onClick={() => setMenuOpen(false)}
              >
                Aide
              </Link>
              <Link 
                to="/contact"
                className="block px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-700 hover:text-[#FF5A1F] hover:bg-zinc-100 rounded-lg transition-all duration-200 min-h-[44px] flex items-center" 
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/about"
                className="block px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-700 hover:text-[#FF5A1F] hover:bg-zinc-100 rounded-lg transition-all duration-200 min-h-[44px] flex items-center" 
                onClick={() => setMenuOpen(false)}
              >
                À propos
              </Link>
              {auth.token ? (
                <>
                  <Link 
                    to="/places"
                    className="block px-4 py-2.5 text-sm sm:text-base font-semibold text-white bg-[#FF5A1F] hover:bg-[#E54A0F] rounded-lg text-center shadow-md transition-all duration-200 min-h-[44px] flex items-center justify-center" 
                    onClick={() => setMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  <button 
                    onClick={() => {auth.signOut(); history.push('/login'); setMenuOpen(false);}}
                    className="block w-full px-4 py-2.5 text-sm sm:text-base font-semibold text-red-600 hover:bg-zinc-100 rounded-lg text-left transition-all duration-200 min-h-[44px] flex items-center"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="block px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-700 hover:text-[#FF5A1F] hover:bg-zinc-100 rounded-lg transition-all duration-200 min-h-[44px] flex items-center" 
                    onClick={() => setMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register"
                    className="block px-4 py-2.5 text-sm sm:text-base font-semibold text-white bg-[#FF5A1F] hover:bg-[#E54A0F] rounded-lg text-center shadow-md transition-all duration-200 min-h-[44px] flex items-center justify-center" 
                    onClick={() => setMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-safe" style={{maxWidth: 1200}}>
        {children}
      </main>
    </>
  );
};

export default MainLayout;