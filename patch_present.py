"""
Patch PresentStory.tsx :
1. Fix phrase Arabie Saoudite
2. Ajoute intro "pétrole dans tout" avec chiffres avant chapitre I
3. Améliore fil rouge vers la conclusion
"""
import re

PATH = r"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\frontend\src\pages\narrative\PresentStory.tsx"

with open(PATH, encoding="utf-8") as f:
    src = f.read()

# ── 1. Fix phrase Arabie Saoudite ─────────────────────────────────────────────
src = src.replace(
    "La question semble provocatrice. Elle est en réalité économique.",
    "La question semble provocatrice. La réponse, elle, est économique."
)

# ── 2. Intro "pétrole dans tout" avant chapitre CO₂ ──────────────────────────
OLD_ANCHOR = """        <ChapterAnchor id="pch-co2" />
        {/* I — CO₂ */}
        <ChapterLabel n="I" label="Climat" />
        <H2>Ce que le pétrole fait à l'atmosphère — sans détour</H2>"""

NEW_ANCHOR = """        {/* ── Intro : le pétrole est partout ── */}
        <div className="my-10 p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-xs text-white/30 uppercase tracking-widest mb-4 font-bold">Avant tout</div>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            On parle du pétrole comme d'un carburant. C'est réducteur.
            <strong className="text-white"> 10% du pétrole mondial ne brûle jamais</strong> — il devient de la matière :
            plastiques, engrais, médicaments, textiles. Le reste alimente le transport, l'industrie, le chauffage.
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
            Supprimer le pétrole de la civilisation industrielle, c'est retirer le béton d'un immeuble déjà construit.
            Les chapitres suivants explorent ce que cela implique — pour le climat, la géopolitique, et votre pompe à essence.
          </p>
        </div>

        <ChapterAnchor id="pch-co2" />
        {/* I — CO₂ */}
        <ChapterLabel n="I" label="Climat" />
        <H2>Ce que le pétrole fait à l'atmosphère — sans détour</H2>"""

src = src.replace(OLD_ANCHOR, NEW_ANCHOR)

# ── 3. Améliore fil rouge avant la conclusion ─────────────────────────────────
src = src.replace(
    """          <P>
            L'empire est invisible parce qu'il est partout.
          </P>""",
    """          <P>
            Le CO₂ qui monte, les émirats qui ne votent pas, les goulots d'étranglement maritimes,
            les prix qui font tomber les gouvernements, les batteries électriques transportées
            au fioul lourd — tous ces fils remontent au même endroit.
            L'empire est invisible parce qu'il est partout.
          </P>"""
)

with open(PATH, "w", encoding="utf-8") as f:
    f.write(src)

print("✅ PresentStory.tsx patché")
