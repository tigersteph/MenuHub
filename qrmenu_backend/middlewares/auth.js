const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Récupérer le token du header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Token reçu (middleware auth):', token);
  
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur vérification token:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = { authenticate };