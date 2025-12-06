/**
 * Tests unitaires pour le contrôleur d'authentification
 * Utilise Jest pour les tests
 */

const authController = require('../controllers/authController');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock des dépendances
jest.mock('../config/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../services/email');
jest.mock('../utils/logger');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 'test-user-id' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        restaurantName: 'Test Restaurant'
      };

      // Mock de la vérification d'utilisateur existant
      db.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock du hashage du mot de passe
      bcrypt.genSalt.mockResolvedValueOnce('salt');
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');

      // Mock de l'insertion de l'utilisateur
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-id',
          username: 'testuser',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          restaurant_name: 'Test Restaurant',
          created_at: new Date()
        }]
      });

      // Mock du token JWT
      jwt.sign.mockReturnValueOnce('test-token');

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'test@example.com'
            }),
            token: 'test-token'
          })
        })
      );
    });

    it('devrait rejeter si les mots de passe ne correspondent pas', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different'
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR'
          })
        })
      );
    });

    it('devrait rejeter si l\'email existe déjà', async () => {
      req.body = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      // Mock de l'utilisateur existant
      db.query.mockResolvedValueOnce({
        rows: [{ id: 'existing-user-id' }]
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'CONFLICT'
          })
        })
      );
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock de la recherche de l'utilisateur
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-id',
          email: 'test@example.com',
          password_hash: 'hashedPassword',
          first_name: 'Test',
          last_name: 'User'
        }]
      });

      // Mock de la vérification du mot de passe
      bcrypt.compare.mockResolvedValueOnce(true);

      // Mock du token JWT
      jwt.sign.mockReturnValueOnce('test-token');

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            token: 'test-token'
          })
        })
      );
    });

    it('devrait rejeter avec des identifiants invalides', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Mock de la recherche de l'utilisateur
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-id',
          email: 'test@example.com',
          password_hash: 'hashedPassword'
        }]
      });

      // Mock de la vérification du mot de passe (échec)
      bcrypt.compare.mockResolvedValueOnce(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'UNAUTHORIZED'
          })
        })
      );
    });
  });
});

