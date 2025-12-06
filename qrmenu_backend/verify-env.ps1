# Script de vérification du fichier .env
$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Vérification automatique du fichier .env" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env"

# Vérifier si le fichier existe
if (-not (Test-Path $envPath)) {
    Write-Host "[ERREUR] Le fichier .env n'existe pas!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Création du fichier .env avec les variables minimales..." -ForegroundColor Yellow
    Write-Host ""
    
    $envContent = @"
# Configuration Base de données
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
"@
    
    try {
        $envContent | Out-File -FilePath $envPath -Encoding UTF8
        Write-Host "[OK] Fichier .env créé!" -ForegroundColor Green
        Write-Host ""
        Write-Host "[IMPORTANT] Modifiez les valeurs suivantes dans .env:" -ForegroundColor Yellow
        Write-Host "  - DB_PASSWORD: votre mot de passe PostgreSQL" -ForegroundColor Yellow
        Write-Host "  - JWT_SECRET: une clé secrète longue et sécurisée (minimum 32 caractères)" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    } catch {
        Write-Host "[ERREUR] Impossible de créer le fichier .env: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[OK] Fichier .env trouvé" -ForegroundColor Green
Write-Host ""

# Charger les variables d'environnement
$envContent = Get-Content $envPath -Raw

# Variables requises
$requiredVars = @{
    'DB_HOST' = 'localhost'
    'DB_PORT' = '5432'
    'DB_NAME' = 'qrmenu'
    'DB_USER' = 'postgres'
    'DB_PASSWORD' = $null
    'JWT_SECRET' = $null
    'PORT' = '8000'
    'NODE_ENV' = 'development'
}

Write-Host "Vérification des variables d'environnement requises:" -ForegroundColor Cyan
Write-Host ""

$hasErrors = $false
$missingVars = @()
$emptyVars = @()

foreach ($varName in $requiredVars.Keys) {
    $pattern = "^$varName\s*=\s*(.+)$"
    $match = $envContent -match $pattern
    
    if ($match) {
        $value = ($envContent | Select-String -Pattern $pattern).Matches.Groups[1].Value.Trim()
        
        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Host "[VIDE] $varName" -ForegroundColor Yellow
            $emptyVars += $varName
            $hasErrors = $true
        } elseif ($varName -eq 'DB_PASSWORD' -or $varName -eq 'JWT_SECRET') {
            if ($value -match 'votre_|changez_moi' -or $value.Length -lt 10) {
                Write-Host "[ATTENTION] $varName : Valeur par défaut ou trop courte" -ForegroundColor Yellow
                $hasErrors = $true
            } else {
                Write-Host "[OK] $varName : Défini ($($value.Length) caractères)" -ForegroundColor Green
            }
        } else {
            Write-Host "[OK] $varName : $value" -ForegroundColor Green
        }
    } else {
        Write-Host "[MANQUANT] $varName" -ForegroundColor Red
        $missingVars += $varName
        $hasErrors = $true
        if ($requiredVars[$varName]) {
            Write-Host "  → Valeur par défaut suggérée: $($requiredVars[$varName])" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "=== Résumé ===" -ForegroundColor Cyan
Write-Host ""

if ($hasErrors) {
    Write-Host "[ERREUR] Des problèmes ont été détectés dans la configuration." -ForegroundColor Red
    Write-Host ""
    
    if ($missingVars.Count -gt 0) {
        Write-Host "Variables manquantes:" -ForegroundColor Yellow
        foreach ($v in $missingVars) {
            Write-Host "  - $v" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    if ($emptyVars.Count -gt 0) {
        Write-Host "Variables vides:" -ForegroundColor Yellow
        foreach ($v in $emptyVars) {
            Write-Host "  - $v" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "Actions à effectuer:" -ForegroundColor Cyan
    Write-Host "  1. Ouvrez le fichier .env dans qrmenu_backend/"
    Write-Host "  2. Ajoutez ou modifiez les variables manquantes"
    Write-Host "  3. Assurez-vous que DB_PASSWORD correspond à votre mot de passe PostgreSQL"
    Write-Host "  4. Assurez-vous que JWT_SECRET est une clé longue et sécurisée (minimum 32 caractères)"
    Write-Host "  5. Relancez ce script pour vérifier"
    Write-Host ""
    
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
} else {
    Write-Host "[SUCCÈS] Toutes les variables requises sont correctement configurées!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test de connexion à PostgreSQL..." -ForegroundColor Cyan
    Write-Host ""
    
    # Charger les variables dans l'environnement pour Node.js
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.+)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    
    # Exécuter le test de connexion Node.js
    $testScript = @"
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
    console.log('[OK] Connexion à PostgreSQL réussie!');
    console.log('   Heure serveur: ' + result.rows[0].now);
    console.log('   Version: ' + result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('[ERREUR] Erreur de connexion à PostgreSQL:');
    console.error('   Message: ' + err.message);
    console.error('   Code: ' + (err.code || 'N/A'));
    console.error('');
    console.error('Vérifiez:');
    console.error('  1. PostgreSQL est démarré');
    console.error('  2. Les credentials dans .env sont corrects');
    console.error('  3. La base de données existe: psql -U postgres -d qrmenu');
    console.error('  4. Le port PostgreSQL est correct (par défaut: 5432)');
    pool.end();
    process.exit(1);
  });
"@
    
    $testScriptPath = Join-Path $PSScriptRoot "test-db-connection.js"
    $testScript | Out-File -FilePath $testScriptPath -Encoding UTF8
    
    node $testScriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCÈS] Configuration complète et fonctionnelle!" -ForegroundColor Green
        Write-Host "Vous pouvez maintenant démarrer le serveur avec: npm start" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "[ERREUR] La connexion à la base de données a échoué." -ForegroundColor Red
        Write-Host "Corrigez les erreurs ci-dessus avant de démarrer le serveur." -ForegroundColor Yellow
        Write-Host ""
    }
    
    Remove-Item $testScriptPath -ErrorAction SilentlyContinue
    Read-Host "Appuyez sur Entrée pour continuer"
    exit $LASTEXITCODE
}


