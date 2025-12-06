import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

/**
 * Footer amélioré avec colonnes organisées, newsletter et réseaux sociaux
 */
const EnhancedFooter = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Connecter à l'API de newsletter
    // Pour l'instant, simulation
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <footer className="bg-white border-t border-zinc-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Produit */}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Produit</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                >
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                >
                  Tarifs
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                >
                  Démo
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Ressources</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/help" 
                  className="text-sm text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="text-sm text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="text-sm text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                >
                  Guide d'utilisation
                </Link>
              </li>
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Entreprise</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a 
                  href="#careers" 
                  className="text-sm text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                >
                  Carrières
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Newsletter</h3>
            <p className="text-sm text-zinc-600 mb-4">
              Recevez nos dernières actualités et conseils
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                required
                className="w-full px-4 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:border-transparent"
                aria-label="Email pour newsletter"
              />
              <button
                type="submit"
                disabled={isSubmitting || submitted}
                className="w-full px-4 py-2 text-sm font-semibold text-white bg-[#FF5A1F] hover:bg-[#E54A0F] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitted ? 'Inscrit !' : isSubmitting ? 'Inscription...' : "S'inscrire"}
              </button>
            </form>
          </div>
        </div>

        {/* Réseaux sociaux et contact */}
        <div className="border-t border-zinc-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600">Suivez-nous :</span>
              <div className="flex items-center gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-[#FF5A1F] transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:senseitenten24@gmail.com" className="hover:text-[#FF5A1F] transition-colors">
                  senseitenten24@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Légal et copyright */}
        <div className="border-t border-zinc-200 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
            <p>{t('home.copyright')}</p>
            <div className="flex items-center gap-6">
              <a href="#cgu" className="hover:text-[#FF5A1F] transition-colors">
                CGU
              </a>
              <a href="#privacy" className="hover:text-[#FF5A1F] transition-colors">
                Confidentialité
              </a>
              <a href="#cookies" className="hover:text-[#FF5A1F] transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;

