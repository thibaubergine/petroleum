"""
Patch Landing + App :
1. Texte prométhéen Landing
2. Titre App.tsx dashboard
3. Flaque arc-en-ciel plus intense
4. Header dashboard plus grand
"""

BASE = r"C:\Users\cenom\Documents\Petroleum\V0\oil-dashboard\frontend\src"

def load(f):
    with open(f"{BASE}\\{f}", encoding="utf-8-sig") as fh: return fh.read()
def save(f, s):
    with open(f"{BASE}\\{f}", "w", encoding="utf-8") as fh: fh.write(s)
def apply(src, old, new, label):
    if new[:30] in src: print(f"  ⏭  {label}"); return src
    if old in src: print(f"  ✅ {label}"); return src.replace(old, new)
    print(f"  ❌ {label}"); return src

# ── App.tsx ───────────────────────────────────────────────────────────────────
print("\n═══ App.tsx ═══")
src = load("App.tsx")

src = apply(src,
    "Le feu souterrain — anatomie d'une énergie prométhéenne",
    "Le feu souterrain — une énergie prométhéenne",
    "Titre dashboard")

src = apply(src,
    "style={{ height: '140px' }}",
    "style={{ height: '200px' }}",
    "Header dashboard 200px")

save("App.tsx", src)

# ── Landing.tsx ───────────────────────────────────────────────────────────────
print("\n═══ Landing.tsx ═══")
src = load("pages/narrative/Landing.tsx")

# Sous-titre
src = apply(src,
    "Le feu souterrain — anatomie d'une énergie prométhéenne",
    "Le feu souterrain — une énergie prométhéenne",
    "Sous-titre Landing")

# Texte intro
src = apply(src,
    "Prométhée offrit aux hommes le feu des dieux — et paya ce don de sa liberté pour l'éternité.\n            Il est de bon ton de faire une analogie pompeuse avec une référence mythologique ou biblique,\n            celle-ci me semble idéale.",
    "Prométhée offrit aux hommes le feu, il paya ce don de sa liberté pour l'éternité.\n            Il est de bon ton de faire une analogie pompeuse avec une référence mythologique ou biblique,\n            celle-ci fonctionne.",
    "Intro prométhéenne")

# Flaque arc-en-ciel améliorée
OLD_FLAQUE = """          <svg viewBox="0 0 480 280" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
            <defs>
              {/* Gradient irisé principal */}
              <radialGradient id="flaque-iris" cx="45%" cy="50%" r="55%">
                <stop offset="0%"   stopColor="#9B59B6" stopOpacity="0.35" />
                <stop offset="18%"  stopColor="#3498DB" stopOpacity="0.28" />
                <stop offset="35%"  stopColor="#1ABC9C" stopOpacity="0.22" />
                <stop offset="52%"  stopColor="#C17F24" stopOpacity="0.30" />
                <stop offset="70%"  stopColor="#B85450" stopOpacity="0.20" />
                <stop offset="85%"  stopColor="#9B59B6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              {/* Reflet brillant */}
              <radialGradient id="flaque-shine" cx="40%" cy="45%" r="30%">
                <stop offset="0%"   stopColor="white" stopOpacity="0.12" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              {/* Bord foncé de la flaque */}
              <radialGradient id="flaque-dark" cx="50%" cy="50%" r="50%">
                <stop offset="60%"  stopColor="#0a0a0a" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
              </radialGradient>
              <filter id="blur-flaque">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>
            {/* Corps sombre de la flaque */}
            <ellipse cx="220" cy="160" rx="200" ry="90"
              fill="url(#flaque-dark)" filter="url(#blur-flaque)" />
            {/* Couleurs irisées */}
            <ellipse cx="215" cy="155" rx="195" ry="85"
              fill="url(#flaque-iris)" filter="url(#blur-flaque)" />
            {/* Reflet central */}
            <ellipse cx="200" cy="145" rx="120" ry="50"
              fill="url(#flaque-shine)" filter="url(#blur-flaque)" />
          </svg>"""

NEW_FLAQUE = """          <svg viewBox="0 0 480 280" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
            <defs>
              <filter id="fb1"><feGaussianBlur stdDeviation="7"/></filter>
              <filter id="fb2"><feGaussianBlur stdDeviation="4"/></filter>
              <filter id="fb3"><feGaussianBlur stdDeviation="14"/></filter>
              <radialGradient id="g-dark" cx="50%" cy="55%" r="52%">
                <stop offset="0%"   stopColor="#020202" stopOpacity="0.95"/>
                <stop offset="65%"  stopColor="#060606" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="g-shine" cx="36%" cy="36%" r="30%">
                <stop offset="0%"   stopColor="white" stopOpacity="0.35"/>
                <stop offset="60%"  stopColor="white" stopOpacity="0.08"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </radialGradient>
            </defs>
            {/* Base sombre */}
            <ellipse cx="220" cy="158" rx="208" ry="94" fill="url(#g-dark)" filter="url(#fb3)"/>
            {/* Bandes arc-en-ciel — extérieur vers intérieur */}
            <ellipse cx="192" cy="153" rx="188" ry="82" fill="#7700CC" fillOpacity="0.38" filter="url(#fb1)"/>
            <ellipse cx="202" cy="151" rx="174" ry="76" fill="#0033FF" fillOpacity="0.32" filter="url(#fb1)"/>
            <ellipse cx="212" cy="149" rx="159" ry="70" fill="#00AAFF" fillOpacity="0.38" filter="url(#fb2)"/>
            <ellipse cx="220" cy="147" rx="143" ry="63" fill="#00FF99" fillOpacity="0.30" filter="url(#fb2)"/>
            <ellipse cx="225" cy="146" rx="126" ry="55" fill="#CCFF00" fillOpacity="0.32" filter="url(#fb2)"/>
            <ellipse cx="228" cy="145" rx="108" ry="47" fill="#FF9900" fillOpacity="0.38" filter="url(#fb2)"/>
            <ellipse cx="228" cy="144" rx="88"  ry="38" fill="#FF3300" fillOpacity="0.32" filter="url(#fb2)"/>
            <ellipse cx="225" cy="143" rx="68"  ry="29" fill="#FF0055" fillOpacity="0.28" filter="url(#fb2)"/>
            {/* Cœur sombre */}
            <ellipse cx="222" cy="145" rx="48"  ry="20" fill="#030303" fillOpacity="0.85" filter="url(#fb2)"/>
            {/* Reflet spéculaire */}
            <ellipse cx="185" cy="133" rx="100" ry="40" fill="url(#g-shine)" filter="url(#fb2)"/>
          </svg>"""

src = apply(src, OLD_FLAQUE, NEW_FLAQUE, "Flaque arc-en-ciel améliorée")

save("pages/narrative/Landing.tsx", src)

print("\n✅ Terminé\n")
