import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { toast } from '../utils/toast';
import { LanguageToggle } from '../components/ui';
import FormField from '../components/auth/FormField';
import { useEmailValidation } from '../hooks/useEmailValidation';
import { forgotPassword } from '../services/api/auth';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  
  const emailValidation = useEmailValidation(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    if (!emailValidation.isValid) {
      toast.error('Veuillez entrer un email valide');
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response) {
        setIsSubmitted(true);
        toast.success('Si cet email existe, un lien de réinitialisation vous a été envoyé.');
        
        // En développement, afficher le lien dans la console s'il est présent
        if (response.resetLink) {
          console.log('Lien de réinitialisation:', response.resetLink);
          // Optionnel: afficher le lien dans une alerte pour faciliter les tests
          // window.alert(`Lien de réinitialisation:\n${response.resetLink}`);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'envoi de l\'email';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light font-display">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-zinc-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-2xl font-bold text-zinc-900 hover:text-[#FF5A1F] transition-colors">
                MenuHub
              </Link>
              <div className="flex items-center gap-2">
                <LanguageToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-safe">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 p-4 sm:p-6 lg:p-8 text-center">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3 sm:mb-4">
                Email envoyé !
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 mb-4 sm:mb-6">
                Si l'adresse <strong>{email}</strong> existe dans notre système, 
                vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => history.replace('/login')}
                  className="w-full min-h-[44px] h-11 sm:h-12 flex items-center justify-center rounded-lg bg-[#FF5A1F] text-white text-sm sm:text-base font-semibold hover:bg-[#E54A0F] transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                  aria-label="Retour à la connexion"
                >
                  Retour à la connexion
                </button>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full min-h-[44px] h-11 sm:h-12 flex items-center justify-center rounded-lg bg-white text-[#FF5A1F] text-sm sm:text-base font-semibold border-2 border-[#FF5A1F] hover:bg-[#FF5A1F]/10 transition-all active:scale-[0.98]"
                  aria-label="Renvoyer l'email"
                >
                  Renvoyer l'email
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light font-display">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-zinc-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold text-zinc-900 hover:text-[#FF5A1F] transition-colors">
              MenuHub
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-safe">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => history.replace('/login')}
            className="flex items-center gap-2 text-zinc-600 hover:text-[#FF5A1F] mb-4 sm:mb-6 transition-colors group min-h-[44px] min-w-[44px]"
            aria-label="Retour à la connexion"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-medium">Retour à la connexion</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 mb-2 sm:mb-3">
                Mot de passe oublié ?
              </h1>
              <p className="text-zinc-600 text-sm sm:text-base">
                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe
              </p>
            </div>

            <form className="space-y-4 sm:space-y-5 lg:space-y-6" onSubmit={handleSubmit}>
              <FormField
                id="email"
                name="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                icon={Mail}
                isValid={emailValidation.isValid}
                validationMessage={emailValidation.message}
                required
              />

              <button
                type="submit"
                className="w-full min-h-[44px] h-11 sm:h-12 flex items-center justify-center rounded-lg bg-[#FF5A1F] text-white text-sm sm:text-base font-semibold hover:bg-[#E54A0F] transition-all focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
                disabled={isLoading || !emailValidation.isValid}
                aria-label="Envoyer le lien de réinitialisation"
              >
                {isLoading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" aria-hidden="true"></span>
                ) : "Envoyer le lien de réinitialisation"}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-zinc-200 text-center">
              <p className="text-sm sm:text-base text-zinc-600">
                Vous vous souvenez de votre mot de passe ?{' '}
                <button
                  type="button"
                  className="font-semibold text-[#FF5A1F] hover:text-[#E54A0F] transition-colors min-h-[44px] min-w-[44px] inline-flex items-center"
                  onClick={() => history.replace('/login')}
                  aria-label="Se connecter"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;

