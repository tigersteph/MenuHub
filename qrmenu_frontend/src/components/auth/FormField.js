import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

/**
 * Composant de champ de formulaire amélioré avec icône, validation et messages d'erreur
 */
const FormField = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  isValid,
  validationMessage,
  required = false,
  showPasswordToggle = false,
  onTogglePassword,
  showPassword = false,
  ...props
}) => {
  const inputId = id || name;

  return (
    <div>
      <label 
        htmlFor={inputId} 
        className="block text-sm font-medium text-zinc-700 mb-3"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {/* Icône à gauche */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            <Icon className="h-5 w-5" />
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full h-12 rounded-lg bg-white text-zinc-900 placeholder-zinc-400 border-2 transition-all outline-none ${
            Icon ? 'pl-12 pr-4' : 'px-4'
          } ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : isValid === true
              ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
              : isValid === false
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-200 focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/20'
          }`}
          {...props}
        />

        {/* Icône de validation à droite */}
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid === true && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            {isValid === false && (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}

        {/* Bouton toggle password */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 transition-colors"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {props['data-eye-icon']}
          </button>
        )}
      </div>

      {/* Messages de validation/erreur */}
      {(error || validationMessage) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          {error ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
              <span className="text-red-600">{error}</span>
            </>
          ) : validationMessage ? (
            <span className={isValid ? 'text-green-600' : 'text-red-600'}>
              {validationMessage}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FormField;

