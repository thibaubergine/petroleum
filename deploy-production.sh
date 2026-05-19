#!/bin/bash
# deploy-production.sh — Déploiement Petroleum sur serveur Linux
# Usage : bash deploy-production.sh
# Prérequis : nginx, certbot, docker, docker-compose installés

set -e  # Arrêter si une commande échoue

DOMAIN="petroleum.laubergine.org"
APP_DIR="/var/www/petroleum"
BACKEND_DIR="/opt/petroleum"

echo ""
echo "████████████████████████████████████████████████"
echo "  PETROLEUM — DÉPLOIEMENT PRODUCTION"
echo "  $DOMAIN"
echo "████████████████████████████████████████████████"
echo ""

# ── 1. Créer les dossiers ─────────────────────────────────────────────────────
echo "[1] Préparation des dossiers..."
mkdir -p $APP_DIR
mkdir -p $BACKEND_DIR
mkdir -p /opt/petroleum/logs

# ── 2. Build frontend ─────────────────────────────────────────────────────────
echo "[2] Build frontend React..."
cd /tmp/petroleum-build/frontend
npm ci --silent
npm run build

# Copier le build dans le dossier nginx
rm -rf $APP_DIR/dist
cp -r dist $APP_DIR/dist
echo "    ✅ Build React copié dans $APP_DIR/dist"

# ── 3. Backend Docker ─────────────────────────────────────────────────────────
echo "[3] Démarrage backend..."
cd /tmp/petroleum-build

# Créer le docker-compose.prod.yml si nécessaire
cp docker-compose.yml $BACKEND_DIR/docker-compose.yml

# Démarrer PostgreSQL + FastAPI (sans le frontend — nginx sert le statique)
cd $BACKEND_DIR
docker-compose up -d postgres backend
sleep 15

echo "    ✅ Backend démarré sur port 8000"

# ── 4. Init base de données ───────────────────────────────────────────────────
echo "[4] Initialisation base de données..."
docker exec oil-backend python full_init.py
docker exec oil-backend python scripts/import_bp_energy_mix.py
docker exec oil-backend python scripts/import_worldbank.py
echo "    ✅ Base initialisée"

# ── 5. Nginx ──────────────────────────────────────────────────────────────────
echo "[5] Configuration nginx..."
cp /tmp/petroleum-build/nginx.conf /etc/nginx/sites-available/petroleum
ln -sf /etc/nginx/sites-available/petroleum /etc/nginx/sites-enabled/petroleum
nginx -t  # Test de la config
echo "    ✅ Config nginx validée"

# ── 6. SSL Let's Encrypt ──────────────────────────────────────────────────────
echo "[6] Certificat SSL..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@laubergine.org
    echo "    ✅ Certificat SSL créé"
else
    echo "    ✅ Certificat SSL déjà présent"
fi

# ── 7. Reload nginx ───────────────────────────────────────────────────────────
echo "[7] Reload nginx..."
systemctl reload nginx
echo "    ✅ Nginx rechargé"

# ── 8. Cron hebdomadaire ──────────────────────────────────────────────────────
echo "[8] Pipeline hebdomadaire (cron)..."
CRON_CMD="0 8 * * 1 docker exec oil-backend python /app/scripts/weekly_market_update.py >> /opt/petroleum/logs/weekly-\$(date +\%Y\%m\%d).log 2>&1"
(crontab -l 2>/dev/null | grep -v "weekly_market_update"; echo "$CRON_CMD") | crontab -
echo "    ✅ Cron installé (chaque lundi 8h)"

echo ""
echo "████████████████████████████████████████████████"
echo "  ✅ DÉPLOIEMENT TERMINÉ"
echo "  → https://$DOMAIN"
echo "████████████████████████████████████████████████"
echo ""
