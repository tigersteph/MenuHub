#!/usr/bin/env node
/**
 * Script pour générer un JWT_SECRET sécurisé
 * Usage: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

// Générer un secret de 64 caractères (32 bytes en hex)
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 JWT_SECRET généré:');
console.log('='.repeat(80));
console.log(jwtSecret);
console.log('='.repeat(80));
console.log('\n📋 Copiez cette valeur dans la variable d\'environnement JWT_SECRET de Render');
console.log('⚠️  IMPORTANT: Gardez ce secret en sécurité et ne le partagez jamais!\n');

