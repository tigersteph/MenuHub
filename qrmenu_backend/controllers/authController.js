const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const crypto = require('crypto');
const { ValidationError, NotFoundError, UnauthorizedError, ConflictError } = require('../utils/errors');
const { success, error, handleControllerError } = require('../utils/response');
const logger = require('../utils/logger');

const authController = {
  // Inscription
  register: async (req, res) => {
    try {
      logger.request(req, 'User registration attempt');
      const { username, email, password, firstName, lastName, restaurantName, confirmPassword } = req.body;

      // Vérification du mot de passe
      if (password !== confirmPassword) {
        throw new ValidationError('Les mots de passe ne correspondent pas');
      }

      // Vérifier si l'utilisateur existe
      const userExists = await db.query(
        'SELECT * FROM users WHERE email = $1', 
        [email]
      );

      if (userExists.rows.length > 0) {
        throw new ConflictError('Cet email est déjà utilisé');
      }

      // Validation du mot de passe
      if (password.length < 8) {
        throw new ValidationError('Le mot de passe doit contenir au moins 8 caractères');
      }

      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Créer l'utilisateur (adapté à la structure de la table)
      const newUser = await db.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, restaurant_name)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username, email, first_name, last_name, restaurant_name, created_at`,
        [username, email, hashedPassword, firstName || '', lastName || '', restaurantName || '']
      );

      // Générer le token JWT (durée de session : 1h au lieu de 7d)
      const token = jwt.sign(
        { 
          id: newUser.rows[0].id, 
          email: newUser.rows[0].email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      logger.info('User registered successfully', { userId: newUser.rows[0].id, email });
      
      // Envoyer un email de bienvenue (non bloquant)
      const emailService = require('../services/email');
      const userName = newUser.rows[0].first_name || newUser.rows[0].username || 'Utilisateur';
      emailService.sendWelcomeEmail(email, userName).catch(err => {
        logger.warn('Failed to send welcome email', { email, error: err.message });
      });
      
      return success(res, {
        user: {
          id: newUser.rows[0].id,
          username: newUser.rows[0].username,
          email: newUser.rows[0].email,
          first_name: newUser.rows[0].first_name,
          last_name: newUser.rows[0].last_name,
          restaurant_name: newUser.rows[0].restaurant_name
        },
        token
      }, 'Inscription réussie', 201);
    } catch (err) {
      logger.errorRequest(req, err, 'Registration failed');
      return handleControllerError(res, err, 'Erreur lors de l\'inscription');
    }
  },

  // Connexion
  login: async (req, res) => {
    try {
      logger.request(req, 'User login attempt');
      const { email, password } = req.body;

      // Vérifier l'utilisateur
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new UnauthorizedError('Email ou mot de passe incorrect');
      }

      const user = result.rows[0];

      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        throw new UnauthorizedError('Email ou mot de passe incorrect');
      }

      // Générer le token JWT (durée de session : 1h au lieu de 7d)
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      logger.info('User logged in successfully', { userId: user.id, email });
      return success(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      }, 'Connexion réussie');
    } catch (err) {
      logger.errorRequest(req, err, 'Login failed');
      return handleControllerError(res, err, 'Erreur lors de la connexion');
    }
  },

  // Mot de passe oublié
  forgotPassword: async (req, res) => {
    try {
      logger.request(req, 'Password reset request');
      const { email } = req.body;

      // Vérifier si l'utilisateur existe
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        // Pour la sécurité, ne pas révéler si l'email existe ou non
        return res.json({ 
          message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.' 
        });
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

      // Sauvegarder le token dans la base de données
      // Note: Vous devrez peut-être ajouter ces colonnes à la table users
      // ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
      // ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP;
      
      await db.query(
        `UPDATE users 
         SET reset_token = $1, reset_token_expiry = $2 
         WHERE email = $3`,
        [resetToken, resetTokenExpiry, email]
      );

      // Générer le lien de réinitialisation
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      // Envoyer l'email avec le lien de réinitialisation
      const emailService = require('../services/email');
      const userData = result.rows[0];
      const userName = userData.first_name || userData.username || 'Utilisateur';
      const emailSent = await emailService.sendPasswordResetEmail(email, resetLink, userName);
      
      // Pour le développement, on log le lien complet si l'email n'a pas pu être envoyé
      if (process.env.NODE_ENV === 'development' && !emailSent) {
        logger.info('Password reset link generated (email not sent)', { email, resetLink });
      }

      return success(res, {
        resetLink: process.env.NODE_ENV === 'development' && !emailSent ? resetLink : undefined
      }, 'Si cet email existe, un lien de réinitialisation vous a été envoyé.');
    } catch (err) {
      logger.errorRequest(req, err, 'Password reset request failed');
      return handleControllerError(res, err, 'Erreur lors de la demande de réinitialisation');
    }
  },

  // Réinitialiser le mot de passe
  resetPassword: async (req, res) => {
    try {
      logger.request(req, 'Password reset attempt');
      const { token, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        throw new ValidationError('Les mots de passe ne correspondent pas');
      }

      if (password.length < 8) {
        throw new ValidationError('Le mot de passe doit contenir au moins 8 caractères');
      }

      // Vérifier le token
      const result = await db.query(
        `SELECT * FROM users 
         WHERE reset_token = $1 
         AND reset_token_expiry > NOW()`,
        [token]
      );

      if (result.rows.length === 0) {
        throw new ValidationError('Token invalide ou expiré');
      }

      const user = result.rows[0];

      // Hacher le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Mettre à jour le mot de passe et supprimer le token
      await db.query(
        `UPDATE users 
         SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL 
         WHERE id = $2`,
        [hashedPassword, user.id]
      );

      logger.info('Password reset successful', { userId: user.id });
      return success(res, null, 'Mot de passe réinitialisé avec succès');
    } catch (err) {
      logger.errorRequest(req, err, 'Password reset failed');
      return handleControllerError(res, err, 'Erreur lors de la réinitialisation du mot de passe');
    }
  },

  // Profil utilisateur
  getProfile: async (req, res) => {
    try {
      logger.request(req, 'Get user profile');
      
      // Vérifier que req.user et req.user.id existent
      if (!req.user || !req.user.id) {
        logger.warn('User ID missing in request', { user: req.user, hasUser: !!req.user, hasId: !!req.user?.id });
        throw new UnauthorizedError('Token invalide ou utilisateur non authentifié');
      }
      
      const userId = req.user.id;
      
      // Vérifier d'abord si l'utilisateur existe avec une requête simple
      const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
      
      if (userCheck.rows.length === 0) {
        logger.warn('User not found in database', { userId });
        throw new NotFoundError('Utilisateur');
      }
      
      // Requête SQL sécurisée avec gestion des colonnes optionnelles
      // Vérifier d'abord quelles colonnes existent
      const columnsCheck = await db.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'users' 
         AND column_name IN ('first_name', 'last_name', 'restaurant_name', 'role')`
      );
      
      const existingColumns = columnsCheck.rows.map(r => r.column_name);
      const hasFirstName = existingColumns.includes('first_name');
      const hasLastName = existingColumns.includes('last_name');
      const hasRestaurantName = existingColumns.includes('restaurant_name');
      const hasRole = existingColumns.includes('role');
      
      // Construire la requête dynamiquement selon les colonnes disponibles
      let selectFields = 'id, username, email, created_at';
      if (hasFirstName) selectFields += ', COALESCE(first_name, \'\') as first_name';
      if (hasLastName) selectFields += ', COALESCE(last_name, \'\') as last_name';
      if (hasRestaurantName) selectFields += ', COALESCE(restaurant_name, \'\') as restaurant_name';
      if (hasRole) selectFields += ', COALESCE(role, \'user\') as role';
      
      const user = await db.query(
        `SELECT ${selectFields} FROM users WHERE id = $1`,
        [userId]
      );
      
      // Ajouter les valeurs par défaut pour les colonnes manquantes
      if (user.rows.length > 0) {
        if (!hasFirstName) user.rows[0].first_name = '';
        if (!hasLastName) user.rows[0].last_name = '';
        if (!hasRestaurantName) user.rows[0].restaurant_name = '';
        if (!hasRole) user.rows[0].role = 'user';
      }

      if (user.rows.length === 0) {
        logger.warn('User not found after query', { userId });
        throw new NotFoundError('Utilisateur');
      }

      logger.info('Profile retrieved successfully', { userId });
      return success(res, user.rows[0]);
    } catch (err) {
      logger.errorRequest(req, err, 'Get profile failed', { 
        error: err.message, 
        stack: err.stack,
        userId: req.user?.id,
        hasUser: !!req.user
      });
      return handleControllerError(res, err, 'Erreur lors de la récupération du profil');
    }
  },

  // Mettre à jour le profil utilisateur
  updateProfile: async (req, res) => {
    try {
      logger.request(req, 'Update user profile');
      const { username, email, firstName, lastName, restaurantName } = req.body;
      
      // Validation basique
      if (!username || !email) {
        throw new ValidationError('Le nom d\'utilisateur et l\'email sont requis');
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const emailCheck = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      
      if (emailCheck.rows.length > 0) {
        throw new ConflictError('Cet email est déjà utilisé');
      }

      // Vérifier si le username est déjà utilisé par un autre utilisateur
      const usernameCheck = await db.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, req.user.id]
      );
      
      if (usernameCheck.rows.length > 0) {
        throw new ConflictError('Ce nom d\'utilisateur est déjà utilisé');
      }
      
      const updatedUser = await db.query(
        `UPDATE users 
         SET username = $1, email = $2, first_name = $3, last_name = $4, restaurant_name = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING id, username, email, first_name, last_name, restaurant_name, role, created_at`,
        [username, email, firstName || '', lastName || '', restaurantName || '', req.user.id]
      );
      
      if (updatedUser.rows.length === 0) {
        throw new NotFoundError('Utilisateur');
      }
      
      logger.info('Profile updated successfully', { userId: req.user.id });
      return success(res, updatedUser.rows[0], 'Profil mis à jour avec succès');
    } catch (err) {
      logger.errorRequest(req, err, 'Update profile failed');
      return handleControllerError(res, err, 'Erreur lors de la mise à jour du profil');
    }
  }
};

module.exports = authController;
