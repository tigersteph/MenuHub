import { useDropzone } from 'react-dropzone';
import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../services';

function ImageDropzone({ value, onChange }) {
  const { t } = useTranslation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Écouter les événements de token expiré
  useEffect(() => {
    const handleTokenExpired = () => {
      // Rediriger vers la page de connexion
      history.push('/login');
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, [history]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setLoading(true);
    setError(null);
    
    try {
      const json = await uploadImage(acceptedFiles[0]);
      // Cloudinary retourne 'secure_url' ou 'url'
      const imageUrl = json.secure_url || json.url;
      if (imageUrl) {
        onChange(imageUrl);
      } else {
        const errorMsg = json.error?.message || t('places.form.logoUploadError');
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Erreur upload image:', err);
      
      // Si le token est expiré, ne pas permettre de continuer
      if (err.message && err.message.includes('Token expiré')) {
        setError('Votre session a expiré. Vous allez être redirigé vers la page de connexion.');
        // La redirection sera gérée par l'événement auth:token-expired
        return;
      }
      
      // Afficher le message d'erreur spécifique si disponible
      let errorMsg = err.message || t('places.form.logoUploadError');
      
      // Améliorer le message pour les erreurs de configuration Cloudinary
      if (err.message && (err.message.includes('preset') || err.message.includes('Configuration') || err.message.includes('CLOUDINARY'))) {
        errorMsg = `Configuration Cloudinary manquante. L'image est optionnelle - vous pouvez continuer sans logo.`;
      }
      
      setError(errorMsg);
      // Ne pas bloquer : permettre de continuer sans image
      // L'image est optionnelle, on peut créer le restaurant sans logo
      onChange(''); // Réinitialiser pour permettre de continuer
    } finally {
      setLoading(false);
    }
  }, [onChange, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setError(null);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-4 sm:p-6 cursor-pointer transition-all
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
          }
          ${error ? 'border-red-500 bg-red-50' : ''}
          ${loading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {value ? (
          <div className="relative">
            <img 
              src={value} 
              alt={t('places.form.logoPreview')}
              className="w-full h-32 sm:h-48 object-cover rounded-lg shadow-md"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={t('places.form.removeLogo')}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin mb-2" />
            <p className="text-xs sm:text-sm text-muted-text">{t('places.form.uploading')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 ${
              isDragActive ? 'bg-primary/10' : 'bg-gray-100'
            }`}>
              {isDragActive ? (
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              ) : (
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-text" />
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-dark-text mb-1">
              {isDragActive 
                ? t('places.form.dropHere') 
                : t('places.form.dragDropOrClick')
              }
            </p>
            <p className="text-xs text-muted-text">
              {t('places.form.logoFormat')}
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700 font-medium flex items-center gap-2 mb-1">
            <X className="w-4 h-4 flex-shrink-0" />
            Avertissement : Upload d'image échoué
          </p>
          <p className="text-xs text-yellow-600 whitespace-pre-line mb-2">{error}</p>
          <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
            <p className="font-medium">✅ Vous pouvez continuer sans image</p>
            <p className="mt-1">L'image est optionnelle. Vous pouvez créer le restaurant maintenant et ajouter l'image plus tard.</p>
          </div>
          {(error.includes('preset') || error.includes('Configuration') || error.includes('CLOUDINARY')) && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              <p className="font-medium mb-1">💡 Pour activer l'upload d'images (optionnel) :</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Configurez Cloudinary dans <code className="bg-blue-100 px-1 rounded">qrmenu_backend/.env</code> :
                  <pre className="mt-1 p-2 bg-blue-100 rounded text-xs overflow-x-auto">CLOUDINARY_CLOUD_NAME=dtb7kciiu
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret</pre>
                </li>
                <li><strong>Redémarrez le serveur backend</strong> pour que les changements prennent effet</li>
                <li>L'upload fonctionnera automatiquement via le backend (méthode recommandée)</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageDropzone;