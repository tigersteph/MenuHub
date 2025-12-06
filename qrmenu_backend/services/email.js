/**
 * Service d'envoi d'emails
 * Utilise Nodemailer pour l'envoi d'emails transactionnels
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.transporter = null;
    this.enabled = process.env.EMAIL_ENABLED === 'true';
  }

  /**
   * Initialiser le transporteur d'email
   */
  async initialize() {
    if (!this.enabled) {
      logger.info('Email service disabled');
      return;
    }

    try {
      // Configuration du transporteur
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true pour 465, false pour autres ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        // Pour les environnements de développement avec des services comme Mailtrap
        ...(process.env.SMTP_IGNORE_TLS === 'true' && {
          tls: {
            rejectUnauthorized: false
          }
        })
      });

      // Vérifier la connexion
      await this.transporter.verify();
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service', { error: error.message });
      this.enabled = false;
    }
  }

  /**
   * Charger un template d'email
   */
  async loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
      let html = await fs.readFile(templatePath, 'utf-8');

      // Remplacer les variables dans le template
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, variables[key]);
      });

      return html;
    } catch (error) {
      logger.error('Failed to load email template', { templateName, error: error.message });
      // Retourner un template par défaut
      return this.getDefaultTemplate(templateName, variables);
    }
  }

  /**
   * Template par défaut si le fichier n'existe pas
   */
  getDefaultTemplate(templateName, variables) {
    if (templateName === 'reset-password') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF5A1F; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background: #FF5A1F; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MenuHub</h1>
            </div>
            <div class="content">
              <h2>Réinitialisation de votre mot de passe</h2>
              <p>Bonjour,</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <p style="text-align: center;">
                <a href="${variables.resetLink}" class="button">Réinitialiser mon mot de passe</a>
              </p>
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #666;">${variables.resetLink}</p>
              <p><strong>Ce lien est valide pendant 1 heure.</strong></p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MenuHub. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    return '<p>Email from MenuHub</p>';
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(email, resetLink, userName = '') {
    if (!this.enabled || !this.transporter) {
      logger.warn('Email service not available, password reset link logged instead', { email, resetLink });
      return false;
    }

    try {
      const html = await this.loadTemplate('reset-password', {
        resetLink,
        userName: userName || 'Utilisateur',
        appName: 'MenuHub',
        year: new Date().getFullYear()
      });

      const mailOptions = {
        from: `"MenuHub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - MenuHub',
        html,
        text: `Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe. Cliquez sur ce lien : ${resetLink}\n\nCe lien est valide pendant 1 heure.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\n© ${new Date().getFullYear()} MenuHub`
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Password reset email sent', { email, messageId: info.messageId });
      return true;
    } catch (error) {
      logger.error('Failed to send password reset email', { email, error: error.message });
      return false;
    }
  }

  /**
   * Envoyer un email de bienvenue
   */
  async sendWelcomeEmail(email, userName = '') {
    if (!this.enabled || !this.transporter) {
      return false;
    }

    try {
      const html = await this.loadTemplate('welcome', {
        userName: userName || 'Utilisateur',
        appName: 'MenuHub',
        year: new Date().getFullYear()
      });

      const mailOptions = {
        from: `"MenuHub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Bienvenue sur MenuHub !',
        html,
        text: `Bonjour ${userName},\n\nBienvenue sur MenuHub ! Nous sommes ravis de vous compter parmi nous.\n\n© ${new Date().getFullYear()} MenuHub`
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Welcome email sent', { email, messageId: info.messageId });
      return true;
    } catch (error) {
      logger.error('Failed to send welcome email', { email, error: error.message });
      return false;
    }
  }
}

// Singleton
const emailService = new EmailService();

module.exports = emailService;

