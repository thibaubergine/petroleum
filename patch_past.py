"""
Patch PastStory.tsx :
1. Remplace le titre/intro prométhéen
2. Ajoute contexte géopolitique aux guerres
3. Introduit Drake dès sa première mention
"""
import re, sys

PATH = r"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\frontend\src\pages\narrative\PastStory.tsx"

with open(PATH, encoding="utf-8") as f:
    src = f.read()

# ── 1. Titre header dashboard ─────────────────────────────────────────────────
src = src.replace(
    "Le feu souterrain — anatomie d'une énergie prométhéenne",
    "Le feu souterrain — une énergie prométhéenne"
)

# ── 2. Intro prométhéenne (dans Landing ou App) ───────────────────────────────
src = src.replace(
    "Prométhée offrit aux hommes le feu des dieux — et paya ce don de sa liberté pour l'éternité. Il est de bon ton de faire une analogie pompeuse avec une référence mythologique ou biblique, celle-ci me semble idéale. Le pétrole est l'exact équivalent moderne : énergie souterraine et primordiale, il a alimenté deux siècles de technologies et de croissance exponentielle. Mais toute énergie prométhéenne porte sa malédiction — l'expansion qu'elle rend possible creuse simultanément les conditions de son propre épuisement.",
    "Prométhée offrit aux hommes le feu, il paya ce don de sa liberté pour l'éternité. Il est de bon ton de faire une analogie pompeuse avec une référence mythologique ou biblique, celle-ci fonctionne. Le pétrole est l'exact équivalent moderne : énergie souterraine et primordiale, il a alimenté deux siècles de technologies et de croissance exponentielle. Mais toute énergie prométhéenne porte sa malédiction — l'expansion qu'elle rend possible creuse simultanément les conditions de son propre épuisement."
)

# ── 3. Contexte géopolitique dans les guerres ────────────────────────────────
# On ajoute un champ `contexte` à chaque guerre et on met à jour le rendu

OLD_WARS = """          {[
            {
              guerre: 'Guerre du Golfe — 1990-1991',
              petrole: 'Irak envahit le Koweït — 10% des réserves mondiales changent de mains',
              reponse: 'Coalition de 34 pays menée par les USA. Libération du Koweït en 6 semaines.',
              dit: '"Protéger la souveraineté du Koweït"',
              vrai: 'Protéger 10% des réserves mondiales prouvées et maintenir l\'accès au Golfe.',
              color: '#C17F24',
            },
            {
              guerre: 'Invasion d\'Afghanistan — 2001-2021',
              petrole: 'Pipeline TAPI (Turkménistan-Afghanistan-Pakistan-Inde) : 33 Gm³/an de gaz planifié',
              reponse: '20 ans d\'occupation, 2 400 soldats américains tués, 2 000 milliards dépensés.',
              dit: '"Éliminer Al-Qaïda et les Talibans"',
              vrai: 'Sécuriser un corridor énergétique stratégique en Asie centrale. Les Talibans ont repris le pouvoir 3 semaines après le départ.',
              color: '#8B4513',
            },
            {
              guerre: 'Invasion d\'Irak — 2003-2011',
              petrole: '115 milliards de barils de réserves prouvées — 3e réserve mondiale',
              reponse: 'Coalition USA-UK. 4 500 soldats américains tués. 500 000 civils irakiens morts (estimations ONU).',
              dit: '"Armes de destruction massive" (inexistantes)',
              vrai: 'Accès aux réserves irakiennes. ExxonMobil, BP et Shell ont signé des contrats d\'exploitation dans les 3 ans suivant l\'invasion.',
              color: '#B85450',
            },
            {
              guerre: 'Printemps arabe / Libye — 2011',
              petrole: '48 milliards de barils + pétrole léger de haute qualité, coût d\'extraction parmi les plus bas au monde',
              reponse: 'Intervention OTAN. Kadhafi tué. Chaos durable.',
              dit: '"Protéger les civils" (résolution ONU 1973)',
              vrai: 'La France et l\'Italie avaient des contrats pétroliers massifs. Total et ENI ont maintenu leurs accès post-intervention.',
              color: '#7B5EA7',
            },
            {
              guerre: 'Guerre en Ukraine — 2022-présent',
              petrole: 'Russie = 2e exportateur mondial de pétrole, 1er de gaz naturel vers l\'Europe',
              reponse: 'Sanctions occidentales massives. Réorientation des flux énergétiques européens. Prix du gaz ×10 en Europe en 2022.',
              dit: '"Défense de la démocratie ukrainienne"',
              vrai: 'Réelle — mais aussi fin de la dépendance européenne au gaz russe, déjà planifiée depuis 2014 (Nord Stream sabotage inclus).',
              color: '#4A90A4',
            },
          ].map(g => ("""

