"""
Script définitif — corrige tout depuis l'état actuel des fichiers
Gère les apostrophes, encodage, et structure JSX
"""
import re

BASE = r"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\frontend\src\pages\narrative"

def load(filename):
    path = f"{BASE}\\{filename}"
    with open(path, encoding="utf-8-sig") as f:
        return f.read()

def save(filename, src):
    path = f"{BASE}\\{filename}"
    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

def apply(src, old, new, label):
    if new.strip()[:40] in src:
        print(f"  ⏭  déjà OK : {label}")
        return src
    if old in src:
        print(f"  ✅ {label}")
        return src.replace(old, new)
    print(f"  ❌ non trouvé : {label}")
    return src

# ═══════════════════════════════════════════════════════
print("\n═══ PastStory.tsx ═══")
src = load("PastStory.tsx")

# 1. Titre dashboard
src = apply(src,
    "Le feu souterrain — anatomie d'une énergie prométhéenne",
    "Le feu souterrain — une énergie prométhéenne",
    "Titre prométhéen")

# 2. Intro prométhéenne
src = apply(src,
    "Prométhée offrit aux hommes le feu des dieux — et paya ce don de sa liberté pour l'éternité. Il est de bon ton de faire une analogie pompeuse avec une référence mythologique ou biblique, celle-ci me semble idéale.",
    "Prométhée offrit aux hommes le feu, il paya ce don de sa liberté pour l'éternité. Il est de bon ton de faire une analogie pompeuse avec une référence mythologique ou biblique, celle-ci fonctionne.",
    "Intro prométhéenne")

# 3. Rockefeller railroad
src = apply(src,
    "Standard Oil construit les pipelines. Négocie des tarifs secrets avec les chemins de fer. Rachète ou écrase les concurrents.",
    "Standard Oil construit les pipelines. Négocie des tarifs secrets avec les chemins de fer — et comprend avant tout le monde que contrôler l'infrastructure, c'est contrôler la ressource. Le réseau ferroviaire américain, d'abord développé pour acheminer le pétrole des puits pennsylvaniens vers les raffineries de Cleveland, sera ensuite supplanté par la route goudronnée quand Ford rendra l'automobile accessible. Rockefeller a creusé les sillons où Ford, trente ans plus tard, coulera le bitume. Rachète ou écrase les concurrents.",
    "Rockefeller railroad")

# 4. Space-y-0 sur container
src = apply(src,
    '<div className="max-w-3xl mx-auto px-8 pb-32 space-y-0">',
    '<div className="max-w-3xl mx-auto px-8 pb-32">',
    "Suppression space-y-0")

# 5. Fix apostrophes via regex — remplace tout contexte avec \' par double quotes
def fix_contexte_apostrophe(src):
    # Trouve les contexte avec backslash-apostrophe et les convertit en double quotes
    pattern = r"contexte: '((?:[^'\\]|\\.)*)'"
    def replacer(m):
        inner = m.group(1).replace("\\'", "'")
        if "'" in inner:
            return f'contexte: "{inner}"'
        return m.group(0)  # Pas d'apostrophe, laisse tel quel
    new_src = re.sub(pattern, replacer, src)
    if new_src != src:
        print("  ✅ Fix apostrophes dans contexte (regex)")
    return new_src

src = fix_contexte_apostrophe(src)

# 6. Contexte manquants (si pas encore ajoutés)
src = apply(src,
    "guerre: \"Invasion d'Afghanistan — 2001-2021\",\n              petrole:",
    "guerre: \"Invasion d'Afghanistan — 2001-2021\",\n              contexte: \"Suite aux attentats du 11 septembre 2001, les États-Unis envahissent l'Afghanistan, sanctuaire des talibans.\",\n              petrole:",
    "Contexte Afghanistan (double quotes)")

# Fallback si la guerre Afghanistan est en single quotes sans contexte
src = apply(src,
    "guerre: 'Invasion d\\'Afghanistan — 2001-2021',\n              petrole:",
    "guerre: \"Invasion d'Afghanistan — 2001-2021\",\n              contexte: \"Suite aux attentats du 11 septembre 2001, les États-Unis envahissent l'Afghanistan, sanctuaire des talibans.\",\n              petrole:",
    "Contexte Afghanistan (fallback)")

src = apply(src,
    "guerre: \"Invasion d'Irak — 2003-2011\",\n              petrole:",
    "guerre: \"Invasion d'Irak — 2003-2011\",\n              contexte: \"Les États-Unis et le Royaume-Uni envahissent l'Irak, accusant Saddam Hussein de posséder des armes de destruction massive — accusations jamais prouvées.\",\n              petrole:",
    "Contexte Irak (double quotes)")

