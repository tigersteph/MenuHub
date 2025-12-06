import React, { useState, useEffect } from 'react';
import { useHistory, Link, useLocation } from 'react-router-dom';
import { toast } from '../utils/toast';
import { LanguageToggle } from '../components/ui';
import FormField from '../components/auth/FormField';
import PasswordStrength from '../components/auth/PasswordStrength';
import { resetPassword } from '../services/api/auth';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState("");
  const history = useHistory();
  const location = useLocation();

  // Récupérer le token depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (!tokenFromUrl) {
      toast.error('Token de réinitialisation manquant');
      history.replace('/forgot-password');
      return;
    }
    
    setToken(tokenFromUrl);
  }, [location.search, history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!password) {
      setErrors({ password: 'Le mot de passe est requis' });
      toast.error('Veuillez entrer un mot de passe');
      return;
    }

    if (password.length < 8) {
      setErrors({ password: 'Le mot de passe doit contenir au moins 8 caractères' });
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!confirmPassword) {
      setErrors({ confirmPassword: 'Veuillez confirmer votre mot de passe' });
      toast.error('Veuillez confirmer votre mot de passe');
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' });
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (!token) {
      toast.error('Token de réinitialisation manquant');
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword(token, password, confirmPassword);
      if (response) {
        setIsSuccess(true);
        toast.success('Mot de passe réinitialisé avec succès !');
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          history.replace('/login');
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la réinitialisation du mot de passe';
      toast.error(errorMessage);
      
      // Si le token est invalide ou expiré, rediriger vers forgot-password
      if (errorMessage.includes('invalide') || errorMessage.includes('expiré')) {
        setTimeout(() => {
          history.replace('/forgot-password');
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
                Mot de passe réinitialisé !
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 mb-4 sm:mb-6">
                Votre mot de passe a été réinitialisé avec succès. 
                Vous allez être redirigé vers la page de connexion...
              </p>
              <button
                onClick={() => history.replace('/login')}
                className="w-full min-h-[44px] h-11 sm:h-12 flex items-center justify-center rounded-lg bg-[#FF5A1F] text-white text-sm sm:text-base font-semibold hover:bg-[#E54A0F] transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                aria-label="Aller à la connexion"
              >
                Aller à la connexion
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!token) {
    return null; // Le useEffect va rediriger
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
                Réinitialiser le mot de passe
              </h1>
              <p className="text-zinc-600 text-sm sm:text-base">
                Entrez votre nouveau mot de passe
              </p>
            </div>

            <form className="space-y-4 sm:space-y-5 lg:space-y-6" onSubmit={handleSubmit}>
              <div>
                <FormField
                  id="password"
                  name="password"
                  label="Nouveau mot de passe"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={Lock}
                  error={errors.password}
                  required
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  data-eye-icon={showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                />
                <PasswordStrength password={password} />
              </div>

              <FormField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                error={errors.confirmPassword}
                isValid={confirmPassword && password === confirmPassword ? true : null}
                validationMessage={confirmPassword && password === confirmPassword ? 'Les mots de passe correspondent' : null}
                required
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                data-eye-icon={showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              />

              <button
                type="submit"
                className="w-full min-h-[44px] h-11 sm:h-12 flex items-center justify-center rounded-lg bg-[#FF5A1F] text-white text-sm sm:text-base font-semibold hover:bg-[#E54A0F] transition-all focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
                disabled={isLoading || !password || !confirmPassword}
                aria-label="Réinitialiser le mot de passe"
              >
                {isLoading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" aria-hidden="true"></span>
                ) : "Réinitialiser le mot de passe"}
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

export default ResetPassword;

