import React from 'react';

/**
 * Input réutilisable avec design uniforme
 */
const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  autoFocus = false,
  ...props
}) => {
  const inputClasses = `
    w-full px-4 py-2 rounded-lg border transition-all duration-200
    ${error 
      ? 'border-alert focus:border-alert focus:ring-1 focus:ring-alert' 
      : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'
    }
    outline-none text-base text-text-dark
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
    placeholder:text-gray-400
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-dark mb-2">
          {label}
          {required && <span className="text-alert ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        className={inputClasses}
        aria-label={label || placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id || 'input'}-error` : undefined}
        {...props}
      />
      {error && (
        <p 
          id={`${props.id || 'input'}-error`}
          className="mt-1 text-sm text-alert"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
