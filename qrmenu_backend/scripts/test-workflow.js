#!/usr/bin/env node

/**
 * Script de test automatisé pour vérifier le workflow de base
 * Usage: node scripts/test-workflow.js
 */

const http = require('http');

const API_BASE = process.env.API_BASE || 'http://localhost:8000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function test(name, testFn) {
  testResults.total++;
  try {
    log(`\n🧪 Test: ${name}`, 'blue');
    await testFn();
    testResults.passed++;
    log(`✅ ${name} - PASSED`, 'green');
  } catch (error) {
    testResults.failed++;
    log(`❌ ${name} - FAILED: ${error.message}`, 'red');
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

async function runTests() {
  log('\n🚀 Démarrage des tests du workflow MenuHub\n', 'blue');

  let authToken = null;
  let placeId = null;
  let tableId = null;

  // Test 1: Health Check
  await test('Health Check', async () => {
    const response = await makeRequest('GET', '/api/health');
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    if (response.data.status !== 'OK') {
      throw new Error(`Expected status OK, got ${response.data.status}`);
    }
  });

  // Test 2: Inscription
  await test('Inscription utilisateur', async () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const response = await makeRequest('POST', '/api/auth/register', {
      username: 'testuser',
      email: testEmail,
      password: 'Test1234!',
      firstName: 'Test',
      lastName: 'User',
      restaurantName: 'Test Restaurant'
    });

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Expected 201/200, got ${response.status}: ${JSON.stringify(response.data)}`);
    }

    if (response.data.token) {
      authToken = response.data.token;
    } else if (response.data.user) {
      // Si le token n'est pas dans la réponse, essayer de se connecter
      const loginResponse = await makeRequest('POST', '/api/auth/login', {
        email: testEmail,
        password: 'Test1234!'
      });
      if (loginResponse.data.token) {
        authToken = loginResponse.data.token;
      }
    }

    if (!authToken) {
      throw new Error('Token non reçu après inscription');
    }
  });

  // Test 3: Connexion (si inscription n'a pas donné de token)
  if (!authToken) {
    await test('Connexion utilisateur', async () => {
      const response = await makeRequest('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'Test1234!'
      });

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      if (!response.data.token) {
        throw new Error('Token non reçu');
      }

      authToken = response.data.token;
    });
  }

  // Test 4: Création établissement
  await test('Création établissement', async () => {
    if (!authToken) {
      throw new Error('Token manquant');
    }

    const response = await makeRequest('POST', '/api/places', {
      name: 'Restaurant Test',
      address: '123 Rue Test',
      description: 'Un restaurant de test'
    }, authToken);

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Expected 201/200, got ${response.status}: ${JSON.stringify(response.data)}`);
    }

    if (response.data.id) {
      placeId = response.data.id;
    } else if (response.data.place && response.data.place.id) {
      placeId = response.data.place.id;
    } else {
      throw new Error('ID d\'établissement non reçu');
    }
  });

  // Test 5: Création table
  await test('Création table', async () => {
    if (!authToken || !placeId) {
      throw new Error('Token ou placeId manquant');
    }

    const response = await makeRequest('POST', '/api/tables', {
      name: 'Table 1',
      place_id: placeId
    }, authToken);

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Expected 201/200, got ${response.status}: ${JSON.stringify(response.data)}`);
    }

    if (response.data.id) {
      tableId = response.data.id;
    } else if (response.data.table && response.data.table.id) {
      tableId = response.data.table.id;
    } else {
      throw new Error('ID de table non reçu');
    }
  });

  // Test 6: Vérification que table_id est utilisé (pas table_number)
  await test('Vérification structure table_id', async () => {
    if (!tableId) {
      throw new Error('tableId manquant');
    }

    // On ne peut pas vérifier directement la structure de la base depuis ici
    // Mais on peut vérifier que la table a bien un ID UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tableId)) {
      throw new Error(`tableId n'est pas un UUID valide: ${tableId}`);
    }
  });

  // Test 7: Récupération commandes (doit être vide)
  await test('Récupération commandes (vide)', async () => {
    if (!authToken || !placeId) {
      throw new Error('Token ou placeId manquant');
    }

    const response = await makeRequest('GET', `/api/places/${placeId}/orders`, null, authToken);

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    if (!Array.isArray(response.data)) {
      throw new Error('Réponse n\'est pas un tableau');
    }
  });

  // Résumé
  log('\n' + '='.repeat(50), 'blue');
  log(`\n📊 Résumé des tests:`, 'blue');
  log(`   Total: ${testResults.total}`, 'blue');
  log(`   ✅ Réussis: ${testResults.passed}`, 'green');
  log(`   ❌ Échoués: ${testResults.failed}`, 'red');
  log('\n' + '='.repeat(50) + '\n', 'blue');

  if (testResults.failed > 0) {
    process.exit(1);
  } else {
    log('🎉 Tous les tests sont passés !', 'green');
    process.exit(0);
  }
}

// Exécuter les tests
runTests().catch((error) => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

