"""
weekly_market_update.py — Pipeline hebdomadaire robuste

Principes :
  - Chaque étape indépendante — un échec n'empêche pas les suivantes
  - Fallback FRED -> Yahoo Finance pour les prix
  - RSS : 8 sources tentées en cascade
  - Snapshot toujours créé même si tout échoue
  - Rapport final détaillé
"""
import sys, os, json, time, re
from datetime import date, timedelta
from decimal import Decimal
from typing import Optional

sys.path.append('/app')
import urllib.request, urllib.error
import xml.etree.ElementTree as ET

from app.database.connection import SessionLocal
from app.database.models import MarketEvent, MarketSnapshot, GasolinePrices

# ── Config ────────────────────────────────────────────────────────────────────
FRED_KEY = os.environ.get('FRED_API_KEY', '').strip()
if FRED_KEY in ('', 'REMPLACE_PAR_TA_CLE_FRED', 'ta_clé', 'ta_cle'):
    FRED_KEY = ''

CLAUDE_KEY = os.environ.get('ANTHROPIC_API_KEY', '').strip()
if CLAUDE_KEY in ('', 'REMPLACE_PAR_TA_CLE_ANTHROPIC', 'ta_clé', 'ta_cle'):
    CLAUDE_KEY = ''

TODAY = date.today()
WEEK_START = TODAY - timedelta(days=TODAY.weekday())
REPORT = {}

def log(m): print(f"  {m}")
def ok(k, d=''): REPORT[k]='ok'; print(f"  ✅ {k}" + (f" — {d}" if d else ''))
def warn(k, d=''): REPORT[k]='warn'; print(f"  ⚠️  {k}" + (f" — {d}" if d else ''))
def fail(k, d=''): REPORT[k]='fail'; print(f"  ❌ {k}" + (f" — {d}" if d else ''))
def hdr(t): print(f"\n{'='*60}\n  {t}\n{'='*60}\n")

