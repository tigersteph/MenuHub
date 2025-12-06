/**
 * Script de vérification complète des variables d'environnement
 * Vérifie toutes les variables requises et optionnelles pour le bon fonctionnement de l'application
 */

require('dotenv').config();
const logger = require('./utils/logger');

console.log('\n🔍 VÉRIFICATION COMPLÈTE DES VARIABLES D\'ENVIRONNEMENT\n');
console.log('='.repeat(70));

// Variables REQUISES (l'application ne fonctionnera pas sans elles)
const REQUIRED_VARS = {
  // Base de données PostgreSQL
  'DB_HOST': {
    description: 'Adresse du serveur PostgreSQL',
    default: 'localhost',
    critical: true
  },
  'DB_PORT': {
    description: 'Port PostgreSQL',
    default: '5432',
    critical: true
  },
  'DB_NAME': {
    description: 'Nom de la base de données',
    default: 'qrmenu',
    critical: true
  },
  'DB_USER': {
    description: 'Utilisateur PostgreSQL',
    default: 'postgres',
    critical: true
  },
  'DB_PASSWORD': {
    description: 'Mot de passe PostgreSQL',
    default: null,
    critical: true,
    hideValue: true
  },
  // JWT
  'JWT_SECRET': {
    description: 'Clé secrète pour signer les tokens JWT',
    default: null,
    critical: true,
    hideValue: true,
    minLength: 32
  },
  'JWT_EXPIRES_IN': {
    description: 'Durée de validité des tokens JWT',
    default: '1h',
    critical: false
  }
};

// Variables OPTIONNELLES mais recommandées
const OPTIONAL_VARS = {
  // Serveur
  'PORT': {
    description: 'Port du serveur Express',
    default: '8000',
    recommended: true
  },
  'NODE_ENV': {
    description: 'Environnement d\'exécution',
    default: 'development',
    recommended: true,
    validValues: ['development', 'production', 'test']
  },
  // Pool de connexions
  'DB_POOL_MAX': {
    description: 'Nombre maximum de connexions dans le pool',
    default: '20',
    recommended: true
  },
  'DB_POOL_MIN': {
    description: 'Nombre minimum de connexions dans le pool',
    default: '2',
    recommended: true
  },
  'DB_POOL_IDLE_TIMEOUT': {
    description: 'Timeout d\'inactivité pour les connexions (ms)',
    default: '30000',
    recommended: false
  },
  'DB_POOL_CONNECTION_TIMEOUT': {
    description: 'Timeout de connexion (ms)',
    default: '2000',
    recommended: false
  },
  // Rate Limiting
  'ORDER_RATE_LIMIT_MAX': {
    description: 'Limite de requêtes pour les commandes (par minute)',
    default: '100',
    recommended: true
  },
  'AUTH_RATE_LIMIT_MAX': {
    description: 'Limite de requêtes pour l\'authentification (par 15 min)',
    default: '5',
    recommended: true
  },
  'GENERAL_RATE_LIMIT_MAX': {
    description: 'Limite générale de requêtes (par minute)',
    default: '100',
    recommended: true
  },
  // CORS
  'CORS_ORIGIN': {
    description: 'Origine autorisée pour CORS',
    default: 'http://localhost:3000',
    recommended: true
  },
  'FRONTEND_URL': {
    description: 'URL du frontend',
    default: 'http://localhost:3000',
    recommended: true
  },
  // Cloudinary (pour l\'upload d\'images)
  'CLOUDINARY_CLOUD_NAME': {
    description: 'Nom du cloud Cloudinary',
    default: null,
    recommended: true
  },
  'CLOUDINARY_API_KEY': {
    description: 'Clé API Cloudinary',
    default: null,
    recommended: true,
    hideValue: true
  },
  'CLOUDINARY_API_SECRET': {
    description: 'Secret API Cloudinary',
    default: null,
    recommended: true,
    hideValue: true
  },
  // Email (optionnel)
  'EMAIL_ENABLED': {
    description: 'Activer le service d\'email',
    default: 'false',
    recommended: false,
    validValues: ['true', 'false']
  },
  'SMTP_HOST': {
    description: 'Serveur SMTP',
    default: null,
    recommended: false,
    dependsOn: 'EMAIL_ENABLED=true'
  },
  'SMTP_PORT': {
    description: 'Port SMTP',
    default: '587',
    recommended: false,
    dependsOn: 'EMAIL_ENABLED=true'
  },
  'SMTP_USER': {
    description: 'Utilisateur SMTP',
    default: null,
    recommended: false,
    dependsOn: 'EMAIL_ENABLED=true'
  },
  'SMTP_PASS': {
    description: 'Mot de passe SMTP',
    default: null,
    recommended: false,
    hideValue: true,
    dependsOn: 'EMAIL_ENABLED=true'
  },
  'SMTP_FROM': {
    description: 'Adresse email expéditrice',
    default: null,
    recommended: false,
    dependsOn: 'EMAIL_ENABLED=true'
  },
  // Redis (optionnel)
  'REDIS_ENABLED': {
    description: 'Activer le cache Redis',
    default: 'false',
    recommended: false,
    validValues: ['true', 'false']
  },
  'REDIS_URL': {
    description: 'URL de connexion Redis',
    default: 'redis://localhost:6379',
    recommended: false,
    dependsOn: 'REDIS_ENABLED=true'
  },
  // Swagger
  'ENABLE_SWAGGER': {
    description: 'Activer la documentation Swagger en production',
    default: 'false',
    recommended: false
  },
  'API_URL': {
    description: 'URL de l\'API pour Swagger',
    default: 'http://localhost:8000',
    recommended: false
  }
};

