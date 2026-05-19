# Oil Dashboard - Deploiement Leger (sans rebuild)
# ~15 secondes

$DOWNLOADS  = "$env:USERPROFILE\Downloads"
$TARGET_DIR = "C:\Users\cenom\Documents\Petroleum\V0"
$ENV_FILE   = "$TARGET_DIR\.env"   # ICI - hors du dossier oil-dashboard, jamais ecrase

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  OIL DASHBOARD - DEPLOIEMENT LEGER" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# [1] Trouver archive
Write-Host "[1/4] Recherche derniere version..." -ForegroundColor Yellow
$Archives = Get-ChildItem -Path $DOWNLOADS -Filter "oil-dashboard_*.zip" | Sort-Object LastWriteTime -Descending
if ($Archives.Count -eq 0) {
    Write-Host "      ERREUR: Aucune archive dans Downloads" -ForegroundColor Red
    Read-Host "Entree pour fermer"; exit 1
}
$Latest  = $Archives[0]
$Version = $Latest.Name -replace 'oil-dashboard_|\.zip', ''
Write-Host "      OK: $($Latest.Name)" -ForegroundColor Green
Write-Host ""

# [2] Arreter conteneurs
Write-Host "[2/4] Arret conteneurs..." -ForegroundColor Yellow
Set-Location $TARGET_DIR
if (Test-Path "oil-dashboard") {
    Set-Location "oil-dashboard"
    docker-compose stop 2>&1 | Out-Null
    Set-Location ..
}
Start-Sleep -Seconds 3
Write-Host "      OK" -ForegroundColor Green
Write-Host ""

# [3] Extraire (le .env est dans $TARGET_DIR, pas dans oil-dashboard -> jamais touche)
Write-Host "[3/4] Extraction..." -ForegroundColor Yellow
if (Test-Path "$TARGET_DIR\oil-dashboard") {
    Remove-Item "$TARGET_DIR\oil-dashboard" -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    if (Test-Path "$TARGET_DIR\oil-dashboard") {
        Remove-Item "$TARGET_DIR\oil-dashboard" -Recurse -Force
    }
}
Expand-Archive -Path $Latest.FullName -DestinationPath $TARGET_DIR -Force

# Copier le .env dans le nouveau dossier si il existe
if (Test-Path $ENV_FILE) {
    Copy-Item $ENV_FILE "$TARGET_DIR\oil-dashboard\.env"
    Write-Host "      -> .env injecte" -ForegroundColor Gray
} else {
    Write-Host "      -> PAS DE .env - creer: $ENV_FILE" -ForegroundColor Yellow
}
Write-Host "      OK" -ForegroundColor Green
Write-Host ""

# [4] Redemarrer
Write-Host "[4/4] Redemarrage..." -ForegroundColor Yellow
Set-Location "$TARGET_DIR\oil-dashboard"
docker-compose up -d
Write-Host "      OK" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "  OK - VERSION $Version DEPLOYEE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Dashboard: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

Start-Process "http://localhost:5173"
Read-Host "Entree pour fermer"
