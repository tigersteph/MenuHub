const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
// Les autres routes seront importées ici
// const menuRoutes = require('./routes/menu');
// const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 8000;
const placeRoutes = require('./routes/places');
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const categoryRoutes = require('./routes/categories');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/menu', menuItemRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', orderRoutes);
app.use('/api/tables', tableRoutes);
// Les autres routes seront ajoutées ici
// app.use('/api/menu', menuRoutes);
// app.use('/api/orders', orderRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('Rejet non géré:', err);
  server.close(() => process.exit(1));
});

module.exports = app;