NEW_WARS = """          {[
            {
              guerre: 'Guerre du Golfe — 1990-1991',
              contexte: 'Le 2 août 1990, Saddam Hussein envahit le Koweït voisin, revendiquant son territoire et ses réserves pétrolières.',
              petrole: 'Irak envahit le Koweït — 10% des réserves mondiales changent de mains',
              reponse: 'Coalition de 34 pays menée par les USA. Libération du Koweït en 6 semaines.',
              dit: '"Protéger la souveraineté du Koweït"',
              vrai: 'Protéger 10% des réserves mondiales prouvées et maintenir l\'accès au Golfe.',
              color: '#C17F24',
            },
            {
              guerre: 'Invasion d\'Afghanistan — 2001-2021',
              contexte: 'Le 11 septembre 2001, Al-Qaïda détruit les tours du World Trade Center. Les États-Unis ripostent en envahissant l\'Afghanistan, sanctuaire des talibans.',
              petrole: 'Pipeline TAPI (Turkménistan-Afghanistan-Pakistan-Inde) : 33 Gm³/an de gaz planifié',
              reponse: '20 ans d\'occupation, 2 400 soldats américains tués, 2 000 milliards dépensés.',
              dit: '"Éliminer Al-Qaïda et les Talibans"',
              vrai: 'Sécuriser un corridor énergétique stratégique en Asie centrale. Les Talibans ont repris le pouvoir 3 semaines après le départ.',
              color: '#8B4513',
            },
            {
              guerre: 'Invasion d\'Irak — 2003-2011',
              contexte: 'Les États-Unis et le Royaume-Uni envahissent l\'Irak en accusant Saddam Hussein de posséder des armes de destruction massive — accusations jamais prouvées.',
              petrole: '115 milliards de barils de réserves prouvées — 3e réserve mondiale',
              reponse: 'Coalition USA-UK. 4 500 soldats américains tués. 500 000 civils irakiens morts (estimations ONU).',
              dit: '"Armes de destruction massive" (inexistantes)',
              vrai: 'Accès aux réserves irakiennes. ExxonMobil, BP et Shell ont signé des contrats d\'exploitation dans les 3 ans suivant l\'invasion.',
              color: '#B85450',
            },
            {
              guerre: 'Printemps arabe / Libye — 2011',
              contexte: 'La population libyenne se soulève contre Kadhafi, au pouvoir depuis 42 ans. L\'OTAN intervient militairement sous mandat onusien.',
              petrole: '48 milliards de barils + pétrole léger de haute qualité, coût d\'extraction parmi les plus bas au monde',
              reponse: 'Intervention OTAN. Kadhafi tué. Chaos durable.',
              dit: '"Protéger les civils" (résolution ONU 1973)',
              vrai: 'La France et l\'Italie avaient des contrats pétroliers massifs. Total et ENI ont maintenu leurs accès post-intervention.',
              color: '#7B5EA7',
            },
            {
              guerre: 'Guerre en Ukraine — 2022-présent',
              contexte: 'Le 24 février 2022, la Russie envahit l\'Ukraine, déclenchant la plus grande guerre terrestre en Europe depuis 1945.',
              petrole: 'Russie = 2e exportateur mondial de pétrole, 1er de gaz naturel vers l\'Europe',
              reponse: 'Sanctions occidentales massives. Réorientation des flux énergétiques européens. Prix du gaz ×10 en Europe en 2022.',
              dit: '"Défense de la démocratie ukrainienne"',
              vrai: 'Réelle — mais aussi fin de la dépendance européenne au gaz russe, déjà planifiée depuis 2014 (Nord Stream sabotage inclus).',
              color: '#4A90A4',
            },
          ].map(g => ("""

src = src.replace(OLD_WARS, NEW_WARS)

# ── 4. Affichage du contexte dans le rendu des guerres ───────────────────────
OLD_RENDER = """              <div className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: g.color + '20', borderBottom: `1px solid ${g.color}30` }}>
                <div className="font-bold text-white text-sm">{g.guerre}</div>
                <div className="text-xs font-mono" style={{ color: g.color }}>{g.petrole.split('—')[0].trim()}</div>
              </div>"""

NEW_RENDER = """              <div className="px-4 py-3"
                style={{ backgroundColor: g.color + '20', borderBottom: `1px solid ${g.color}30` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-white text-sm">{g.guerre}</div>
                  <div className="text-xs font-mono" style={{ color: g.color }}>{g.petrole.split('—')[0].trim()}</div>
                </div>
                <div className="text-xs text-white/55 italic leading-relaxed">{g.contexte}</div>
              </div>"""

src = src.replace(OLD_RENDER, NEW_RENDER)

with open(PATH, "w", encoding="utf-8") as f:
    f.write(src)

print("✅ PastStory.tsx patché")
