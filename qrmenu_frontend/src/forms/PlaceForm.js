import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "../utils/toast";
import { Building2, MapPin, Phone, CheckCircle2, Loader2 } from "lucide-react";
import { addPlace } from "../services/api/places";
import AuthContext from "../contexts/AuthContext";
import ImageDropzone from "./ImageDropzone";
import FormField from "../components/auth/FormField";

const PlaceForm = ({ onDone }) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logo, setLogo] = useState("");
  const [createdPlace, setCreatedPlace] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const auth = useContext(AuthContext);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = t('places.form.nameRequired');
    }

    if (!address.trim()) {
      newErrors.address = t('places.form.addressRequired');
    }

    if (phone && !/^[\d\s+\-()]+$/.test(phone)) {
      newErrors.phone = t('places.form.phoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      toast.error(t('places.form.validationError'));
      return;
    }

    setIsSubmitting(true);
    try {
      const json = await addPlace({ 
        name: name.trim(), 
        description: description.trim(), 
        address: address.trim(), 
        phone: phone.trim(), 
        logo_url: logo 
      }, auth.token);
      
      if (json && json.id) {
        setCreatedPlace(json);
        toast.success(t('places.form.createSuccess'));
        setName("");
        setDescription("");
        setAddress("");
        setPhone("");
        setLogo("");
        if (onDone) onDone(json);
      }
    } catch (err) {
      console.error('Erreur création établissement:', err);
      const errorMessage = err?.response?.data?.message || err?.message || t('places.form.createError');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      default:
        break;
    }
  };

  if (createdPlace) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-scale-in">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-dark-text mb-2">{t('places.form.successTitle')}</h3>
        <p className="text-sm sm:text-base text-muted-text mb-4 sm:mb-6 max-w-md">{t('places.form.successDescription')}</p>
        <button
          onClick={() => window.location.href = `/places/${createdPlace.id}/edit`}
          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary shadow-lg min-h-[44px] text-sm sm:text-base active:scale-[0.98]"
        >
          {t('places.form.configureMenu')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6">
      <FormField
        id="name"
        name="name"
        label={t('places.form.name')}
        type="text"
        value={name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder={t('places.form.namePlaceholder')}
        icon={Building2}
        error={errors.name}
        required
      />

      <div>
        <label 
          htmlFor="description" 
            className="block text-sm sm:text-base font-medium text-zinc-700 mb-2 sm:mb-2.5 md:mb-3"
        >
          {t('places.form.description')}
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder={t('places.form.descriptionPlaceholder')}
          rows={4}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white text-sm sm:text-base text-zinc-900 placeholder-zinc-400 border-2 border-gray-200 focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/20 transition-all outline-none resize-none min-h-[100px] sm:min-h-[120px]"
        />
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
      <FormField
        id="address"
        name="address"
        label={t('places.form.address')}
        type="text"
        value={address}
        onChange={(e) => handleChange('address', e.target.value)}
        placeholder={t('places.form.addressPlaceholder')}
        icon={MapPin}
        error={errors.address}
        required
      />

      <FormField
        id="phone"
        name="phone"
        label={t('places.form.phone')}
        type="tel"
        value={phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        placeholder={t('places.form.phonePlaceholder')}
        icon={Phone}
        error={errors.phone}
      />
        </div>

      <div>
        <label 
          htmlFor="logo" 
            className="block text-sm sm:text-base font-medium text-zinc-700 mb-2 sm:mb-2.5 md:mb-3"
        >
          {t('places.form.logo')}
        </label>
        <ImageDropzone value={logo} onChange={setLogo} />
        </div>
      </div>

      <div className="pt-2 sm:pt-3 md:pt-4 border-t border-gray-200">
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[44px] h-11 sm:h-12 flex items-center justify-center gap-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-sm sm:text-base active:scale-[0.98]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t('places.form.creating')}</span>
          </>
        ) : (
          <span>{t('places.form.createButton')}</span>
        )}
      </button>
      </div>
    </form>
  );
}

export default PlaceForm;
