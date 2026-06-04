"""
Patch PastStory.tsx :
1. Ajoute connexion Rockefeller / chemins de fer / Ford
2. Titre prométhéen + guerres (déjà dans patch_past.py — ce fichier complète)
"""

PATH = r"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\frontend\src\pages\narrative\PastStory.tsx"

with open(PATH, encoding="utf-8") as f:
    src = f.read()

# ── Connexion Rockefeller → rail → Ford ───────────────────────────────────────
src = src.replace(
    "Standard Oil construit les pipelines. Négocie des tarifs secrets avec les chemins de fer. Rachète ou écrase les concurrents.",
    """Standard Oil construit les pipelines. Négocie des tarifs secrets avec les chemins de fer — et comprend avant tout le monde que contrôler l'infrastructure, c'est contrôler la ressource. Le réseau ferroviaire américain, d'abord développé pour acheminer le pétrole des puits pennsylvaniens vers les raffineries de Cleveland, va ensuite se retrouver supplanté par l'automobile. Rockefeller a creusé les sillons où Ford, trente ans plus tard, coulera le bitume. Rachète ou écrase les concurrents."""
)

with open(PATH, "w", encoding="utf-8") as f:
    f.write(src)

print("✅ PastStory.tsx — connexion Rockefeller/rail/Ford ajoutée")
