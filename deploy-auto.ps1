# Oil Dashboard - Deploiement Complet (avec rebuild)
# ~3 minutes

$DOWNLOADS  = "$env:USERPROFILE\Downloads"
$TARGET_DIR = "C:\Users\cenom\Documents\Petroleum\V0"
$ENV_FILE   = "$TARGET_DIR\.env"   # hors du dossier oil-dashboard, jamais ecrase

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  OIL DASHBOARD - DEPLOIEMENT COMPLET" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# [1] Trouver archive
Write-Host "[1/5] Recherche derniere version..." -ForegroundColor Yellow
$Archives = Get-ChildItem -Path $DOWNLOADS -Filter "oil-dashboard_*.zip" | Sort-Object LastWriteTime -Descending
if ($Archives.Count -eq 0) {
    Write-Host "      ERREUR: Aucune archive dans Downloads" -ForegroundColor Red
    Read-Host "Entree pour fermer"; exit 1
}
$Latest  = $Archives[0]
$Version = $Latest.Name -replace 'oil-dashboard_|\.zip', ''
$Size    = [math]::Round($Latest.Length / 1KB)
Write-Host "      OK: $($Latest.Name) ($Size KB)" -ForegroundColor Green
Write-Host ""

# [2] Arreter conteneurs
Write-Host "[2/5] Arret des conteneurs..." -ForegroundColor Yellow
Set-Location $TARGET_DIR
if (Test-Path "oil-dashboard") {
    Set-Location "oil-dashboard"
    docker-compose down -v 2>&1 | Out-Null
    Set-Location ..
}
Start-Sleep -Seconds 5
Write-Host "      OK" -ForegroundColor Green
Write-Host ""

# [3] Extraire
Write-Host "[3/5] Extraction..." -ForegroundColor Yellow
if (Test-Path "$TARGET_DIR\oil-dashboard") {
    Remove-Item "$TARGET_DIR\oil-dashboard" -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    if (Test-Path "$TARGET_DIR\oil-dashboard") {
        Remove-Item "$TARGET_DIR\oil-dashboard" -Recurse -Force
    }
}
Expand-Archive -Path $Latest.FullName -DestinationPath $TARGET_DIR -Force

# Copier le .env dans le nouveau dossier
if (Test-Path $ENV_FILE) {
    Copy-Item $ENV_FILE "$TARGET_DIR\oil-dashboard\.env"
    Write-Host "      -> .env injecte" -ForegroundColor Gray
} else {
    Write-Host "      -> PAS DE .env - creer: $ENV_FILE" -ForegroundColor Yellow
}
Write-Host "      OK" -ForegroundColor Green
Write-Host ""

# [4] Build + demarrage
Write-Host "[4/5] Build (2-3 min)..." -ForegroundColor Yellow
Set-Location "$TARGET_DIR\oil-dashboard"
docker-compose build --no-cache 2>&1 | Out-Null
docker-compose up -d
Write-Host "      OK" -ForegroundColor Green
Write-Host ""

# [5] Init base
Write-Host "[5/5] Initialisation..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
docker exec "oil-backend" python full_init.py
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
