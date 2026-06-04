"""
Génère les fichiers JSON statiques depuis l'API Railway
et les place dans frontend/public/data/
"""
import urllib.request
import json
import os

BASE = "https://petroleum-production.up.railway.app/api"
OUT  = os.path.join(os.path.dirname(__file__), "frontend", "public", "data")
os.makedirs(OUT, exist_ok=True)

def fetch(path):
    print(f"  Fetching {path}...")
    with urllib.request.urlopen(f"{BASE}{path}", timeout=30) as r:
        return json.loads(r.read())

def save(name, data):
    p = os.path.join(OUT, name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    print(f"  ✅ {name} ({len(data) if isinstance(data, list) else '?'} records)")

print("\n🔄 Génération des fichiers JSON statiques...\n")

# Production historique
save("production.json",  fetch("/historical/production"))

# Prix historiques
save("prices.json",      fetch("/prices"))

# Événements prix
try:
    save("events.json",  fetch("/prices/events"))
except:
    save("events.json",  [])
    print("  ⚠️  events.json vide")

# Réserves
save("reserves.json",    fetch("/reserves/all"))

# Demande régionale
save("demand.json",      fetch("/demand/regional"))

# Analytics production
save("analytics.json",   fetch("/historical/analytics"))

# Sources
save("sources.json",     fetch("/metadata/sources"))

print("\n✅ Tous les fichiers générés dans frontend/public/data/\n")
