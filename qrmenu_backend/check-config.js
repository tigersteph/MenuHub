const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'config-check-report.txt');
const report = [];

function log(message) {
  console.log(message);
  report.push(message);
}

log('=== Vérification automatique du fichier .env ===\n');

const envPath = path.join(__dirname, '.env');
const requiredVars = {
  'DB_HOST': 'localhost',
  'DB_PORT': '5432',
  'DB_NAME': 'qrmenu',
  'DB_USER': 'postgres',
  'DB_PASSWORD': null,
  'JWT_SECRET': null,
  'PORT': '8000',
  'NODE_ENV': 'development'
};

let hasErrors = false;
const missingVars = [];
const emptyVars = [];
const issues = [];

// Vérifier si le fichier existe
if (!fs.existsSync(envPath)) {
  log('❌ ERREUR: Le fichier .env n\'existe pas!');
  log(`   Chemin attendu: ${envPath}\n`);
  log('📝 Création du fichier .env avec les variables minimales...\n');
  
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
    log('✅ Fichier .env créé avec succès!');
    log('⚠️  IMPORTANT: Modifiez les valeurs suivantes:');
    log('   - DB_PASSWORD: votre mot de passe PostgreSQL');
    log('   - JWT_SECRET: une clé secrète longue et sécurisée\n');
    hasErrors = true;
  } catch (err) {
    log(`❌ Erreur lors de la création du fichier .env: ${err.message}`);
    fs.writeFileSync(reportPath, report.join('\n'), 'utf8');
    process.exit(1);
  }
} else {
  log('✅ Fichier .env trouvé\n');
}

// Charger et analyser le fichier .env
require('dotenv').config();

log('Vérification des variables d\'environnement requises:\n');

for (const [varName, defaultValue] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  
  if (value === undefined) {
    log(`❌ ${varName}: MANQUANT`);
    missingVars.push(varName);
    hasErrors = true;
    if (defaultValue) {
      log(`   → Valeur par défaut suggérée: ${defaultValue}`);
    }
  } else if (value === '' || value.trim() === '') {
    log(`⚠️  ${varName}: VIDE`);
    emptyVars.push(varName);
    hasErrors = true;
  } else if (varName === 'DB_PASSWORD' || varName === 'JWT_SECRET') {
    if (value.includes('votre_') || value.includes('changez_moi') || value.length < 10) {
      log(`⚠️  ${varName}: VALEUR PAR DÉFAUT ou TROP COURTE`);
      log(`   → Veuillez définir une valeur sécurisée`);
      issues.push(`${varName} utilise une valeur par défaut ou est trop courte`);
      hasErrors = true;
    } else {
      log(`✅ ${varName}: Défini (${value.length} caractères)`);
    }
  } else {
    log(`✅ ${varName}: ${value}`);
  }
}

// Vérifications supplémentaires
log('\n--- Vérifications supplémentaires ---\n');

if (process.env.PORT) {
  const port = parseInt(process.env.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    log(`⚠️  PORT: Valeur invalide (${process.env.PORT})`);
    issues.push(`PORT a une valeur invalide: ${process.env.PORT}`);
    hasErrors = true;
  }
}

if (process.env.DB_PORT) {
  const dbPort = parseInt(process.env.DB_PORT);
  if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
    log(`⚠️  DB_PORT: Valeur invalide (${process.env.DB_PORT})`);
    issues.push(`DB_PORT a une valeur invalide: ${process.env.DB_PORT}`);
    hasErrors = true;
  }
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  log(`⚠️  JWT_SECRET: Trop court (${process.env.JWT_SECRET.length} caractères, minimum 32 recommandé)`);
  issues.push(`JWT_SECRET est trop court (${process.env.JWT_SECRET.length} caractères)`);
  hasErrors = true;
}

// Résumé
log('\n=== Résumé ===\n');

if (hasErrors) {
  log('❌ Des problèmes ont été détectés dans la configuration.\n');
  
  if (missingVars.length > 0) {
    log('Variables manquantes:');
    missingVars.forEach(v => log(`  - ${v}`));
    log('');
  }
  
  if (emptyVars.length > 0) {
    log('Variables vides:');
    emptyVars.forEach(v => log(`  - ${v}`));
    log('');
  }
  
  if (issues.length > 0) {
    log('Autres problèmes:');
    issues.forEach(i => log(`  - ${i}`));
    log('');
  }
  
  log('📝 Actions à effectuer:');
  log('  1. Ouvrez le fichier .env dans qrmenu_backend/');
  log('  2. Ajoutez ou modifiez les variables manquantes');
  log('  3. Assurez-vous que DB_PASSWORD correspond à votre mot de passe PostgreSQL');
  log('  4. Assurez-vous que JWT_SECRET est une clé longue et sécurisée (minimum 32 caractères)');
  log('  5. Relancez ce script pour vérifier: node check-config.js\n');
  
  fs.writeFileSync(reportPath, report.join('\n'), 'utf8');
  log(`\n📄 Rapport sauvegardé dans: ${reportPath}`);
  process.exit(1);
} else {
  log('✅ Toutes les variables requises sont correctement configurées!\n');
  
  // Test de connexion à la base de données
  log('Test de connexion à la base de données...\n');
  
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
      log('✅ Connexion à PostgreSQL réussie!');
      log(`   Heure serveur: ${result.rows[0].now}`);
      log(`   Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}\n`);
      pool.end();
      
      log('✅ Configuration complète et fonctionnelle!');
      log('   Vous pouvez maintenant démarrer le serveur avec: npm start\n');
      
      fs.writeFileSync(reportPath, report.join('\n'), 'utf8');
      log(`📄 Rapport sauvegardé dans: ${reportPath}`);
      process.exit(0);
    })
    .catch(err => {
      log('❌ Erreur de connexion à PostgreSQL:');
      log(`   Message: ${err.message}`);
      log(`   Code: ${err.code || 'N/A'}\n`);
      log('Vérifiez:');
      log('  1. PostgreSQL est démarré');
      log('  2. Les credentials dans .env sont corrects');
      log('  3. La base de données existe: psql -U postgres -d qrmenu');
      log('  4. Le port PostgreSQL est correct (par défaut: 5432)\n');
      pool.end();
      
      fs.writeFileSync(reportPath, report.join('\n'), 'utf8');
      log(`📄 Rapport sauvegardé dans: ${reportPath}`);
      process.exit(1);
    });
}


