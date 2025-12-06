const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'RAPPORT-VERIFICATION-ENV.txt');
const report = [];

function addLine(line) {
  report.push(line);
  console.log(line);
}

addLine('========================================');
addLine('VERIFICATION AUTOMATIQUE DU FICHIER .env');
addLine('========================================');
addLine('');
addLine('Date: ' + new Date().toLocaleString('fr-FR'));
addLine('');

const envPath = path.join(__dirname, '.env');

// Vérifier si le fichier existe
if (!fs.existsSync(envPath)) {
  addLine('❌ ERREUR: Le fichier .env N\'EXISTE PAS!');
  addLine(`   Chemin attendu: ${envPath}`);
  addLine('');
  addLine('📝 CREATION DU FICHIER .env...');
  addLine('');
  
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
    addLine('✅ Fichier .env créé avec succès!');
    addLine('');
    addLine('⚠️  ⚠️  ⚠️  ACTION REQUISE ⚠️  ⚠️  ⚠️');
    addLine('Modifiez les valeurs suivantes dans le fichier .env:');
    addLine('  1. DB_PASSWORD: remplacez par votre mot de passe PostgreSQL');
    addLine('  2. JWT_SECRET: remplacez par une clé secrète longue et sécurisée (minimum 32 caractères)');
    addLine('');
  } catch (err) {
    addLine(`❌ Erreur lors de la création: ${err.message}`);
    fs.writeFileSync(reportPath, report.join('\r\n'), 'utf8');
    process.exit(1);
  }
} else {
  addLine('✅ Fichier .env trouvé');
  addLine('');
}

// Charger les variables
require('dotenv').config();

addLine('Vérification des variables requises:');
addLine('');

const requiredVars = {
  'DB_HOST': { required: true, default: 'localhost' },
  'DB_PORT': { required: true, default: '5432' },
  'DB_NAME': { required: true, default: 'qrmenu' },
  'DB_USER': { required: true, default: 'postgres' },
  'DB_PASSWORD': { required: true, sensitive: true },
  'JWT_SECRET': { required: true, sensitive: true, minLength: 32 },
  'PORT': { required: true, default: '8000' },
  'NODE_ENV': { required: true, default: 'development' }
};

let hasErrors = false;
const missing = [];
const empty = [];
const defaults = [];

for (const [varName, config] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  
  if (value === undefined) {
    addLine(`❌ ${varName}: MANQUANT`);
    missing.push(varName);
    hasErrors = true;
    if (config.default) {
      addLine(`   → Valeur suggérée: ${config.default}`);
    }
  } else if (value === '' || value.trim() === '') {
    addLine(`⚠️  ${varName}: VIDE`);
    empty.push(varName);
    hasErrors = true;
  } else if (config.sensitive) {
    if (value.includes('votre_') || value.includes('changez_moi') || 
        (config.minLength && value.length < config.minLength)) {
      addLine(`⚠️  ${varName}: VALEUR PAR DÉFAUT ou TROP COURTE`);
      addLine(`   Longueur actuelle: ${value.length} caractères`);
      if (config.minLength) {
        addLine(`   Minimum requis: ${config.minLength} caractères`);
      }
      defaults.push(varName);
      hasErrors = true;
    } else {
      addLine(`✅ ${varName}: Défini (${value.length} caractères)`);
    }
  } else {
    addLine(`✅ ${varName}: ${value}`);
  }
}

addLine('');
addLine('=== RÉSUMÉ ===');
addLine('');

if (hasErrors) {
  addLine('❌ DES PROBLÈMES ONT ÉTÉ DÉTECTÉS');
  addLine('');
  
  if (missing.length > 0) {
    addLine('Variables MANQUANTES:');
    missing.forEach(v => addLine(`  - ${v}`));
    addLine('');
  }
  
  if (empty.length > 0) {
    addLine('Variables VIDES:');
    empty.forEach(v => addLine(`  - ${v}`));
    addLine('');
  }
  
  if (defaults.length > 0) {
    addLine('Variables avec VALEURS PAR DÉFAUT (à modifier):');
    defaults.forEach(v => addLine(`  - ${v}`));
    addLine('');
  }
  
  addLine('📝 ACTIONS À EFFECTUER:');
  addLine('  1. Ouvrez le fichier .env dans qrmenu_backend/');
  addLine('  2. Modifiez les variables problématiques listées ci-dessus');
  addLine('  3. Pour DB_PASSWORD: utilisez votre mot de passe PostgreSQL');
  addLine('  4. Pour JWT_SECRET: générez une clé longue et sécurisée (minimum 32 caractères)');
  addLine('  5. Relancez: node verification-env-complete.js');
  addLine('');
  
  fs.writeFileSync(reportPath, report.join('\r\n'), 'utf8');
  addLine(`📄 Rapport sauvegardé: ${reportPath}`);
  process.exit(1);
} else {
  addLine('✅ TOUTES LES VARIABLES SONT CORRECTEMENT CONFIGURÉES');
  addLine('');
  addLine('Test de connexion à PostgreSQL...');
  addLine('');
  
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
      addLine('✅ Connexion à PostgreSQL RÉUSSIE!');
      addLine(`   Heure serveur: ${result.rows[0].now}`);
      const version = result.rows[0].version.split(' ');
      addLine(`   Version: ${version[0]} ${version[1]}`);
      addLine('');
      addLine('✅ CONFIGURATION COMPLÈTE ET FONCTIONNELLE!');
      addLine('   Vous pouvez démarrer le serveur avec: npm start');
      addLine('');
      pool.end();
      
      fs.writeFileSync(reportPath, report.join('\r\n'), 'utf8');
      addLine(`📄 Rapport sauvegardé: ${reportPath}`);
      process.exit(0);
    })
    .catch(err => {
      addLine('❌ ERREUR DE CONNEXION À POSTGRESQL');
      addLine(`   Message: ${err.message}`);
      addLine(`   Code: ${err.code || 'N/A'}`);
      addLine('');
      addLine('Vérifiez:');
      addLine('  1. PostgreSQL est démarré');
      addLine('  2. Les credentials dans .env sont corrects');
      addLine('  3. La base de données existe: psql -U postgres -d qrmenu');
      addLine('  4. Le port PostgreSQL est correct (par défaut: 5432)');
      addLine('');
      pool.end();
      
      fs.writeFileSync(reportPath, report.join('\r\n'), 'utf8');
      addLine(`📄 Rapport sauvegardé: ${reportPath}`);
      process.exit(1);
    });
}


