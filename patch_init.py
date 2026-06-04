"""
Ajoute un check "déjà initialisé" dans full_init.py
"""

PATH = r"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\backend\full_init.py"

with open(PATH, encoding="utf-8-sig") as f:
    src = f.read()

# Cherche le début de la fonction main()
OLD = "def main():"
NEW = """def is_already_initialized():
    try:
        db = SessionLocal()
        from sqlalchemy import text
        count = db.execute(text("SELECT COUNT(*) FROM historical_production")).scalar()
        db.close()
        return count > 100
    except:
        return False

def main():\n    if is_already_initialized():\n        print("✅ DB déjà initialisée — skip init")\n        return"""

if OLD in src and "is_already_initialized" not in src:
    src = src.replace(OLD, NEW)
    print("  ✅ Check ajouté")
elif "is_already_initialized" in src:
    print("  ⏭  Déjà présent")
else:
    print("  ❌ Fonction main() non trouvée")

with open(PATH, "w", encoding="utf-8") as f:
    f.write(src)

print("\n✅ Terminé")
print("\n→ Remets le pre-deploy command dans Railway :")
print('   python full_init.py')
