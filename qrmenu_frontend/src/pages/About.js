import React from 'react';
import { useHistory } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import BackButton from '../components/ui/BackButton';
import { Link } from 'react-router-dom';
import { Target, Heart, Zap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

const About = () => {
  const history = useHistory();
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-light-surface">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-zinc-50 to-zinc-100 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Back Button */}
              <div className="mb-6">
                <BackButton 
                  onClick={() => history.push('/')} 
                  ariaLabel="Retour à la page d'accueil" 
                />
              </div>
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-dark-text mb-4 sm:mb-6">
                  À propos de MenuHub
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-6 sm:mb-8">
                  MenuHub est une solution digitale innovante conçue pour révolutionner la gestion des restaurants et offrir une expérience client exceptionnelle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <div className="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-text mb-3 sm:mb-4">
                  Notre Mission
                </h2>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12 border border-gray-border">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  Rendre la restauration plus <strong className="text-primary">efficace</strong>, <strong className="text-primary">connectée</strong> et <strong className="text-primary">agréable</strong> pour tous.
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Nous croyons que chaque restaurant mérite des outils modernes pour prospérer dans l'ère digitale. MenuHub transforme la façon dont les restaurants gèrent leurs menus, interagissent avec leurs clients et optimisent leurs opérations quotidiennes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-text mb-3 sm:mb-4">
                Nos Valeurs
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                Les principes qui guident notre développement et notre service
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-border hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
                  <Heart className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-dark-text mb-2 sm:mb-3">Passion</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Nous sommes passionnés par l'amélioration de l'expérience culinaire et la satisfaction de nos utilisateurs.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-border hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-dark-text mb-2 sm:mb-3">Innovation</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Nous innovons constamment pour offrir les meilleures solutions technologiques à nos clients.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-border hover:shadow-lg transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-dark-text mb-2 sm:mb-3">Accessibilité</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Nous rendons la technologie accessible à tous les restaurants, quelle que soit leur taille.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-text mb-3 sm:mb-4">
                  Ce que nous offrons
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {[
                  "Menu digital interactif et personnalisable",
                  "Génération de QR codes illimitée pour vos tables",
                  "Gestion des commandes en temps réel",
                  "Système de paiement sécurisé",
                  "Tableau de bord analytique complet",
                  "Support client réactif et dédié"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4 bg-white rounded-lg p-3 sm:p-4 border border-gray-border">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm sm:text-base text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-primary to-primary/90 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-4">
              Prêt à rejoindre MenuHub ?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Découvrez comment MenuHub peut transformer votre restaurant dès aujourd'hui.
            </p>
            <Link 
              to="/register"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-primary bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary min-h-[44px] active:scale-[0.98]"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default About;
