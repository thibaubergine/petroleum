"""
Patch all-in-one — PastStory + PresentStory
Robuste : gère BOM et CRLF Windows
"""
import re

BASE = r"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\frontend\src\pages\narrative"

def patch(filename, replacements):
    path = f"{BASE}\\{filename}"
    with open(path, encoding="utf-8-sig") as f:
        src = f.read()
    ok = True
    for old, new in replacements:
        if old in src:
            src = src.replace(old, new)
            print(f"  ✅ OK : {old[:60]}...")
        else:
            print(f"  ❌ NON TROUVÉ : {old[:60]}...")
            ok = False
    with open(path, "w", encoding="utf-8") as f:
        f.write(src)
    return ok

print("\n── PastStory.tsx ──")
patch("PastStory.tsx", [

    # 1. Titre prométhéen header dashboard
    (
        "Le feu souterrain — anatomie d'une énergie prométhéenne",
        "Le feu souterrain — une énergie prométhéenne"
    ),

    # 2. Intro prométhéenne
    (
        "Prométhée offrit aux hommes le feu des dieux — et paya ce don de sa liberté pour l'éternité. Il est de bon ton de faire une analogie pompeuse avec une référence mythologique ou biblique, celle-ci me semble idéale.",
        "Prométhée offrit aux hommes le feu, il paya ce don de sa liberté pour l'éternité. Il est de bon ton de faire une analogie pompeuse avec une référence mythologique ou biblique, celle-ci fonctionne."
    ),

    # 3. Rockefeller → rail → Ford
    (
        "Standard Oil construit les pipelines. Négocie des tarifs secrets avec les chemins de fer. Rachète ou écrase les concurrents.",
        "Standard Oil construit les pipelines. Négocie des tarifs secrets avec les chemins de fer — et comprend avant tout le monde que contrôler l'infrastructure, c'est contrôler la ressource. Le réseau ferroviaire américain, d'abord développé pour acheminer le pétrole des puits pennsylvaniens vers les raffineries de Cleveland, sera ensuite supplanté par la route goudronnée quand Ford rendra l'automobile accessible. Rockefeller a creusé les sillons où Ford, trente ans plus tard, coulera le bitume. Rachète ou écrase les concurrents."
    ),

    # 4. Espacement paragraphes P
    (
        'return <p className="text-white/70 leading-relaxed text-base mb-7" style={{lineHeight:"1.9"}}>',
        'return <p className="text-white/70 leading-relaxed text-base mb-9" style={{lineHeight:"1.95"}}>'
    ),

    # 5. Contexte guerres — Guerre du Golfe
    (
        "              guerre: 'Guerre du Golfe — 1990-1991',\n              petrole:",
        "              guerre: 'Guerre du Golfe — 1990-1991',\n              contexte: 'Le 2 août 1990, Saddam Hussein envahit le Koweït voisin, revendiquant son territoire et ses réserves pétrolières.',\n              petrole:"
    ),

    # 6. Contexte guerres — Afghanistan
    (
        "              guerre: 'Invasion d'Afghanistan — 2001-2021',\n              petrole:",
        "              guerre: 'Invasion d'Afghanistan — 2001-2021',\n              contexte: 'Le 11 septembre 2001, Al-Qaïda détruit les tours du World Trade Center. Les États-Unis ripostent en envahissant l'Afghanistan, sanctuaire des talibans.',\n              petrole:"
    ),

    # 7. Contexte guerres — Irak
    (
        "              guerre: 'Invasion d'Irak — 2003-2011',\n              petrole:",
        "              guerre: 'Invasion d'Irak — 2003-2011',\n              contexte: 'Les États-Unis et le Royaume-Uni envahissent l'Irak en accusant Saddam Hussein de posséder des armes de destruction massive — accusations jamais prouvées.',\n              petrole:"
    ),

    # 8. Contexte guerres — Libye
    (
        "              guerre: 'Printemps arabe / Libye — 2011',\n              petrole:",
        "              guerre: 'Printemps arabe / Libye — 2011',\n              contexte: 'La population libyenne se soulève contre Kadhafi, au pouvoir depuis 42 ans. L'OTAN intervient militairement sous mandat onusien.',\n              petrole:"
    ),

    # 9. Contexte guerres — Ukraine
    (
        "              guerre: 'Guerre en Ukraine — 2022-présent',\n              petrole:",
        "              guerre: 'Guerre en Ukraine — 2022-présent',\n              contexte: 'Le 24 février 2022, la Russie envahit l'Ukraine, déclenchant la plus grande guerre terrestre en Europe depuis 1945.',\n              petrole:"
    ),

    # 10. Affichage contexte dans le rendu des guerres
    (
        """              <div className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: g.color + '20', borderBottom: `1px solid ${g.color}30` }}>
                <div className="font-bold text-white text-sm">{g.guerre}</div>
                <div className="text-xs font-mono" style={{ color: g.color }}>{g.petrole.split('—')[0].trim()}</div>
              </div>""",
        """              <div className="px-4 py-3"
                style={{ backgroundColor: g.color + '20', borderBottom: `1px solid ${g.color}30` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-white text-sm">{g.guerre}</div>
                  <div className="text-xs font-mono" style={{ color: g.color }}>{g.petrole.split('—')[0].trim()}</div>
                </div>
                {'contexte' in g && <div className="text-xs text-white/55 italic leading-relaxed mt-1">{(g as any).contexte}</div>}
              </div>"""
    ),
])

print("\n── PresentStory.tsx ──")
patch("PresentStory.tsx", [

    # 1. Fix phrase Arabie Saoudite
    (
        "La question semble provocatrice. Elle est en réalité économique.",
        "La question semble provocatrice. La réponse, elle, est économique."
    ),

    # 2. Fil rouge avant conclusion
    (
        "L'empire est invisible parce qu'il est partout.",
        "Le CO₂ qui monte, les émirats qui ne votent pas, les goulots d'étranglement maritimes, les prix qui font tomber les gouvernements, les batteries électriques transportées au fioul lourd — tous ces fils remontent au même endroit. L'empire est invisible parce qu'il est partout."
    ),
])

print("\n✅ Terminé\n")
