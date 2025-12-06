import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from '../utils/toast';
import AuthContext from '../contexts/AuthContext';
import { getProfile } from '../services/api/auth';
import { LanguageToggle } from '../components/ui';
import Avatar from '../components/ui/Avatar';
import { ArrowLeft, User, Mail, Calendar, Shield, Save, Edit2, Building } from 'lucide-react';
import { updateProfile } from '../services/api/auth';

/**
 * Page de profil utilisateur
 * Affiche et permet la modification des informations utilisateur
 */
const Profile = () => {
  const { t } = useTranslation();
  const auth = useContext(AuthContext);
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    restaurantName: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.token) {
        history.push('/login');
        return;
      }

      try {
        setLoading(true);
        const profile = await getProfile(auth.token);
        if (profile) {
          setUser(profile);
          setFormData({
            username: profile.username || '',
            email: profile.email || '',
            firstName: profile.firstName || profile.first_name || '',
            lastName: profile.lastName || profile.last_name || '',
            restaurantName: profile.restaurantName || profile.restaurant_name || ''
          });
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        toast.error(t('profile.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [auth.token, history, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = t('profile.usernameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('profile.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('profile.emailInvalid');
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('profile.firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('profile.lastNameRequired');
    }

    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = t('profile.restaurantNameRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(t('profile.validationError'));
      return;
    }

    try {
      await updateProfile({
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        restaurantName: formData.restaurantName
      }, auth.token);
      toast.success(t('profile.updateSuccess'));
      setIsEditing(false);
      // Recharger le profil
      const profile = await getProfile(auth.token);
      if (profile) {
        setUser(profile);
        // Mettre à jour le contexte d'authentification
        if (auth.updateUser) {
          auth.updateUser(profile);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      const errorMessage = err?.response?.data?.message || err?.message || t('profile.updateError');
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.firstName || user?.first_name || '',
      lastName: user?.lastName || user?.last_name || '',
      restaurantName: user?.restaurantName || user?.restaurant_name || ''
    });
    setErrors({});
  };

  const { i18n } = useTranslation();
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-base font-medium text-muted-text">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-light-surface font-display">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => history.push('/places')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={t('common.back')}
              >
                <ArrowLeft className="w-5 h-5 text-dark-text" />
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-dark-text">{t('profile.title')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-safe">
        <div className="max-w-3xl mx-auto">
          {/* Profile Card */}
          <div className="bg-card-surface rounded-lg border border-gray-border shadow-custom-light p-4 sm:p-6 lg:p-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-border">
              <Avatar
                name={user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '')
                  || user?.username || user?.name || ''}
                email={user?.email || ''}
                size={100}
                className="flex-shrink-0 sm:w-[120px] sm:h-[120px]"
              />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-text mb-2">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '')
                    || user?.username || user?.name || t('profile.user')}
                </h2>
                {(user?.restaurantName || user?.restaurant_name) && (
                  <p className="text-sm sm:text-base text-primary font-semibold mb-1">{user.restaurantName || user.restaurant_name}</p>
                )}
                <p className="text-sm sm:text-base text-muted-text">{user?.email || ''}</p>
                {user?.created_at && (
                  <p className="text-xs sm:text-sm text-muted-text mt-2">
                    {t('profile.memberSince')} {formatDate(user.created_at)}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-dark-text mb-2 sm:mb-3">
                  <User className="w-4 h-4" />
                  {t('profile.username')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base min-h-[44px] ${
                        errors.username ? 'border-red-500' : 'border-gray-border'
                      } bg-white text-dark-text focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder={t('profile.usernamePlaceholder')}
                    />
                    {errors.username && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.username}</p>
                    )}
                  </div>
                ) : (
                  <p className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-sm sm:text-base text-dark-text min-h-[44px] flex items-center">
                    {user?.username || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-dark-text mb-2 sm:mb-3">
                  <User className="w-4 h-4" />
                  {t('profile.firstName')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base min-h-[44px] ${
                        errors.firstName ? 'border-red-500' : 'border-gray-border'
                      } bg-white text-dark-text focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder={t('profile.firstNamePlaceholder')}
                    />
                    {errors.firstName && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.firstName}</p>
                    )}
                  </div>
                ) : (
                  <p className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-sm sm:text-base text-dark-text min-h-[44px] flex items-center">
                    {user?.firstName || user?.first_name || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-dark-text mb-2 sm:mb-3">
                  <User className="w-4 h-4" />
                  {t('profile.lastName')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base min-h-[44px] ${
                        errors.lastName ? 'border-red-500' : 'border-gray-border'
                      } bg-white text-dark-text focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder={t('profile.lastNamePlaceholder')}
                    />
                    {errors.lastName && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                ) : (
                  <p className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-sm sm:text-base text-dark-text min-h-[44px] flex items-center">
                    {user?.lastName || user?.last_name || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-dark-text mb-2 sm:mb-3">
                  <Building className="w-4 h-4" />
                  {t('profile.restaurantName')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base min-h-[44px] ${
                        errors.restaurantName ? 'border-red-500' : 'border-gray-border'
                      } bg-white text-dark-text focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder={t('profile.restaurantNamePlaceholder')}
                    />
                    {errors.restaurantName && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.restaurantName}</p>
                    )}
                  </div>
                ) : (
                  <p className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-sm sm:text-base text-dark-text min-h-[44px] flex items-center">
                    {user?.restaurantName || user?.restaurant_name || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-dark-text mb-2 sm:mb-3">
                  <Mail className="w-4 h-4" />
                  {t('profile.email')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base min-h-[44px] ${
                        errors.email ? 'border-red-500' : 'border-gray-border'
                      } bg-white text-dark-text focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder={t('profile.emailPlaceholder')}
                    />
                    {errors.email && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <p className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-sm sm:text-base text-dark-text min-h-[44px] flex items-center">
                    {user?.email || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-dark-text mb-2 sm:mb-3">
                  <Calendar className="w-4 h-4" />
                  {t('profile.accountCreated')}
                </label>
                <p className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-sm sm:text-base text-dark-text min-h-[44px] flex items-center">
                  {user?.created_at ? formatDate(user.created_at) : '-'}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-dark-text mb-2 sm:mb-3">
                  <Shield className="w-4 h-4" />
                  {t('profile.role')}
                </label>
                <p className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-sm sm:text-base text-dark-text capitalize min-h-[44px] flex items-center">
                  {user?.role || t('profile.user')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-border">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] text-sm sm:text-base active:scale-[0.98]"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t('profile.save')}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-dark-text rounded-lg font-semibold hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 min-h-[44px] text-sm sm:text-base active:scale-[0.98]"
                  >
                    {t('profile.cancel')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] text-sm sm:text-base active:scale-[0.98]"
                >
                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('profile.edit')}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

