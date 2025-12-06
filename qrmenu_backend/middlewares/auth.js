const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
  try {
  // Récupérer le token du header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      logger.warn('Authentication failed: No authorization header', { path: req.path });
      return res.status(401).json({ 
        success: false,
        error: { message: 'Accès refusé. Token manquant.' } 
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
  
  if (!token) {
      logger.warn('Authentication failed: Empty token', { path: req.path });
      return res.status(401).json({ 
        success: false,
        error: { message: 'Accès refusé. Token manquant.' } 
      });
  }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que le token contient un ID
    if (!decoded || !decoded.id) {
      logger.warn('Authentication failed: Invalid token payload', { decoded });
      return res.status(401).json({ 
        success: false,
        error: { message: 'Token invalide. Structure incorrecte.' } 
      });
    }

    // Attacher les informations utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user'
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error', { 
      error: error.message, 
      name: error.name,
      path: req.path 
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: { message: 'Token expiré. Veuillez vous reconnecter.' } 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: { message: 'Token invalide.' } 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      error: { message: 'Erreur d\'authentification.' } 
    });
  }
};

module.exports = { authenticate };