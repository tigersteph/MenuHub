import React from 'react';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import { CheckCircle2, XCircle } from 'lucide-react';

/**
 * Composant pour afficher la force d'un mot de passe
 */
const PasswordStrength = ({ password, showDetails = true }) => {
  const strength = usePasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Barre de progression */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded transition-all duration-300 ${
              level <= strength.level
                ? strength.color
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Label et détails */}
      {showDetails && (
        <>
          {strength.label && (
            <p className={`text-xs font-medium ${
              strength.level === 4 ? 'text-green-600' :
              strength.level === 3 ? 'text-yellow-600' :
              strength.level === 2 ? 'text-orange-600' :
              strength.level === 1 ? 'text-red-600' :
              'text-gray-500'
            }`}>
              Force : {strength.label}
            </p>
          )}

          {/* Liste des critères */}
          <div className="space-y-1 mt-2">
            {[
              { key: 'length', label: 'Au moins 8 caractères' },
              { key: 'uppercase', label: 'Au moins une majuscule' },
              { key: 'lowercase', label: 'Au moins une minuscule' },
              { key: 'number', label: 'Au moins un chiffre' },
              { key: 'special', label: 'Au moins un caractère spécial' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                {strength.checks[key] ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                )}
                <span className={strength.checks[key] ? 'text-green-600' : 'text-gray-400'}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PasswordStrength;

