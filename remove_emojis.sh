#!/bin/bash

# Script pour retirer les émojis des titres
# Remplace <span className="text-2xl">📈</span> par rien

echo "🧹 Retrait des émojis des titres..."

FRONTEND_DIR="/mnt/user-data/outputs/oil-dashboard/frontend/src"
FILES=$(find $FRONTEND_DIR -name "*.tsx" | grep -v "node_modules")

COUNT=0
REMOVED=0

for FILE in $FILES; do
  # Compter les émojis avant
  BEFORE=$(grep -c '<span className="text-2xl">' "$FILE" 2>/dev/null || echo 0)
  
  # Retirer les span avec émojis (pattern: <span className="text-2xl">EMOJI</span>)
  sed -i 's/<span className="text-2xl">[^<]*<\/span>//g' "$FILE"
  
  # Compter après
  AFTER=$(grep -c '<span className="text-2xl">' "$FILE" 2>/dev/null || echo 0)
  
  if [ $BEFORE -gt 0 ]; then
    DIFF=$((BEFORE - AFTER))
    REMOVED=$((REMOVED + DIFF))
    echo "  $FILE: $DIFF émojis retirés"
  fi
  
  ((COUNT++))
done

echo ""
echo "✅ $COUNT fichiers traités"
echo "🗑️  $REMOVED émojis retirés"
echo ""
echo "🎯 Nettoyage terminé !"
