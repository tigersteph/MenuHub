const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authController = {
  // Inscription
  register: async (req, res) => {
    try {
      // Log pédagogique du body reçu
      console.log('--- [DEBUG REGISTER] Body reçu:', req.body);
      const { username, email, password, firstName, lastName, restaurantName, confirmPassword } = req.body;

      // Vérification du mot de passe
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
      }

      // Vérifier si l'utilisateur existe
      const userExists = await db.query(
        'SELECT * FROM users WHERE email = $1', 
        [email]
      );

      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Créer l'utilisateur (adapté à la structure de la table)
      const newUser = await db.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, created_at`,
        [username, email, hashedPassword]
      );

      // Générer le token JWT
      const token = jwt.sign(
        { 
          id: newUser.rows[0].id, 
          email: newUser.rows[0].email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        user: {
          id: newUser.rows[0].id,
          username: newUser.rows[0].username,
          email: newUser.rows[0].email
        },
        token
      });
    } catch (error) {
      console.error('--- [DEBUG REGISTER] Erreur inscription:', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
    }
  },

  // Connexion
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Vérifier l'utilisateur
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      const user = result.rows[0];

      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Erreur connexion:', error);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  },

  // Profil utilisateur
  getProfile: async (req, res) => {
    try {
      // L'utilisateur est déjà vérifié par le middleware d'authentification
      const user = await db.query(
        'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
        [req.user.id]
      );

      if (user.rows.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json(user.rows[0]);
    } catch (error) {
      console.error('Erreur profil:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = authController;