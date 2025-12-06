# Script pour ajouter les variables Cloudinary au fichier .env

$envFile = ".env"

if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    
    if ($content -notmatch "CLOUDINARY_CLOUD_NAME") {
        $cloudinaryConfig = @"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=ddbavughv
CLOUDINARY_API_KEY=963751246787342
CLOUDINARY_API_SECRET=jd0fN2eFagTMkPZroTJ63_dWxRc
"@
        Add-Content -Path $envFile -Value $cloudinaryConfig
        Write-Host "✅ Variables Cloudinary ajoutées au fichier .env"
    } else {
        Write-Host "✅ Variables Cloudinary déjà présentes dans .env"
    }
    
    # Afficher les variables Cloudinary
    Write-Host "`nVariables Cloudinary dans .env:"
    Get-Content $envFile | Select-String "CLOUDINARY" | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "❌ Fichier .env non trouvé"
}