let hasErrors = false;
let hasWarnings = false;
const issues = [];

// Vérifier les variables requises
console.log('\n📋 VARIABLES REQUISES:\n');
for (const [varName, config] of Object.entries(REQUIRED_VARS)) {
  const value = process.env[varName];
  const isSet = value !== undefined && value !== null && value !== '';
  
  if (!isSet) {
    hasErrors = true;
    console.log(`  ❌ ${varName}: NON DÉFINI`);
    console.log(`     Description: ${config.description}`);
    if (config.default) {
      console.log(`     Valeur par défaut recommandée: ${config.default}`);
    }
    issues.push(`Variable requise manquante: ${varName}`);
  } else {
    // Vérifications supplémentaires
    let isValid = true;
    
    if (config.minLength && value.length < config.minLength) {
      isValid = false;
      hasErrors = true;
      console.log(`  ⚠️  ${varName}: TROP COURT (${value.length} caractères, minimum ${config.minLength})`);
      issues.push(`${varName} est trop court (${value.length} caractères, minimum ${config.minLength})`);
    }
    
    if (isValid) {
      const displayValue = config.hideValue ? '***' : value;
      console.log(`  ✅ ${varName}: ${displayValue}`);
    }
  }
}

// Vérifier les variables optionnelles
console.log('\n📋 VARIABLES OPTIONNELLES:\n');
for (const [varName, config] of Object.entries(OPTIONAL_VARS)) {
  const value = process.env[varName];
  const isSet = value !== undefined && value !== null && value !== '';
  
  if (!isSet) {
    if (config.recommended) {
      hasWarnings = true;
      console.log(`  ⚠️  ${varName}: NON DÉFINI (recommandé)`);
      console.log(`     Description: ${config.description}`);
      if (config.default) {
        console.log(`     Valeur par défaut: ${config.default}`);
      }
      issues.push(`Variable recommandée manquante: ${varName}`);
    } else {
      console.log(`  ⚪ ${varName}: NON DÉFINI (optionnel)`);
    }
  } else {
    // Vérifications de validité
    let isValid = true;
    
    if (config.validValues && !config.validValues.includes(value)) {
      isValid = false;
      hasWarnings = true;
      console.log(`  ⚠️  ${varName}: VALEUR INVALIDE (${value})`);
      console.log(`     Valeurs valides: ${config.validValues.join(', ')}`);
      issues.push(`${varName} a une valeur invalide: ${value}`);
    }
    
    if (config.dependsOn) {
      const [depVar, depValue] = config.dependsOn.split('=');
      if (process.env[depVar] !== depValue) {
        isValid = false;
        console.log(`  ⚠️  ${varName}: DÉFINI MAIS ${depVar} n'est pas activé`);
        issues.push(`${varName} est défini mais ${depVar} n'est pas activé`);
      }
    }
    
    if (isValid) {
      const displayValue = config.hideValue ? '***' : value;
      const status = config.recommended ? '✅' : '⚪';
      console.log(`  ${status} ${varName}: ${displayValue}`);
    }
  }
}

// Vérifications spéciales
console.log('\n🔍 VÉRIFICATIONS SPÉCIALES:\n');

// Vérifier la connexion à la base de données
const db = require('./config/db');
db.query('SELECT NOW()')
  .then(() => {
    console.log('  ✅ Connexion à la base de données: OK');
  })
  .catch((err) => {
    hasErrors = true;
    console.log('  ❌ Connexion à la base de données: ÉCHEC');
    console.log(`     Erreur: ${err.message}`);
    issues.push(`Erreur de connexion à la base de données: ${err.message}`);
  })
  .finally(() => {
    // Résumé final
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 RÉSUMÉ:\n');
    
    if (hasErrors) {
      console.log('  ❌ ERREURS CRITIQUES DÉTECTÉES');
      console.log('     L\'application ne pourra pas démarrer correctement.\n');
      console.log('  Problèmes identifiés:');
      issues.forEach(issue => console.log(`    - ${issue}`));
      process.exit(1);
    } else if (hasWarnings) {
      console.log('  ⚠️  AVERTISSEMENTS DÉTECTÉS');
      console.log('     L\'application peut fonctionner mais certaines fonctionnalités peuvent être limitées.\n');
      console.log('  Recommandations:');
      issues.forEach(issue => console.log(`    - ${issue}`));
      process.exit(0);
    } else {
      console.log('  ✅ TOUTES LES VÉRIFICATIONS SONT PASSÉES');
      console.log('     L\'application est correctement configurée.\n');
      process.exit(0);
    }
  });

