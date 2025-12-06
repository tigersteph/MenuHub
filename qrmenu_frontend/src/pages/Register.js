import React, { useState, useContext, useEffect } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import { toast } from '../utils/toast';
import AuthContext from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Building } from "lucide-react";
import { LanguageToggle } from '../components/ui';
import FormField from '../components/auth/FormField';
import PasswordStrength from '../components/auth/PasswordStrength';
import { useEmailValidation } from '../hooks/useEmailValidation';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    restaurantName: "",
    password: "",
    confirmPassword: "",
  });
  const history = useHistory();
  const location = useLocation();
  const auth = useContext(AuthContext);

  const emailValidation = useEmailValidation(formData.email);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validation en temps réel
    if (name === 'confirmPassword' && formData.password) {
      if (value !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Les mots de passe ne correspondent pas'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!emailValidation.isValid) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = 'Le nom du restaurant est requis';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      await auth.register(
        formData.email,
        formData.password,
        formData.confirmPassword,
        () => {
          toast.success('Inscription réussie ! Bienvenue sur MenuHub');
          history.replace("/places");
        },
        formData.firstName,
        formData.lastName,
        formData.restaurantName
      );
    } catch (error) {
      // L'erreur est gérée par le contexte
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
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 overflow-y-auto pb-safe">
        <div className="w-full max-w-2xl my-4 sm:my-0">
          {/* Bouton retour */}
          <button
            type="button"
            onClick={() => history.replace('/')}
            className="flex items-center gap-2 text-zinc-600 hover:text-[#FF5A1F] mb-4 sm:mb-6 transition-colors group min-h-[44px] min-w-[44px]"
            aria-label="Retour à l'accueil"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-medium">Retour à l'accueil</span>
          </button>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 mb-2 sm:mb-3">Créer un compte</h1>
              <p className="text-zinc-600 text-sm sm:text-base">Rejoignez MenuHub et transformez votre restaurant</p>
            </div>

            <form className="space-y-4 sm:space-y-5 lg:space-y-6" onSubmit={handleSubmit}>
              {/* Prénom et Nom côte à côte sur desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <FormField
                  id="firstName"
                  name="firstName"
                  label="Prénom"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jean"
                  icon={User}
                  error={errors.firstName}
                  required
                />
                <FormField
                  id="lastName"
                  name="lastName"
                  label="Nom"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  icon={User}
                  error={errors.lastName}
                  required
                />
              </div>

              <FormField
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                icon={Mail}
                error={errors.email}
                isValid={emailValidation.isValid}
                validationMessage={emailValidation.message}
                required
              />

              <FormField
                id="restaurantName"
                name="restaurantName"
                label="Nom du restaurant"
                type="text"
                value={formData.restaurantName}
                onChange={handleChange}
                placeholder="Mon Restaurant"
                icon={Building}
                error={errors.restaurantName}
                required
              />

              <div>
                <FormField
                  id="password"
                  name="password"
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={Lock}
                  error={errors.password}
                  required
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  data-eye-icon={showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                />
                <PasswordStrength password={formData.password} />
              </div>

              <FormField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                error={errors.confirmPassword}
                isValid={formData.confirmPassword && formData.password === formData.confirmPassword ? true : null}
                validationMessage={formData.confirmPassword && formData.password === formData.confirmPassword ? 'Les mots de passe correspondent' : null}
                required
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                data-eye-icon={showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              />

              <button
                type="submit"
                className="w-full min-h-[44px] h-11 sm:h-12 flex items-center justify-center rounded-lg bg-primary text-white text-sm sm:text-base font-semibold hover:bg-[#E54A0F] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
                disabled={auth.loading}
                aria-label="Créer mon compte"
              >
                {auth.loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" aria-hidden="true"></span>
                ) : "Créer mon compte"}
              </button>
            </form>

            {/* Footer du formulaire */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-zinc-200 space-y-2 sm:space-y-3">
              <div className="text-center">
                <p className="text-sm sm:text-base text-zinc-600">
                  Déjà un compte ?{' '}
                <button
                  type="button"
                    className="font-semibold text-primary hover:text-[#E54A0F] transition-colors min-h-[44px] min-w-[44px] inline-flex items-center"
                  onClick={() => {
                    // Si l'utilisateur est déjà connecté, rediriger vers /places
                    // Sinon, rediriger vers /login
                    if (auth.token) {
                      history.replace('/places');
                    } else {
                      history.replace('/login');
                    }
                  }}
                  aria-label="Se connecter"
                >
                  Se connecter
                </button>
              </p>
            </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-zinc-500">
                En créant un compte, vous acceptez nos{' '}
                  <a href="/terms" className="text-primary hover:underline">conditions d'utilisation</a>
                {' '}et notre{' '}
                  <a href="/privacy" className="text-primary hover:underline">politique de confidentialité</a>
              </p>
              </div>
            </div>
            </div>
          </div>
        </main>
    </div>
  );
};

export default Register;