src = apply(src,
    "guerre: 'Invasion d\\'Irak — 2003-2011',\n              petrole:",
    "guerre: \"Invasion d'Irak — 2003-2011\",\n              contexte: \"Les États-Unis et le Royaume-Uni envahissent l'Irak, accusant Saddam Hussein de posséder des armes de destruction massive — accusations jamais prouvées.\",\n              petrole:",
    "Contexte Irak (fallback)")

# 7. Rendu des guerres — version propre avec as any[]
OLD_RENDER = """.map(g => (
            <div key={g.guerre} className="rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: g.color + '20', borderBottom: `1px solid ${g.color}30` }}>
                <div className="font-bold text-white text-sm">{g.guerre}</div>
                <div className="text-xs font-mono" style={{ color: g.color }}>{g.petrole.split('—')[0].trim()}</div>
              </div>"""

NEW_RENDER = """.map((g: any) => (
            <div key={g.guerre} className="rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3"
                style={{ backgroundColor: g.color + '20', borderBottom: `1px solid ${g.color}30` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-white text-sm">{g.guerre}</div>
                  <div className="text-xs font-mono" style={{ color: g.color }}>{g.petrole.split('—')[0].trim()}</div>
                </div>
                {g.contexte && <div className="text-xs text-white/55 italic leading-relaxed mt-1">{g.contexte}</div>}
              </div>"""

src = apply(src, OLD_RENDER, NEW_RENDER, "Rendu guerres avec contexte")

# Nettoyage : retire les variantes cassées du rendu si présentes
broken_renders = [
    '{(g as any).contexte && <div className="text-xs text-white/55 italic leading-relaxed mt-1">{(g as any).contexte}</div>}',
    "{g['contexte'] && <div className=\"text-xs text-white/55 italic leading-relaxed mt-1\">{g['contexte']}</div>}",
]
for br in broken_renders:
    if br in src:
        # Remplace par la version propre
        src = src.replace(br, '{g.contexte && <div className="text-xs text-white/55 italic leading-relaxed mt-1">{g.contexte}</div>}')
        print("  ✅ Nettoyage rendu cassé")

save("PastStory.tsx", src)

# ═══════════════════════════════════════════════════════
print("\n═══ PresentStory.tsx ═══")
src = load("PresentStory.tsx")

# 1. Fix phrase Arabie Saoudite
src = apply(src,
    "La question semble provocatrice. Elle est en réalité économique.",
    "La question semble provocatrice. La réponse, elle, est économique.",
    "Phrase Arabie Saoudite")

# 2. Fil rouge conclusion
src = apply(src,
    "L'empire est invisible parce qu'il est partout.",
    "Le CO₂ qui monte, les États rentiers qui ne votent pas, les goulots d'étranglement maritimes, les prix qui font tomber les gouvernements, les batteries électriques transportées au fioul lourd — tous ces fils remontent au même endroit. L'empire est invisible parce qu'il est partout.",
    "Fil rouge conclusion")

# 3. Bloc intro — nettoie d'abord toute version cassée
bad_patterns = [
    r'\{/\* ── Intro : le pétrole est partout ── \*/\}\s*<div[^>]*my-10[^>]*>.*?</div>\s*\n',
]
for bp in bad_patterns:
    cleaned = re.sub(bp, '', src, flags=re.DOTALL)
    if cleaned != src:
        src = cleaned
        print("  🧹 Bloc intro cassé nettoyé")

# Insère le bloc intro propre si absent
ANCHOR = '        <ChapterAnchor id="pch-co2" />'
INTRO = '''        <div className="my-10 p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-xs text-white/30 uppercase tracking-widest mb-4 font-bold">Avant tout</div>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            On parle du pétrole comme d&apos;un carburant — c&apos;est réducteur.{' '}
            <strong className="text-white">10% du pétrole mondial ne brûle jamais</strong> : il devient de la
            matière — plastiques, engrais, médicaments, textiles.
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

if ANCHOR in src and "Avant tout" not in src:
    src = src.replace(ANCHOR, INTRO + ANCHOR)
    print("  ✅ Bloc intro inséré")
elif "Avant tout" in src:
    print("  ⏭  Bloc intro déjà présent")

save("PresentStory.tsx", src)

print("\n✅ Tout terminé\n")
