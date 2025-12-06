const { success, error, handleControllerError } = require('../utils/response');
const logger = require('../utils/logger');
const multer = require('multer');
const { ValidationError } = require('../utils/errors');

// Import conditionnel de Cloudinary
let cloudinary = null;
try {
  cloudinary = require('cloudinary').v2;
  // Configuration Cloudinary si disponible (tous les credentials requis)
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    logger.info('Cloudinary configuré avec succès', { cloud_name: process.env.CLOUDINARY_CLOUD_NAME });
  } else {
    logger.warn('Cloudinary non configuré - variables d\'environnement manquantes', {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
    });
  }
} catch (err) {
  logger.warn('Cloudinary non installé, upload direct désactivé', { error: err.message });
}

// Configuration multer pour la mémoire (pas de stockage disque)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ValidationError('Le fichier doit être une image'), false);
    }
  }
});

const uploadController = {
  // Upload d'image via Cloudinary avec signature
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        throw new ValidationError('Aucun fichier fourni');
      }

      // Vérifier que Cloudinary est disponible
      if (!cloudinary) {
        throw new ValidationError(
          'Cloudinary n\'est pas installé sur le serveur. ' +
          'Installez-le avec: npm install cloudinary dans le dossier qrmenu_backend'
        );
      }

      // Vérifier que Cloudinary est configuré avec des credentials
      const hasCredentials = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME;
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
      
      // Convertir le buffer en base64
      const base64Image = req.file.buffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
      
      let result;
      
      if (hasCredentials) {
        // Upload signé avec credentials Cloudinary (méthode préférée - pas besoin de preset)
        try {
          result = await cloudinary.uploader.upload(dataURI, {
            folder: 'menuhub',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
            ]
          });
          logger.info('Image uploadée avec succès (signé)', { public_id: result.public_id });
        } catch (signedError) {
          logger.error('Erreur upload signé Cloudinary:', signedError);
          throw new ValidationError(
            `Impossible d'uploader l'image via Cloudinary. ` +
            `Vérifiez que CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET et CLOUDINARY_CLOUD_NAME sont correctement configurés dans votre fichier .env. ` +
            `Erreur: ${signedError.message}`
          );
        }
      } else if (preset) {
        // Upload avec preset unsigned (seulement si preset est défini)
        try {
          result = await cloudinary.uploader.upload(dataURI, {
            upload_preset: preset,
            folder: 'menuhub',
            resource_type: 'image'
          });
          logger.info('Image uploadée avec succès (preset)', { public_id: result.public_id });
        } catch (presetError) {
          logger.error('Erreur upload Cloudinary (preset):', presetError);
          throw new ValidationError(
            `Impossible d'uploader l'image. Le preset "${preset}" n'existe pas dans Cloudinary. ` +
            `Solutions :\n` +
            `1. Créez le preset "${preset}" dans votre compte Cloudinary (Settings → Upload) en mode "Unsigned"\n` +
            `2. Ou configurez CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans votre fichier .env pour utiliser l'upload signé (recommandé)`
          );
        }
      } else {
        // Aucune méthode disponible
        throw new ValidationError(
          `Configuration Cloudinary manquante. ` +
          `Configurez soit CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET (recommandé), ` +
          `soit CLOUDINARY_UPLOAD_PRESET dans votre fichier .env du backend.`
        );
      }

      return success(res, {
        secure_url: result.secure_url,
        url: result.url,
        public_id: result.public_id
      }, 'Image uploadée avec succès');

    } catch (err) {
      return handleControllerError(res, err, 'Erreur lors de l\'upload de l\'image');
    }
  }
};

module.exports = {
  uploadController,
  uploadMiddleware: upload.single('image')
};
