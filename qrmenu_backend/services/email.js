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

  /**
   * Envoyer un email de contact depuis le formulaire
   */
  async sendContactEmail(contactData) {
    const { name, email, subject, message } = contactData;
    
    if (!this.enabled || !this.transporter) {
      logger.warn('Email service not available, contact form submission logged', { name, email, subject });
      return false;
    }

    try {
      // Email pour le développeur (notification)
      const adminEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'senseitenten24@gmail.com';
      
      const adminHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF5A1F; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #FF5A1F; }
            .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #FF5A1F; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MenuHub - Nouveau message de contact</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nom complet :</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email :</div>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <div class="label">Sujet :</div>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <div class="label">Message :</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MenuHub. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const adminMailOptions = {
        from: `"MenuHub Contact" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: adminEmail,
        replyTo: email,
        subject: `[MenuHub Contact] ${subject}`,
        html: adminHtml,
        text: `Nouveau message de contact\n\nNom: ${name}\nEmail: ${email}\nSujet: ${subject}\n\nMessage:\n${message}`
      };

      // Email de confirmation pour l'utilisateur
      const userHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF5A1F; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MenuHub</h1>
            </div>
            <div class="content">
              <h2>Merci pour votre message !</h2>
              <p>Bonjour ${name},</p>
              <p>Nous avons bien reçu votre message concernant : <strong>${subject}</strong></p>
              <p>Notre équipe vous répondra dans les plus brefs délais, généralement sous 24 heures.</p>
              <p>En attendant, n'hésitez pas à nous contacter directement :</p>
              <ul>
                <li>Email : senseitenten24@gmail.com</li>
                <li>Téléphone (WhatsApp) : +237 656 710 135</li>
                <li>Téléphone : +237 676 773 396</li>
              </ul>
              <p>Cordialement,<br>L'équipe MenuHub</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MenuHub. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const userMailOptions = {
        from: `"MenuHub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Votre message a bien été reçu - MenuHub',
        html: userHtml,
        text: `Bonjour ${name},\n\nNous avons bien reçu votre message concernant : ${subject}\n\nNotre équipe vous répondra dans les plus brefs délais, généralement sous 24 heures.\n\nCordialement,\nL'équipe MenuHub`
      };

      // Envoyer les deux emails
      const [adminInfo, userInfo] = await Promise.all([
        this.transporter.sendMail(adminMailOptions),
        this.transporter.sendMail(userMailOptions)
      ]);

      logger.info('Contact emails sent', { 
        adminMessageId: adminInfo.messageId, 
        userMessageId: userInfo.messageId,
        from: email 
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send contact email', { email, error: error.message });
      return false;
    }
  }
}

// Singleton
const emailService = new EmailService();

module.exports = emailService;

