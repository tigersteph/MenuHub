const fs = require('fs');
const path = require('path');

console.log('=== Vérification automatique du fichier .env ===\n');

const envPath = path.join(__dirname, '.env');
const requiredVars = {
  'DB_HOST': 'localhost',
  'DB_PORT': '5432',
  'DB_NAME': 'qrmenu',
  'DB_USER': 'postgres',
  'DB_PASSWORD': null, // Doit être défini mais on ne peut pas vérifier la valeur
  'JWT_SECRET': null, // Doit être défini mais on ne peut pas vérifier la valeur
  'PORT': '8000',
  'NODE_ENV': 'development'
};

// Vérifier si le fichier existe
if (!fs.existsSync(envPath)) {
  console.error('❌ ERREUR: Le fichier .env n\'existe pas!');
  console.error(`   Chemin attendu: ${envPath}\n`);
  console.log('📝 Création du fichier .env avec les variables minimales...\n');
  
  // Créer un fichier .env de base
  const defaultEnv = `# Configuration Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qrmenu
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres

# JWT
JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_securisee_changez_moi

# Serveur
PORT=8000
NODE_ENV=development

# Pool de connexions PostgreSQL
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000

# CORS
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Redis (optionnel)
REDIS_ENABLED=false

# Email (optionnel)
EMAIL_ENABLED=false
`;
  
  try {
    fs.writeFileSync(envPath, defaultEnv, 'utf8');
    console.log('✅ Fichier .env créé avec succès!');
    console.log('⚠️  IMPORTANT: Modifiez les valeurs suivantes:');
    console.log('   - DB_PASSWORD: votre mot de passe PostgreSQL');
    console.log('   - JWT_SECRET: une clé secrète longue et sécurisée\n');
  } catch (err) {
    console.error('❌ Erreur lors de la création du fichier .env:', err.message);
    process.exit(1);
  }
} else {
  console.log('✅ Fichier .env trouvé\n');
}

// Charger et analyser le fichier .env
require('dotenv').config();

console.log('Vérification des variables d\'environnement requises:\n');

let hasErrors = false;
const missingVars = [];
const emptyVars = [];

for (const [varName, defaultValue] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  
  if (value === undefined) {
    console.log(`❌ ${varName}: MANQUANT`);
    missingVars.push(varName);
    hasErrors = true;
    if (defaultValue) {
      console.log(`   → Valeur par défaut suggérée: ${defaultValue}`);
    }
  } else if (value === '' || value.trim() === '') {
    console.log(`⚠️  ${varName}: VIDE`);
    emptyVars.push(varName);
    hasErrors = true;
  } else if (varName === 'DB_PASSWORD' || varName === 'JWT_SECRET') {
    // Pour les variables sensibles, on vérifie juste qu'elles ne sont pas les valeurs par défaut
    if (value.includes('votre_') || value.includes('changez_moi') || value.length < 10) {
      console.log(`⚠️  ${varName}: VALEUR PAR DÉFAUT ou TROP COURTE`);
      console.log(`   → Veuillez définir une valeur sécurisée`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}: Défini (${value.length} caractères)`);
    }
  } else {
    console.log(`✅ ${varName}: ${value}`);
  }
}

// Vérifications supplémentaires
console.log('\n--- Vérifications supplémentaires ---\n');

// Vérifier le format du PORT
if (process.env.PORT) {
  const port = parseInt(process.env.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.log(`⚠️  PORT: Valeur invalide (${process.env.PORT})`);
    hasErrors = true;
  }
}

// Vérifier le format du DB_PORT
if (process.env.DB_PORT) {
  const dbPort = parseInt(process.env.DB_PORT);
  if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
    console.log(`⚠️  DB_PORT: Valeur invalide (${process.env.DB_PORT})`);
    hasErrors = true;
  }
}

// Vérifier la longueur du JWT_SECRET
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.log(`⚠️  JWT_SECRET: Trop court (${process.env.JWT_SECRET.length} caractères, minimum 32 recommandé)`);
  hasErrors = true;
}

// Résumé
console.log('\n=== Résumé ===\n');

if (hasErrors) {
  console.log('❌ Des problèmes ont été détectés dans la configuration.\n');
  
  if (missingVars.length > 0) {
    console.log('Variables manquantes:');
    missingVars.forEach(v => console.log(`  - ${v}`));
    console.log('');
  }
  
  if (emptyVars.length > 0) {
    console.log('Variables vides:');
    emptyVars.forEach(v => console.log(`  - ${v}`));
    console.log('');
  }
  
  console.log('📝 Actions à effectuer:');
  console.log('  1. Ouvrez le fichier .env dans qrmenu_backend/');
  console.log('  2. Ajoutez ou modifiez les variables manquantes');
  console.log('  3. Assurez-vous que DB_PASSWORD correspond à votre mot de passe PostgreSQL');
  console.log('  4. Assurez-vous que JWT_SECRET est une clé longue et sécurisée (minimum 32 caractères)');
  console.log('  5. Relancez ce script pour vérifier: node check-env.js\n');
  
  process.exit(1);
} else {
  console.log('✅ Toutes les variables requises sont correctement configurées!\n');
  
  // Test de connexion à la base de données
  console.log('Test de connexion à la base de données...\n');
  
  const { Pool } = require('pg');
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 5000
  });
  
  pool.query('SELECT NOW() as now, version() as version')
    .then(result => {
      console.log('✅ Connexion à PostgreSQL réussie!');
      console.log(`   Heure serveur: ${result.rows[0].now}`);
      console.log(`   Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}\n`);
      pool.end();
      
      console.log('✅ Configuration complète et fonctionnelle!');
      console.log('   Vous pouvez maintenant démarrer le serveur avec: npm start\n');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Erreur de connexion à PostgreSQL:');
      console.error(`   Message: ${err.message}`);
      console.error(`   Code: ${err.code || 'N/A'}\n`);
      console.error('Vérifiez:');
      console.error('  1. PostgreSQL est démarré');
      console.error('  2. Les credentials dans .env sont corrects');
      console.error('  3. La base de données existe: psql -U postgres -d qrmenu');
      console.error('  4. Le port PostgreSQL est correct (par défaut: 5432)\n');
      pool.end();
      process.exit(1);
    });
}


