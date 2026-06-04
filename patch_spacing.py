"""
Patch landing intro PresentStory + espacement PastStory
"""

BASE = r"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\frontend\src\pages\narrative"

def patch(filename, replacements):
    path = f"{BASE}\\{filename}"
    with open(path, encoding="utf-8-sig") as f:
        src = f.read()
    for old, new in replacements:
        if old in src:
            src = src.replace(old, new)
            print(f"  ✅ {old[:55]}...")
        else:
            print(f"  ❌ NON TROUVÉ : {repr(old[:55])}")
    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

# ── PastStory : espace container ─────────────────────────────────────────────
print("\n── PastStory.tsx ──")
patch("PastStory.tsx", [
    (
        '<div className="max-w-3xl mx-auto px-8 pb-32 space-y-0">',
        '<div className="max-w-3xl mx-auto px-8 pb-32">'
    ),
])

# ── PresentStory : bloc intro avant CO₂ ──────────────────────────────────────
print("\n── PresentStory.tsx ──")

INTRO_BLOCK = """
        {/* ── Intro : le pétrole est partout ── */}
        <div className="my-10 p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-xs text-white/30 uppercase tracking-widest mb-4 font-bold">Avant tout</div>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            On parle du pétrole comme d&apos;un carburant. C&apos;est réducteur.
            <strong className="text-white"> 10% du pétrole mondial ne brûle jamais</strong> — il devient de la matière :
            plastiques, engrais, médicaments, textiles. Le reste alimente le transport, l&apos;industrie, le chauffage.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-center">
            {[
              { val: '~50%', label: 'carburants transport', sub: 'voitures, avions, bateaux' },
              { val: '~16%', label: 'pétrochimie & plastiques', sub: 'matières, emballages' },
              { val: '~10%', label: 'agriculture', sub: 'engrais, machines, films' },
              { val: '~60%', label: 'textiles mondiaux', sub: 'polyester, nylon, acrylique' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-black text-blue-400 mb-0.5">{s.val}</div>
                <div className="text-white/60 font-semibold">{s.label}</div>
                <div className="text-white/30 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-4 leading-relaxed">
            Supprimer le pétrole de la civilisation industrielle, c&apos;est retirer le béton d&apos;un immeuble déjà construit.
            Les chapitres suivants explorent ce que cela implique — pour le climat, la géopolitique, et votre pompe à essence.
          </p>
        </div>

"""

patch("PresentStory.tsx", [
    (
        '\n        <ChapterAnchor id="pch-co2" />\n        {/* I — CO₂ */}',
        INTRO_BLOCK + '        <ChapterAnchor id="pch-co2" />\n        {/* I — CO₂ */'
    ),
])

print("\n✅ Terminé\n")
