# petroleum-weekly-update.ps1
# Planifier via Task Scheduler Windows :
#   - Déclencheur : Chaque lundi à 8h00
#   - Action : powershell.exe -ExecutionPolicy Bypass -File "C:\...\petroleum-weekly-update.ps1"

$TARGET_DIR = "C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard"
$LOG_FILE = "C:\Users\cenom\Documents\Petroleum\V0\logs\market-update-$(Get-Date -Format 'yyyy-MM-dd').log"

# Créer dossier logs si nécessaire
$logDir = Split-Path $LOG_FILE
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

function Write-Log($msg) {
    $line = "$(Get-Date -Format 'HH:mm:ss') $msg"
    Write-Host $line
    Add-Content -Path $LOG_FILE -Value $line
}

Write-Log "=== PETROLEUM WEEKLY UPDATE DÉMARRÉ ==="
Write-Log "Semaine du $(Get-Date -Format 'yyyy-MM-dd')"

# Vérifier que le conteneur tourne
$running = docker ps --filter "name=oil-backend" --format "{{.Names}}" 2>$null
if (-not $running) {
    Write-Log "ERREUR: Conteneur oil-backend non démarré"
    Write-Log "Démarrage du dashboard..."
    Set-Location $TARGET_DIR
    docker-compose up -d
    Start-Sleep -Seconds 20
}

# Lancer le pipeline
Write-Log "Lancement weekly_market_update.py..."
$result = docker exec `
    -e FRED_API_KEY=$env:FRED_API_KEY `
    -e ANTHROPIC_API_KEY=$env:ANTHROPIC_API_KEY `
    oil-backend python scripts/weekly_market_update.py 2>&1

Write-Log $result

if ($LASTEXITCODE -eq 0) {
    Write-Log "✅ Pipeline terminé avec succès"
} else {
    Write-Log "❌ Pipeline échoué (code $LASTEXITCODE)"
}

Write-Log "=== FIN ==="

# ─────────────────────────────────────────────────────────────────────────────
# INSTALLATION DU PLANIFICATEUR (exécuter une seule fois en admin)
# ─────────────────────────────────────────────────────────────────────────────
# Copier/coller dans PowerShell ADMIN pour programmer l'exécution automatique :
#
# $action = New-ScheduledTaskAction `
#     -Execute "powershell.exe" `
#     -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\petroleum-weekly-update.ps1`""
#
# $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "08:00"
#
# Register-ScheduledTask `
#     -TaskName "Petroleum Weekly Update" `
#     -Action $action `
#     -Trigger $trigger `
#     -RunLevel Highest `
#     -Description "Mise à jour hebdomadaire marché pétrolier"
#
# Write-Host "✅ Tâche planifiée créée"
