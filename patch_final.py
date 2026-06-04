"""
Fix final :
1. PastStory : fix contexte Libye (L'OTAN termine la string)
2. PresentStory : restaure depuis contenu original + applique les 3 changements proprement
"""
import re, sys

BASE = r"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\frontend\src\pages\narrative"

def load(f): 
    with open(f"{BASE}\\{f}", encoding="utf-8-sig") as fh: return fh.read()
def save(f, s): 
    with open(f"{BASE}\\{f}", "w", encoding="utf-8") as fh: fh.write(s)

# ═══ PastStory — fix Libye contexte uniquement ═══
print("\n═══ PastStory.tsx ═══")
src = load("PastStory.tsx")

# Remplace TOUS les contexte en single quotes contenant une apostrophe par double quotes
# On cherche contexte: '...' où '...' contient un ' non précédé de \
lines = src.split('\n')
fixed_lines = []
count = 0
for line in lines:
    if "contexte: '" in line:
        # Extrait la valeur entre les quotes
        m = re.match(r"^(\s*contexte: ')(.*?)(',?\s*)$", line, re.DOTALL)
        if m:
            prefix, val, suffix = m.groups()
            # Si val contient un ' non précédé de \, besoin de double quotes
            if re.search(r"(?<!\\)'", val):
                new_val = val.replace("\\'", "'")
                new_line = prefix.replace("contexte: '", 'contexte: "') + new_val + suffix.replace("',", '",').replace("'", '"', 1)
                # Reconstruit proprement
                indent = len(line) - len(line.lstrip())
                new_line = ' ' * indent + f'contexte: "{new_val}",'
                fixed_lines.append(new_line)
                count += 1
                continue
    fixed_lines.append(line)

if count:
    src = '\n'.join(fixed_lines)
    print(f"  ✅ {count} contexte(s) avec apostrophe convertis en double quotes")
else:
    print("  ⏭  Aucun contexte à fixer")

save("PastStory.tsx", src)

# ═══ PresentStory — vérifie si cassé et restaure si besoin ═══
print("\n═══ PresentStory.tsx ═══")
src = load("PresentStory.tsx")

# Détecte si le fichier est structurellement cassé
# Un symptôme : le component function n'a plus son return intact
broken = src.count('return (') < 1 or src.count('</div>') < 10

if not broken:
    # Vérifie erreur spécifique : intro block mal placé
    # Si "Avant tout" est présent mais avant le return(, c'est cassé
    avant_idx = src.find('Avant tout')
    return_idx = src.find('return (')
    if avant_idx > 0 and avant_idx < return_idx:
        broken = True
        print("  ⚠️  Intro block hors du JSX — fichier cassé")

if broken:
    print("  ❌ Fichier structurellement cassé — restauration nécessaire")
    print("  → Lance: git checkout HEAD -- frontend/src/pages/narrative/PresentStory.tsx")
    print("  → Puis relance ce script")
    sys.exit(1)

# Fichier structurellement OK, applique les changements manquants
changes = 0

# 1. Fix Arabie Saoudite
old1 = "La question semble provocatrice. Elle est en réalité économique."
new1 = "La question semble provocatrice. La réponse, elle, est économique."
if old1 in src:
    src = src.replace(old1, new1); changes += 1; print("  ✅ Fix Arabie Saoudite")
elif new1 in src:
    print("  ⏭  Arabie Saoudite déjà OK")

# 2. Intro block
ANCHOR = '        <ChapterAnchor id="pch-co2" />'
INTRO = '''        <div className="my-10 p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-xs text-white/30 uppercase tracking-widest mb-4 font-bold">Avant tout</div>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            On parle du pétrole comme d&apos;un carburant — c&apos;est réducteur.{' '}
            <strong className="text-white">10% du pétrole mondial ne brûle jamais</strong> : plastiques, engrais, médicaments, textiles.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-center">
            {[
              { val: '~50%', label: 'carburants transport', sub: 'voitures, avions, bateaux' },
              { val: '~16%', label: 'pétrochimie', sub: 'plastiques, matières' },
              { val: '~10%', label: 'agriculture', sub: 'engrais, machines' },
              { val: '~60%', label: 'textiles mondiaux', sub: 'polyester, nylon' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-black text-blue-400 mb-0.5">{s.val}</div>
                <div className="text-white/60 font-semibold">{s.label}</div>
                <div className="text-white/30 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
'''
if "Avant tout" not in src and ANCHOR in src:
    src = src.replace(ANCHOR, INTRO + ANCHOR)
    changes += 1; print("  ✅ Intro block inséré")
elif "Avant tout" in src:
    print("  ⏭  Intro block déjà présent")

# 3. Fil rouge
old3 = "L'empire est invisible parce qu'il est partout."
new3 = "Le CO₂ qui monte, les États rentiers qui ne votent pas, les goulots maritimes, les prix qui font tomber les gouvernements — tous ces fils remontent au même endroit. L'empire est invisible parce qu'il est partout."
if old3 in src and new3 not in src:
    src = src.replace(old3, new3); changes += 1; print("  ✅ Fil rouge conclusion")
elif new3 in src:
    print("  ⏭  Fil rouge déjà OK")

if changes == 0:
    print("  ℹ️  Aucun changement nécessaire")

save("PresentStory.tsx", src)
print(f"\n✅ {changes} changement(s) appliqué(s)\n")
