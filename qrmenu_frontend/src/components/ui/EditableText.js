import React, { useState, useRef, useEffect } from 'react';

/**
 * Composant pour l'édition inline de texte
 */
const EditableText = ({
  value,
  onSave,
  placeholder = 'Cliquez pour éditer',
  className = '',
  textClassName = '',
  inputClassName = '',
  disabled = false,
  multiline = false,
  validate = null,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (multiline) {
        inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
      } else {
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && multiline && e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value || '');
      setIsEditing(false);
      setError('');
    }
  };

  const handleSave = async () => {
    if (validate) {
      const validationError = validate(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (editValue.trim() !== (value || '').trim() && editValue.trim()) {
      try {
        await onSave(editValue.trim());
        setIsEditing(false);
        setError('');
      } catch (err) {
        setError(err.message || 'Erreur lors de la sauvegarde');
      }
    } else {
      setIsEditing(false);
      setError('');
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    return (
      <div className="w-full">
        <InputComponent
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            setError('');
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary ${error ? 'border-alert' : ''} ${inputClassName}`}
          rows={multiline ? 3 : undefined}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-alert">{error}</p>
        )}
      </div>
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 transition-colors ${disabled ? 'cursor-default hover:bg-transparent' : ''} ${textClassName} ${className}`}
      title={disabled ? undefined : 'Cliquez pour éditer'}
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </span>
  );
};

export default EditableText;
