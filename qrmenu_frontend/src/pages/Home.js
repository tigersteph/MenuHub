import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Menu, Users, BarChart3, QrCode, Clock, Shield, Zap, CheckCircle2, ArrowRight, ChevronRight } from 'lucide-react';
import { LanguageToggle } from '../components/ui';
import { useScrollAnimation, useScrollDetection } from '../hooks/useScrollAnimation';
import AnimatedCounter from '../components/home/AnimatedCounter';
import EnhancedFooter from '../components/home/EnhancedFooter';
import TestimonialsSection from '../components/home/TestimonialsSection';

const Home = () => {
  const { t } = useTranslation();
  const [hasPlace, setHasPlace] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const auth = useAuth();
  const history = useHistory();
  
  // Hooks pour animations
  const isScrolled = useScrollDetection();
  const [heroRef, heroVisible] = useScrollAnimation({ threshold: 0.2 });
  const [featuresRef, featuresVisible] = useScrollAnimation({ threshold: 0.1 });
  const [statsRef, statsVisible] = useScrollAnimation({ threshold: 0.2 });
  const [howItWorksRef, howItWorksVisible] = useScrollAnimation({ threshold: 0.1 });
  const [benefitsRef, benefitsVisible] = useScrollAnimation({ threshold: 0.1 });
  const [ctaRef, ctaVisible] = useScrollAnimation({ threshold: 0.2 });
  
  // Vérifier l'authentification - utilise maintenant la logique centralisée
  // Le token dans auth.token est déjà vérifié par AuthContext
  const isAuthenticated = !!auth?.token;
  
  // Fonction pour gérer la redirection du bouton "Créer mon établissement" / "Commencer maintenant"
  const handleCreateEstablishment = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Si l'utilisateur est déjà connecté, rediriger vers /places
    // Sinon, rediriger vers /register pour créer un compte
    if (isAuthenticated) {
      history.push('/places');
    } else {
    history.push('/register');
    }
  };
  
  // Détection intelligente de l'utilisateur
  const getUserGreeting = () => {
    if (!isAuthenticated) {
      return { title: t('home.modernize'), description: t('home.heroDescription') };
    }
    if (hasPlace) {
      return { title: t('home.welcome'), description: t('home.welcomeDescription') };
    }
    return { 
      title: `Bienvenue${auth?.user?.name ? ` ${auth.user.name}` : ''} !`, 
      description: 'Créez votre premier établissement pour commencer à utiliser MenuHub.' 
    };
  };

  const greeting = getUserGreeting();
  
  React.useEffect(() => {
    // TODO: remplacer par un vrai fetch des établissements si besoin
    const places = window.localStorage.getItem('places');
    setHasPlace(places && JSON.parse(places).length > 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white font-display text-zinc-900">
      {/* Header avec shadow dynamique au scroll */}
      <header 
        className={`sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-zinc-200 transition-shadow duration-300 ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="text-2xl font-bold text-zinc-900 hover:text-[#FF5A1F] transition-colors duration-200"
                aria-label="MenuHub - Accueil"
              >
                MenuHub
              </Link>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-6">
              <nav className="flex items-center space-x-6">
                <Link 
                  to="/help"
                  className="text-sm font-medium text-zinc-700 hover:text-[#FF5A1F] transition-colors duration-200"
                >
                  {t('home.help') || 'Aide'}
                </Link>
                <Link 
                  to="/about"
                  className="text-sm font-medium text-zinc-700 hover:text-[#FF5A1F] transition-colors duration-200"
                >
                  {t('home.about') || 'À propos'}
                </Link>
                <Link 
                  to="/contact"
                  className="text-sm font-medium text-zinc-700 hover:text-[#FF5A1F] transition-colors duration-200"
                >
                  {t('home.contact') || 'Contact'}
                </Link>
              </nav>
              <div className="flex items-center gap-2">
                <LanguageToggle />
              </div>
              <Link 
                to={isAuthenticated ? "/places" : "/login"}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#FF5A1F] hover:bg-[#E54A0F] rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2 min-h-[44px]"
                aria-label={isAuthenticated ? 'Accéder au tableau de bord' : 'Se connecter'}
              >
                {t('home.dashboard')}
              </Link>
            </div>
            <div className="md:hidden">
              <button 
                className="p-2 rounded-md text-zinc-600 hover:text-[#FF5A1F] hover:bg-zinc-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200 shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              to="/help"
              className="block px-3 py-2.5 text-sm sm:text-base font-medium text-zinc-700 hover:text-[#FF5A1F] hover:bg-zinc-50 rounded-md transition-colors min-h-[44px] flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('home.help') || 'Aide'}
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2.5 text-sm sm:text-base font-medium text-zinc-700 hover:text-[#FF5A1F] hover:bg-zinc-50 rounded-md transition-colors min-h-[44px] flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('home.about') || 'À propos'}
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2.5 text-sm sm:text-base font-medium text-zinc-700 hover:text-[#FF5A1F] hover:bg-zinc-50 rounded-md transition-colors min-h-[44px] flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('home.contact') || 'Contact'}
            </Link>
            <div className="border-t border-zinc-200 pt-2 mt-2">
              <div className="flex items-center justify-center gap-2 py-2 mb-2">
                <LanguageToggle />
              </div>
              <Link
                to={isAuthenticated ? "/places" : "/login"}
                className="block px-3 py-2.5 text-sm sm:text-base font-semibold text-white bg-[#FF5A1F] hover:bg-[#E54A0F] rounded-md text-center transition-colors min-h-[44px] flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('home.dashboard')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section avec animations */}
        <section className="relative" ref={heroRef}>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            style={{
              backgroundImage: `url('/img/hero-restaurant.webp'), url('/img/hero-restau.jpg')`
            }}
            aria-label="Image de fond restaurant"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className={`relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center text-white transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              {greeting.title}
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-zinc-200 leading-relaxed">
              {greeting.description}
            </p>
            <div className="mt-8 sm:mt-10 flex justify-center">
              <button
                type="button"
                onClick={handleCreateEstablishment}
                className="inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-[#FF5A1F] hover:bg-[#E54A0F] rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2 focus:ring-offset-zinc-900 cursor-pointer min-h-[44px] active:scale-[0.98]"
                aria-label={isAuthenticated ? "Créer votre établissement" : "Créer mon compte"}
              >
                <span className="hidden sm:inline">{isAuthenticated ? "Créer mon établissement" : t('home.startNow')}</span>
                <span className="sm:hidden">{isAuthenticated ? "Créer" : t('home.startNow')}</span>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Features Section avec animations améliorées */}
        <section 
          ref={featuresRef}
          className={`py-12 sm:py-16 lg:py-24 bg-white transition-all duration-1000 ${
            featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 mb-3 sm:mb-4">
                {t('home.whyChoose')}
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-zinc-600 max-w-2xl mx-auto">
                {t('home.whyChooseDescription')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-zinc-200 hover:border-[#FF5A1F]/30 hover:-translate-y-2 transform">
                <div className="flex-shrink-0 mb-3 sm:mb-4">
                  <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] hover:bg-[#FF5A1F]/20 transition-colors duration-300">
                    <Menu size={24} className="sm:w-8 sm:h-8 hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2 sm:mb-3">{t('home.digitalMenu')}</h3>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    {t('home.digitalMenuDescription')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-zinc-200 hover:border-[#FF5A1F]/30 hover:-translate-y-2 transform">
                <div className="flex-shrink-0 mb-3 sm:mb-4">
                  <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] hover:bg-[#FF5A1F]/20 transition-colors duration-300">
                    <Users size={24} className="sm:w-8 sm:h-8 hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2 sm:mb-3">{t('home.customerEngagement')}</h3>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    {t('home.customerEngagementDescription')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-zinc-200 hover:border-[#FF5A1F]/30 hover:-translate-y-2 transform">
                <div className="flex-shrink-0 mb-3 sm:mb-4">
                  <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] hover:bg-[#FF5A1F]/20 transition-colors duration-300">
                    <BarChart3 size={24} className="sm:w-8 sm:h-8 hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2 sm:mb-3">{t('home.operationalEfficiency')}</h3>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    {t('home.operationalEfficiencyDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section avec compteurs animés */}
        <section 
          ref={statsRef}
          className={`py-12 sm:py-16 lg:py-24 bg-gradient-to-r from-[#FF5A1F] to-[#E54A0F] text-white transition-all duration-1000 ${
            statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-2">
                  {statsVisible ? <AnimatedCounter end={5} prefix="- " suffix=" min" startOnView={false} /> : "- 5 min"}
                </div>
                <div className="text-xs sm:text-sm lg:text-base xl:text-lg opacity-90">{t('home.orderToTable')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-2">
                  {statsVisible ? <AnimatedCounter end={50} suffix="K+" startOnView={false} /> : "50K+"}
                </div>
                <div className="text-xs sm:text-sm lg:text-base xl:text-lg opacity-90">{t('home.ordersPerMonth')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-2">
                  {statsVisible ? <AnimatedCounter end={98} suffix="%" startOnView={false} /> : "98%"}
                </div>
                <div className="text-xs sm:text-sm lg:text-base xl:text-lg opacity-90">{t('home.satisfaction')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-2">24/7</div>
                <div className="text-xs sm:text-sm lg:text-base xl:text-lg opacity-90">{t('home.support')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section avec timeline visuelle */}
        <section 
          ref={howItWorksRef}
          className={`py-12 sm:py-16 lg:py-24 bg-white transition-all duration-1000 ${
            howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 mb-3 sm:mb-4">
                {t('home.howItWorks')}
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-zinc-600 max-w-2xl mx-auto">
                {t('home.howItWorksDescription')}
              </p>
            </div>
            <div className="relative">
              {/* Timeline horizontale (desktop) */}
              <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF5A1F]/20 via-[#FF5A1F]/40 to-[#FF5A1F]/20" />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                {[
                  { step: 1, title: t('home.createAccount'), desc: t('home.createAccountDescription') },
                  { step: 2, title: t('home.configureMenu'), desc: t('home.configureMenuDescription') },
                  { step: 3, title: t('home.generateQRCodes'), desc: t('home.generateQRCodesDescription') },
                  { step: 4, title: t('home.receiveOrders'), desc: t('home.receiveOrdersDescription') }
                ].map((item, index) => (
                  <div key={item.step} className="relative">
                    <div className="text-center p-6 bg-zinc-50 rounded-xl border border-zinc-200 hover:shadow-xl hover:border-[#FF5A1F]/30 transition-all duration-300 hover:-translate-y-1 transform">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] mx-auto mb-4 relative z-10 border-4 border-white shadow-lg">
                        <span className="text-3xl font-bold text-zinc-900">{item.step}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-zinc-600">
                        {item.desc}
                      </p>
                    </div>
                    {/* Flèche de connexion (desktop) */}
                    {index < 3 && (
                      <div className="hidden md:block absolute top-20 -right-4 z-0">
                        <ChevronRight className="h-8 w-8 text-[#FF5A1F]/40" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section avec animations */}
        <section 
          ref={benefitsRef}
          className={`py-16 sm:py-24 bg-zinc-50 transition-all duration-1000 ${
            benefitsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-6">
                  {t('home.concreteBenefits')}
                </h2>
                <div className="space-y-4">
                  {[
                    { title: t('home.costReduction'), desc: t('home.costReductionDescription') },
                    { title: t('home.timeSavings'), desc: t('home.timeSavingsDescription') },
                    { title: t('home.salesIncrease'), desc: t('home.salesIncreaseDescription') },
                    { title: t('home.valuableData'), desc: t('home.valuableDataDescription') }
                  ].map((benefit, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-4 p-4 bg-white rounded-lg border border-zinc-200 hover:shadow-lg hover:border-[#FF5A1F]/30 transition-all duration-300 hover:-translate-x-1 transform"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle2 className="h-6 w-6 text-[#FF5A1F]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 mb-1">{benefit.title}</h3>
                        <p className="text-zinc-600">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: QrCode, title: t('home.unlimitedQRCodes'), desc: t('home.unlimitedQRCodesDescription') },
                  { icon: Clock, title: t('home.instantUpdate'), desc: t('home.instantUpdateDescription') },
                  { icon: Shield, title: t('home.securePayment'), desc: t('home.securePaymentDescription') },
                  { icon: Zap, title: t('home.optimalPerformance'), desc: t('home.optimalPerformanceDescription') }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index}
                      className="p-6 bg-white rounded-xl border border-[#FF5A1F]/20 hover:shadow-xl hover:border-[#FF5A1F]/40 transition-all duration-300 hover:-translate-y-1 transform"
                    >
                      <Icon className="h-12 w-12 text-[#FF5A1F] mb-4" />
                      <h3 className="font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-zinc-600">{feature.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section avec variantes améliorées */}
        <section 
          ref={ctaRef}
          className={`bg-gradient-to-br from-zinc-50 to-zinc-100 py-16 sm:py-24 transition-all duration-1000 ${
            ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
              {t('home.readyToTransform')}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-600 leading-relaxed mb-8">
              {t('home.readyToTransformDescription')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={handleCreateEstablishment}
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-[#FF5A1F] hover:bg-[#E54A0F] rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2 cursor-pointer"
                aria-label={isAuthenticated ? "Créer votre établissement" : "Créer mon compte"}
              >
                {isAuthenticated ? "Créer mon établissement" : t('home.startFree')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <Link 
                to="/about"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-zinc-900 bg-white rounded-lg shadow-lg hover:shadow-xl border-2 border-zinc-200 hover:border-[#FF5A1F] transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2"
                aria-label="En savoir plus sur MenuHub"
              >
                {t('home.learnMore')}
              </Link>
            </div>
            <p className="mt-6 text-sm text-zinc-500">
              {t('home.freeTrial')}
            </p>
          </div>
        </section>

        {/* Section Témoignages (structure prête) */}
        <TestimonialsSection />
      </main>

      {/* Footer amélioré */}
      <EnhancedFooter />
    </div>
  );
};

export default Home;