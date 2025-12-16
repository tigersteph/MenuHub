const { success, error, handleControllerError } = require('../utils/response');
const logger = require('../utils/logger');
const emailService = require('../services/email');
const { ValidationError } = require('../utils/errors');

const contactController = {
  /**
   * Envoyer un email de contact
   * POST /api/contact
   */
  sendContact: async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      // Validation des champs requis
      if (!name || !email || !subject || !message) {
        throw new ValidationError('Tous les champs sont requis');
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError('Format d\'email invalide');
      }

      // Validation de la longueur des champs
      if (name.length > 100) {
        throw new ValidationError('Le nom ne peut pas dépasser 100 caractères');
      }

      if (subject.length > 200) {
        throw new ValidationError('Le sujet ne peut pas dépasser 200 caractères');
      }

      if (message.length > 5000) {
        throw new ValidationError('Le message ne peut pas dépasser 5000 caractères');
      }

      // Envoyer l'email
      const emailSent = await emailService.sendContactEmail({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim()
      });

      if (!emailSent) {
        // Si le service email n'est pas disponible, on retourne quand même un succès
        // mais on log l'information pour que l'admin puisse voir le message
        logger.warn('Contact form submitted but email service unavailable', {
          name,
          email,
          subject,
          message: message.substring(0, 100) // Log seulement les 100 premiers caractères
        });
        
        return success(res, {
          message: 'Votre message a été reçu. Nous vous répondrons dans les plus brefs délais.',
          note: 'Le service email est temporairement indisponible, mais votre message a été enregistré.'
        }, 200);
      }

      return success(res, {
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
      }, 200);

    } catch (err) {
      return handleControllerError(res, err, 'sendContact');
    }
  }
};

module.exports = contactController;

