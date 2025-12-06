import React, { useState, useContext, useEffect } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import { toast } from '../utils/toast';
import AuthContext from '../contexts/AuthContext';
import { LanguageToggle } from '../components/ui';
import FormField from '../components/auth/FormField';
import { useEmailValidation } from '../hooks/useEmailValidation';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const history = useHistory();
  const location = useLocation();
  const auth = useContext(AuthContext);
  
  const emailValidation = useEmailValidation(email);

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (auth.token) {
      // Redirection obligatoire vers /places (page des établissements de l'utilisateur)
      history.replace('/places');
    }
  }, [auth.token, history]);

  // Gérer les erreurs du backend
  useEffect(() => {
    if (auth.error) {
      toast.error(auth.error);
      setErrors({ submit: auth.error });
    }
  }, [auth.error]);

  const onClick = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation côté client
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (!emailValidation.isValid) {
      toast.error('Veuillez entrer un email valide');
      setErrors({ email: 'Format d\'email invalide' });
      return;
    }

    if (!auth.loading) {
      try {
        await auth.signIn(email, password, () => {
          toast.success('Connexion réussie !');
          // Redirection obligatoire vers /places (page des établissements de l'utilisateur)
          history.replace('/places');
        });
      } catch (error) {
        // L'erreur est gérée par le contexte
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light font-display">
      {/* Header moderne et simple */}
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

      {/* Main Content - Centré et responsive */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-safe">
        <div className="w-full max-w-md">
          {/* Bouton retour */}
          <button
            type="button"
            onClick={() => history.replace(location.state?.from || '/')}
            className="flex items-center gap-2 text-zinc-600 hover:text-[#FF5A1F] mb-4 sm:mb-6 transition-colors group min-h-[44px] min-w-[44px]"
            aria-label="Retour à l'accueil"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-medium">Retour à l'accueil</span>
          </button>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 mb-2 sm:mb-3">Connexion</h1>
              <p className="text-zinc-600 text-sm sm:text-base">Connectez-vous à votre compte MenuHub</p>
            </div>

            <form className="space-y-4 sm:space-y-5 lg:space-y-6" onSubmit={onClick}>
              <FormField
                id="email"
                name="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                icon={Mail}
                error={errors.email}
                isValid={emailValidation.isValid}
                validationMessage={emailValidation.message}
                required
              />

              <FormField
                id="password"
                name="password"
                label="Mot de passe"
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

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-sm sm:text-base font-medium text-primary hover:text-[#E54A0F] transition-colors min-h-[44px] min-w-[44px] px-2 -ml-2 flex items-center"
                  onClick={() => history.push('/forgot-password')}
                  aria-label="Mot de passe oublié"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] h-11 sm:h-12 flex items-center justify-center rounded-lg bg-primary text-white text-sm sm:text-base font-semibold hover:bg-[#E54A0F] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
                disabled={auth.loading}
                aria-label="Se connecter"
              >
                {auth.loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" aria-hidden="true"></span>
                ) : "Se connecter"}
              </button>
            </form>

            {/* Footer du formulaire */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-zinc-200 text-center">
              <p className="text-sm sm:text-base text-zinc-600">
                Pas de compte ?{' '}
                <button
                  type="button"
                  className="font-semibold text-primary hover:text-[#E54A0F] transition-colors min-h-[44px] min-w-[44px] inline-flex items-center"
                  onClick={() => history.replace('/register')}
                  aria-label="Créer un compte"
                >
                  Créer un compte
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;