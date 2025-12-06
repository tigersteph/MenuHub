import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import BackButton from '../components/ui/BackButton';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  BookOpen, 
  MessageCircle,
  ArrowRight,
  QrCode,
  Menu,
  ShoppingCart,
  CreditCard,
  Settings
} from 'lucide-react';

const Help = () => {
  const history = useHistory();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "Comment créer mon premier restaurant ?",
      answer: "Après vous être inscrit, cliquez sur 'Créer un restaurant' dans votre tableau de bord. Remplissez les informations de base (nom, adresse, logo) et votre restaurant sera créé en quelques secondes."
    },
    {
      question: "Comment générer des QR codes pour mes tables ?",
      answer: "Une fois votre restaurant créé, allez dans la section 'QR Codes'. Vous pouvez créer un QR code pour chaque table. Le QR code sera généré automatiquement et vous pourrez le télécharger et l'imprimer."
    },
    {
      question: "Comment ajouter des plats à mon menu ?",
      answer: "Dans la section 'Paramètres du menu' de votre restaurant, cliquez sur 'Ajouter un plat'. Remplissez les informations (nom, description, prix, catégorie, photo) et sauvegardez. Le plat apparaîtra immédiatement dans le menu client."
    },
    {
      question: "Comment gérer les commandes ?",
      answer: "Toutes les commandes passées par vos clients apparaissent en temps réel dans la section 'Commandes' de votre tableau de bord. Vous pouvez voir les détails, changer le statut (en attente, en préparation, terminée) et suivre l'historique."
    },
    {
      question: "Les clients peuvent-ils payer en ligne ?",
      answer: "Oui, MenuHub intègre un système de paiement sécurisé. Les clients peuvent payer directement depuis leur téléphone après avoir passé commande via le QR code."
    },
    {
      question: "Puis-je modifier mon menu à tout moment ?",
      answer: "Absolument ! Vous pouvez modifier, ajouter ou retirer des plats à tout moment depuis votre tableau de bord. Les changements sont visibles immédiatement pour vos clients."
    }
  ];

  const workflowSteps = [
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Créez votre restaurant",
      description: "Inscrivez-vous et configurez votre établissement en quelques minutes"
    },
    {
      icon: <Menu className="h-6 w-6" />,
      title: "Configurez votre menu",
      description: "Ajoutez vos plats, catégories, prix et photos"
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "Générez vos QR codes",
      description: "Créez un QR code unique pour chaque table et imprimez-les"
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "Recevez les commandes",
      description: "Les clients scannent le QR code et commandent directement"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Gérez les paiements",
      description: "Suivez les paiements et gérez les transactions en temps réel"
    }
  ];

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
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
                  <HelpCircle className="h-8 w-8" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-dark-text mb-4 sm:mb-6">
                  Centre d'aide
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                  Tout ce dont vous avez besoin pour bien démarrer avec MenuHub
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-text mb-3 sm:mb-4">
                  Guide de démarrage rapide
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                  Suivez ces étapes pour configurer votre restaurant en quelques minutes
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {workflowSteps.map((step, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-border hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary">
                        {step.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <span className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary text-white text-xs sm:text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-dark-text">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 ml-0 sm:ml-11">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-text mb-3 sm:mb-4">
                  Questions fréquentes
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                  Trouvez rapidement les réponses à vos questions
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl border border-gray-border overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-zinc-50 transition-colors duration-200 min-h-[44px]"
                    >
                      <span className="text-sm sm:text-base font-semibold text-dark-text pr-4 flex-1 text-left">
                        {faq.question}
                      </span>
                      {openFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-text mb-3 sm:mb-4">
                  Besoin d'aide supplémentaire ?
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Link
                  to="/contact"
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-border hover:shadow-lg hover:border-primary transition-all duration-200 group min-h-[44px]"
                >
                  <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200 flex-shrink-0">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-dark-text group-hover:text-primary transition-colors duration-200">
                      Contactez le support
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Notre équipe est là pour vous aider
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-primary transition-colors duration-200 flex-shrink-0" />
                </Link>

                <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-border min-h-[44px]">
                  <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-dark-text">
                      Documentation complète
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Bientôt disponible
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Help;
