import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import BackButton from '../components/ui/BackButton';
import { Mail, Linkedin, Send, MessageSquare, User, Phone, Loader2 } from 'lucide-react';
import { request } from '../services/api';
import { toast } from '../utils/toast';

const Contact = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await request('/api/contact', {
        method: 'POST',
        data: formData,
        showErrorToast: true
      });

      if (response && response.success) {
        toast.success(response.message || 'Votre message a été envoyé avec succès !');
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error('Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.');
      }
    } catch (error) {
      // L'erreur est déjà gérée par la fonction request avec toast.error
      console.error('Error sending contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  Contactez-nous
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                  Une question ? Une suggestion ? Nous sommes là pour vous aider. N'hésitez pas à nous contacter.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Methods & Form */}
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-text mb-4 sm:mb-6">
                  Informations de contact
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-border hover:shadow-lg transition-shadow duration-200">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary">
                        <User className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-dark-text mb-1">Développeur</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Stephane Gervais Tibe</p>
                    </div>
                  </div>

                  <a 
                    href="mailto:senseitenten24@gmail.com"
                    className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-border hover:shadow-lg transition-all duration-200 hover:border-primary group min-h-[44px]"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                        <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-dark-text mb-1 group-hover:text-primary transition-colors duration-200">Email</h3>
                      <p className="text-xs sm:text-sm text-gray-600 break-all">senseitenten24@gmail.com</p>
                    </div>
                  </a>

                  <a 
                    href="tel:+237656710135"
                    className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-border hover:shadow-lg transition-all duration-200 hover:border-primary group min-h-[44px]"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                        <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-dark-text mb-1 group-hover:text-primary transition-colors duration-200">Téléphone (WhatsApp)</h3>
                      <p className="text-xs sm:text-sm text-gray-600">+237 656 710 135</p>
                    </div>
                  </a>

                  <a 
                    href="tel:+237676773396"
                    className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-border hover:shadow-lg transition-all duration-200 hover:border-primary group min-h-[44px]"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                        <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-dark-text mb-1 group-hover:text-primary transition-colors duration-200">Téléphone</h3>
                      <p className="text-xs sm:text-sm text-gray-600">+237 676 773 396</p>
                    </div>
                  </a>

                  <a 
                    href="https://www.linkedin.com/in/stephane-gerv-tibe/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-border hover:shadow-lg transition-all duration-200 hover:border-primary group min-h-[44px]"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                        <Linkedin className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-dark-text mb-1 group-hover:text-primary transition-colors duration-200">LinkedIn</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Profil LinkedIn</p>
                    </div>
                  </a>
                </div>

                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-[#FF5A1F]/10 to-[#E54A0F]/10 rounded-xl border border-[#FF5A1F]/20">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-dark-text mb-1">Temps de réponse</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Nous répondons généralement dans les 24 heures suivant votre demande.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-text mb-4 sm:mb-6">
                  Envoyez-nous un message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm sm:text-base font-semibold text-zinc-700 mb-2 sm:mb-3">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-border bg-white text-sm sm:text-base text-dark-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 min-h-[44px]"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm sm:text-base font-semibold text-zinc-700 mb-2 sm:mb-3">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-border bg-white text-sm sm:text-base text-dark-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 min-h-[44px]"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm sm:text-base font-semibold text-zinc-700 mb-2 sm:mb-3">
                      Sujet
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-border bg-white text-sm sm:text-base text-dark-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 min-h-[44px]"
                      placeholder="Sujet de votre message"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm sm:text-base font-semibold text-zinc-700 mb-2 sm:mb-3">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-border bg-white text-sm sm:text-base text-dark-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 resize-none min-h-[120px]"
                      placeholder="Votre message..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Contact;
