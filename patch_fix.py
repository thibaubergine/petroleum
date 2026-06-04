"""
Patch ciblé — cas restants avec apostrophes échappées
"""

BASE = r"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\frontend\src\pages\narrative"

def patch(filename, replacements):
    path = f"{BASE}\\{filename}"
    with open(path, encoding="utf-8-sig") as f:
        src = f.read()
    for old, new in replacements:
        if old in src:
            src = src.replace(old, new)
            print(f"  ✅ {old[:50]}...")
        else:
            print(f"  ❌ NON TROUVÉ : {repr(old[:50])}")
    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

print("\n── PastStory.tsx ──")
patch("PastStory.tsx", [

    # 1. Rockefeller railroad connection
    (
        "Standard Oil construit les pipelines. Négocie des tarifs secrets avec les chemins de fer. Rachète ou écrase les concurrents.",
        "Standard Oil construit les pipelines. Négocie des tarifs secrets avec les chemins de fer — et comprend avant tout le monde que contrôler l'infrastructure, c'est contrôler la ressource. Le réseau ferroviaire américain, d'abord développé pour acheminer le pétrole des puits pennsylvaniens vers les raffineries de Cleveland, sera ensuite supplanté par la route goudronnée quand Ford rendra l'automobile accessible. Rockefeller a creusé les sillons où Ford, trente ans plus tard, coulera le bitume. Rachète ou écrase les concurrents."
    ),

    # 2. Afghanistan — apostrophe échappée
    (
        "              guerre: 'Invasion d\\'Afghanistan — 2001-2021',\n              petrole:",
        "              guerre: 'Invasion d\\'Afghanistan — 2001-2021',\n              contexte: 'Suite aux attentats du 11 septembre 2001, les États-Unis envahissent l\\'Afghanistan, sanctuaire des talibans.',\n              petrole:"
    ),

    # 3. Irak — apostrophe échappée
    (
        "              guerre: 'Invasion d\\'Irak — 2003-2011',\n              petrole:",
        "              guerre: 'Invasion d\\'Irak — 2003-2011',\n              contexte: 'Les États-Unis et le Royaume-Uni envahissent l\\'Irak, accusant Saddam Hussein de posséder des armes de destruction massive — accusations jamais prouvées.',\n              petrole:"
    ),

    # 4. Rendu des guerres — afficher contexte
    (
        "              <div className=\"px-4 py-3 flex items-center justify-between\"\n                style={{ backgroundColor: g.color + '20', borderBottom: `1px solid ${g.color}30` }}>\n                <div className=\"font-bold text-white text-sm\">{g.guerre}</div>\n                <div className=\"text-xs font-mono\" style={{ color: g.color }}>{g.petrole.split('—')[0].trim()}</div>\n              </div>",
        "              <div className=\"px-4 py-3\"\n                style={{ backgroundColor: g.color + '20', borderBottom: `1px solid ${g.color}30` }}>\n                <div className=\"flex items-center justify-between mb-1\">\n                  <div className=\"font-bold text-white text-sm\">{g.guerre}</div>\n                  <div className=\"text-xs font-mono\" style={{ color: g.color }}>{g.petrole.split('—')[0].trim()}</div>\n                </div>\n                {(g as any).contexte && <div className=\"text-xs text-white/55 italic leading-relaxed mt-1\">{(g as any).contexte}</div>}\n              </div>"
    ),
])

print("\n✅ Terminé\n")