def fetch(url, timeout=12):
    for i in range(2):
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0','Accept':'*/*'})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:
            if i == 0: time.sleep(2)
            else: log(f"   ✗ {url[:55]}: {type(e).__name__}")
    return None

# ── Étape 1 : Prix ────────────────────────────────────────────────────────────
def yahoo(symbol):
    for host in ['query1','query2']:
        data = fetch(f"https://{host}.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=5d", 10)
        if not data: continue
        try:
            closes = json.loads(data)['chart']['result'][0]['indicators']['quote'][0]['close']
            val = next((v for v in reversed(closes) if v), None)
            return round(val, 2) if val else None
        except: pass
    return None

def fred(series):
    if not FRED_KEY: return None
    data = fetch(f"https://api.stlouisfed.org/fred/series/observations?series_id={series}&api_key={FRED_KEY}&file_type=json&limit=5&sort_order=desc")
    if not data: return None
    try:
        obs = [o for o in json.loads(data).get('observations',[]) if o.get('value') not in ('.','')]
        return round(float(obs[0]['value']),2) if obs else None
    except: return None

def fetch_prices():
    hdr("ÉTAPE 1 — Prix bruts")
    brent = fred('DCOILBRENTEU') or yahoo('BZ=F')
    wti   = fred('DCOILWTICO')   or yahoo('CL=F')
    bdi   = fred('DBDIDXW')
    usd   = fred('DTWEXBGS')     or yahoo('DX-Y.NYB')
    nat   = yahoo('NG=F')

    # Variation semaine Brent
    chg = None
    if FRED_KEY:
        data = fetch(f"https://api.stlouisfed.org/fred/series/observations?series_id=DCOILBRENTEU&api_key={FRED_KEY}&file_type=json&limit=10&sort_order=desc")
        if data:
            try:
                obs = [float(o['value']) for o in json.loads(data).get('observations',[]) if o.get('value') not in ('.','')]
                if len(obs)>=6: chg = round((obs[0]-obs[5])/obs[5]*100,2)
            except: pass

    p = {'brent':brent,'wti':wti,'bdi':bdi,'usd_index':usd,'nat_gas':nat,'brent_change_1w':chg}
    sources = 'FRED' if FRED_KEY else 'Yahoo Finance'
    n = sum(1 for v in p.values() if v is not None)
    (ok if n>=2 else warn if n>=1 else fail)('prix', f"Brent={brent} WTI={wti} [{sources}]")
    return p

# ── Étape 2 : RSS ─────────────────────────────────────────────────────────────
RSS = [
    ('OilPrice',     'https://oilprice.com/rss/main'),
    ('Rigzone',      'https://www.rigzone.com/news/rss/rigzone_latest.aspx'),
    ('EnergyVoice',  'https://www.energyvoice.com/feed/'),
    ('AlJazeera',    'https://www.aljazeera.com/xml/rss/all.xml'),
    ('Reuters',      'https://feeds.reuters.com/reuters/businessNews'),
    ('RT Biz',       'https://www.rt.com/rss/business/'),
    ('OPEC',         'https://www.opec.org/opec_web/en/press_room/rss.xml'),
    ('EIA',          'https://www.eia.gov/rss/analysis.xml'),
]
KEYS = ['oil','brent','wti','opec','crude','barrel','energy','refinery','tanker',
        'hormuz','sanctions','gas','pipeline','lng','shale','iran','saudi','russia']

def parse_rss(xml):
    try: root = ET.fromstring(xml)
    except: return []
    items = []
    for item in root.findall('.//item')[:12]:
        t = item.findtext('title','').strip()
        d = re.sub(r'<[^>]+>','',item.findtext('description','')).strip()[:350]
        l = item.findtext('link','').strip()
        if t: items.append({'title':t,'description':d,'link':l})
    return items

def fetch_news():
    hdr("ÉTAPE 2 — Actualités RSS")
    articles, sources = [], []
    for name, url in RSS:
        data = fetch(url, 10)
        if not data: log(f"⚪ {name}: inaccessible"); continue
        relevant = [a for a in parse_rss(data) if any(k in (a['title']+a['description']).lower() for k in KEYS)]
        if relevant:
            articles.extend(relevant[:6]); sources.append(name)
            log(f"✅ {name}: {len(relevant)} articles")
        else: log(f"⚪ {name}: aucun article énergie")
        if len(articles) >= 18: break

    (ok if articles else fail)('rss', f"{len(articles)} articles depuis {len(sources)} sources")
    return articles, sources

# ── Étape 3 : Prix pompe ──────────────────────────────────────────────────────
EU_URLS = [
    "https://energy.ec.europa.eu/system/files/2025-05/weekly_oil_bulletin_data_271.csv",
    "https://energy.ec.europa.eu/system/files/2025-05/weekly_oil_bulletin_data_270.csv",
    "https://energy.ec.europa.eu/system/files/2025-04/weekly_oil_bulletin_data_269.csv",
    "https://energy.ec.europa.eu/system/files/2024-11/weekly_oil_bulletin_data_268.csv",
]
EU_NAMES = {'AT':'Autriche','BE':'Belgique','BG':'Bulgarie','CZ':'Rép. Tchèque','DE':'Allemagne',
            'DK':'Danemark','EE':'Estonie','ES':'Espagne','FI':'Finlande','FR':'France',
            'GR':'Grèce','HR':'Croatie','HU':'Hongrie','IE':'Irlande','IT':'Italie',
            'LT':'Lituanie','LU':'Luxembourg','LV':'Lettonie','NL':'Pays-Bas','PL':'Pologne',
            'PT':'Portugal','RO':'Roumanie','SE':'Suède','SI':'Slovénie','SK':'Slovaquie'}

def fetch_eu():
    log("Fetching EU Commission...")
    for url in EU_URLS:
        data = fetch(url, 15)
        if not data: continue
        prices = {}
        for line in data.decode('utf-8','ignore').strip().split('\n')[2:]:
            parts = [p.strip() for p in line.split(';')]
            if len(parts)<4: continue
            code = parts[0][:2].upper()
            if code not in EU_NAMES: continue
            try:
                g = float(parts[2].replace(',','.'))/1000
                d = float(parts[3].replace(',','.'))/1000
                if g>0.5:
                    prices[code]={'gasoline_usd':round(g*1.08,3),'diesel_usd':round(d*1.08,3),'name':EU_NAMES[code]}
            except: pass
        if len(prices)>=10:
            avg = sum(v['gasoline_usd'] for v in prices.values())/len(prices)
            log(f"✅ EU: {len(prices)} pays — moy. ${avg:.3f}/L")
            return {'countries':prices,'avg':round(avg,3)}
    warn('eu_prices','Toutes URLs en échec'); return {}

def fetch_usa_gas():
    data = fetch("https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=DEMO&frequency=weekly&data[0]=value&facets[product][]=EMM_EPMRR_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&length=1", 10)
    if data:
        try:
            val = json.loads(data)['response']['data'][0]['value']
            return round(float(val)*0.2642, 3)
        except: pass
    return None

def save_gasoline(eu, usa):
    if not eu and not usa: warn('prix_pompe','Aucune donnée'); return
    db = SessionLocal()
    try:
        n = 0
        for code, p in eu.get('countries',{}).items():
            ex = db.query(GasolinePrices).filter(GasolinePrices.country_code==code, GasolinePrices.date==TODAY).first()
            vals = dict(country_name=p['name'],region='europe',
                       gasoline_price_usd=Decimal(str(p['gasoline_usd'])),
                       diesel_price_usd=Decimal(str(p['diesel_usd'])),source='eu_commission')
            if ex:
                for k,v in vals.items(): setattr(ex,k,v)
            else: db.add(GasolinePrices(date=TODAY,country_code=code,**vals))
            n+=1
        if usa:
            ex = db.query(GasolinePrices).filter(GasolinePrices.country_code=='USA',GasolinePrices.date==TODAY).first()
            vals = dict(country_name='États-Unis',region='north_america',
                       gasoline_price_usd=Decimal(str(usa)),source='eia')
            if ex:
                for k,v in vals.items(): setattr(ex,k,v)
            else: db.add(GasolinePrices(date=TODAY,country_code='USA',**vals))
            n+=1
        db.commit(); ok('prix_pompe',f"{n} pays")
    except Exception as e: db.rollback(); fail('prix_pompe',str(e))
    finally: db.close()

# ── Étape 4 : Claude ──────────────────────────────────────────────────────────
def extract_claude(articles, prices):
    if not CLAUDE_KEY: warn('claude','Clé manquante'); return [],'',{}
    if not articles: warn('claude','Pas d\'articles'); return [],'',{}

    ctx = f"Brent={prices.get('brent')} WTI={prices.get('wti')}" if prices.get('brent') else ''
    arts = "\n\n".join(f"TITRE: {a['title']}\nRÉSUMÉ: {a['description'][:200]}" for a in articles[:12])

    prompt = f"""Analyste pétrolier senior. {ctx}

ARTICLES:
{arts}

JSON STRICT (sans markdown) :
{{"events":[{{"date":"YYYY-MM-DD","title":"100 chars max","summary":"200 chars max","event_type":"geopolitical|supply|demand|price|sanctions|conflict|policy","region":"Middle East|Europe|North America|Asia|Africa|Global|Russia|OPEC","impact":"high|medium|low","impact_direction":"bullish|bearish|neutral","estimated_price_impact":0.0}}],"macro_summary":"3 phrases","key_risk":"1 phrase","market_sentiment":"bullish|bearish|neutral","ormuz_status":"normal|elevated|critical|blocked"}}

3 à 6 événements."""

    try:
        payload = json.dumps({"model":"claude-sonnet-4-20250514","max_tokens":1200,"messages":[{"role":"user","content":prompt}]}).encode()
        req = urllib.request.Request("https://api.anthropic.com/v1/messages", data=payload,
            headers={"Content-Type":"application/json","x-api-key":CLAUDE_KEY,"anthropic-version":"2023-06-01"}, method="POST")
        with urllib.request.urlopen(req, timeout=90) as r:
            result = json.loads(r.read())

        text = ''.join(b.get('text','') for b in result.get('content',[]) if b.get('type')=='text')
        text = re.sub(r'^```[a-z]*\n?','',text.strip()); text = re.sub(r'\n?```$','',text)
        data = json.loads(text)
        evs = data.get('events',[])
        ok('claude',f"{len(evs)} événements · {data.get('market_sentiment')} · ormuz={data.get('ormuz_status')}")
        return evs, data.get('macro_summary',''), data
    except json.JSONDecodeError: fail('claude','JSON invalide'); return [],'',{}
    except Exception as e: fail('claude',f"{type(e).__name__}: {str(e)[:80]}"); return [],'',{}

# ── Étape 5 : Sauvegarde snapshot ─────────────────────────────────────────────
def save_snapshot(prices, eu, usa, events, summary, ai, sources):
    db = SessionLocal()
    try:
        ex = db.query(MarketSnapshot).filter(MarketSnapshot.week_start==WEEK_START).first()
        snap = ex or MarketSnapshot(week_start=WEEK_START)
        if not ex: db.add(snap)

        snap.brent_price      = Decimal(str(prices['brent'])) if prices.get('brent') else None
        snap.wti_price        = Decimal(str(prices['wti']))   if prices.get('wti')   else None
        snap.brent_change_1w  = Decimal(str(prices['brent_change_1w'])) if prices.get('brent_change_1w') else None
        snap.gasoline_usa     = Decimal(str(usa)) if usa else None
        snap.gasoline_eu_avg  = Decimal(str(eu.get('avg',0))) if eu.get('avg') else None
        snap.baltic_dry_index = Decimal(str(prices['bdi'])) if prices.get('bdi') else None
        snap.usd_index        = Decimal(str(prices['usd_index'])) if prices.get('usd_index') else None
        snap.regional_prices  = {c:{'gasoline_usd':p['gasoline_usd']} for c,p in eu.get('countries',{}).items()}
        snap.macro_indicators = {'market_sentiment':ai.get('market_sentiment','neutral'),
                                  'ormuz_status':ai.get('ormuz_status','normal'),
                                  'key_risk':ai.get('key_risk',''),'report':REPORT}
        snap.ai_summary       = summary or f"Pipeline partiel — {len(events)} événements collectés."
        snap.ai_key_events    = [e.get('title','') for e in events[:5]]
        snap.sources_fetched  = sources
        db.flush()

        n = 0
        for ev in events:
            try: ev_date = date.fromisoformat(ev.get('date',str(TODAY)))
            except: ev_date = TODAY
            if not db.query(MarketEvent).filter(MarketEvent.week_start==WEEK_START, MarketEvent.title==ev.get('title','')[:500]).first():
                try: impact = Decimal(str(float(ev.get('estimated_price_impact',0))))
                except: impact = Decimal('0')
                db.add(MarketEvent(event_date=ev_date,week_start=WEEK_START,
                    title=ev.get('title','')[:500],summary=ev.get('summary','')[:2000],
                    event_type=ev.get('event_type','geopolitical'),region=ev.get('region','Global'),
                    impact=ev.get('impact','medium'),impact_direction=ev.get('impact_direction','neutral'),
                    estimated_price_impact=impact,sources=[],raw_articles=[]))
                n+=1

        db.commit(); ok('sauvegarde',f"Snapshot {WEEK_START} · {n} événements")
    except Exception as e: db.rollback(); fail('sauvegarde',str(e)); raise
    finally: db.close()

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    t0 = time.time()
    print(f"\n{'█'*60}\n  PETROLEUM — PIPELINE HEBDOMADAIRE  {WEEK_START}")
    print(f"  FRED: {'✅' if FRED_KEY else '❌ manquante'}  Claude: {'✅' if CLAUDE_KEY else '❌ manquante'}")
    print('█'*60)

    prices            = fetch_prices()
    articles, sources = fetch_news()

    hdr("ÉTAPE 3 — Prix à la pompe")
    eu  = fetch_eu()
    usa = fetch_usa_gas()
    if usa: log(f"✅ USA: ${usa}/L")
    save_gasoline(eu, usa)

    hdr("ÉTAPE 4 — Analyse Claude")
    events, summary, ai = extract_claude(articles, prices)

    hdr("ÉTAPE 5 — Sauvegarde")
    save_snapshot(prices, eu, usa, events, summary, ai, sources)

    print(f"\n{'='*60}\n  RAPPORT — {time.time()-t0:.0f}s")
    all_ok = all(v=='ok' for v in REPORT.values())
    for k,v in REPORT.items():
        print(f"  {'✅' if v=='ok' else '⚠️ ' if v=='warn' else '❌'} {k}")
    print(f"\n  {'✅ COMPLET' if all_ok else '⚠️  PARTIEL'} — Dashboard mis à jour\n{'█'*60}\n")

if __name__ == "__main__":
    main()
