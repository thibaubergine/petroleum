#!/bin/bash

# Script de migration automatique de la palette de couleurs
# Remplace toutes les anciennes couleurs par les nouvelles dans les fichiers frontend

echo "🎨 Migration de la palette de couleurs..."

# Répertoire frontend
FRONTEND_DIR="/mnt/user-data/outputs/oil-dashboard/frontend/src"

# Liste des fichiers à traiter
FILES=$(find $FRONTEND_DIR -name "*.tsx" -o -name "*.ts" | grep -v "node_modules")

# Compteur
COUNT=0

for FILE in $FILES; do
  # Remplacements des couleurs Tailwind
  sed -i 's/oil-orange/oil-bronze/g' "$FILE"
  sed -i 's/oil-red/oil-rust/g' "$FILE"
  sed -i 's/oil-black/oil-slate/g' "$FILE"
  sed -i 's/oil-brown/oil-copper/g' "$FILE"
  sed -i 's/oil-gold/oil-bronze/g' "$FILE"
  sed -i 's/oil-cream-dark/oil-sand-dark/g' "$FILE"
  sed -i 's/oil-cream/oil-sand/g' "$FILE"
  
  # Remplacements des couleurs hex dans stroke/fill (Recharts)
  sed -i 's/#D97642/#A67C52/g' "$FILE"  # orange → bronze
  sed -i 's/#C85A3C/#B85450/g' "$FILE"  # red → rust
  sed -i 's/#2A2520/#2C3E50/g' "$FILE"  # black → slate
  sed -i 's/#8B6340/#8B6F47/g' "$FILE"  # brown → copper
  sed -i 's/#E8A04A/#A67C52/g' "$FILE"  # gold → bronze
  sed -i 's/#E8DCC8/#D4C7B3/g' "$FILE"  # cream-dark → sand-dark
  sed -i 's/#F5EDE0/#ECE5D8/g' "$FILE"  # cream → sand
  
  ((COUNT++))
done

echo "✅ $COUNT fichiers traités"
echo ""
echo "📋 Couleurs migrées :"
echo "  oil-orange → oil-bronze (#A67C52)"
echo "  oil-red → oil-rust (#B85450)"
echo "  oil-black → oil-slate (#2C3E50)"
echo "  oil-brown → oil-copper (#8B6F47)"
echo "  oil-gold → oil-bronze"
echo "  oil-cream → oil-sand (#ECE5D8)"
echo ""
echo "🎯 Migration terminée !"
