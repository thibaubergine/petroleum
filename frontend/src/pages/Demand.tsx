import { useState } from 'react';
import { usePeakOilAnalysis } from '@/hooks/useDemand';
import { useRegionalDemand } from '@/hooks/useHistorical';
import RegionalDemandChart from '@/components/charts/RegionalDemandChart';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';

function Section({ title, subtitle, children, defaultOpen = true }: {
  title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-oil-sand-dark">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-oil-sand-light/50 transition rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-oil-slate">{title}</h2>
          {subtitle && <p className="text-xs text-oil-slate/50 mt-0.5">{subtitle}</p>}
        </div>
        {open ? <ChevronUp size={18} className="text-oil-slate/40" /> : <ChevronDown size={18} className="text-oil-slate/40" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

const SCENARIOS = [
  { name: 'OPEC Reference',    source:'OPEC', peak:'Aucun', val2050:'~116 mb/d', decline:'Croissance', color:'border-l-red-500',    lineColor:'#B85450', credibility:0.21, desc:'Croissance portee par les emergents. Transition tres lente.', brief:'Croissance perpetuelle, pas de pic' },
  { name: 'EIA High Growth',   source:'EIA',  peak:'Aucun', val2050:'~120 mb/d', decline:'Aucun',      color:'border-l-red-400',    lineColor:'#D4813A', credibility:0.73, desc:'Forte croissance mondiale, faible adoption VE. Scenario extreme EIA.', brief:'Croissance forte, energie abondante' },
  { name: 'EIA Reference',     source:'EIA',  peak:'~2045', val2050:'~110 mb/d', decline:'Tres lent',  color:'border-l-amber-500',  lineColor:'#C17F24', credibility:0.73, desc:'Prolongation tendances actuelles. Scenario le plus neutre.', brief:'Prolongation tendances, peak tres tardif' },
  { name: 'EIA Low Growth',    source:'EIA',  peak:'~2035', val2050:'~100 mb/d', decline:'-2%/an',     color:'border-l-amber-400',  lineColor:'#A0522D', credibility:0.73, desc:'Efficacite renforcee, croissance moderee. Electrification progressive.', brief:'Efficacite + moderation, peak modere' },
  { name: 'IEA STEPS',         source:'IEA',  peak:'~2030', val2050:'~85 mb/d',  decline:'-1.5%/an',  color:'border-l-blue-600',   lineColor:'#2C3E50', credibility:0.61, desc:'Politiques actuelles maintenues. Scenario realiste IEA.', brief:'Politiques actuelles - peak proche' },
  { name: 'IEA APS',           source:'IEA',  peak:'~2026', val2050:'~55 mb/d',  decline:'-3.5%/an',  color:'border-l-blue-400',   lineColor:'#4A90A4', credibility:0.61, desc:'Tous engagements net zero tenus a temps.', brief:'Tous pledges tenus' },
  { name: 'IEA Net Zero 2050', source:'IEA',  peak:'2025',  val2050:'~24 mb/d',  decline:'-8.5%/an',  color:'border-l-green-600',  lineColor:'#2E7D6B', credibility:0.61, desc:'Normatif 1.5°C. Aucun nouveau projet apres 2021.', brief:'Normatif 1.5°C - declin radical' },
  { name: 'Shell Sky 1.5',     source:'Shell',peak:'~2027', val2050:'~30 mb/d',  decline:'-7.5%/an',  color:'border-l-green-400',  lineColor:'#6B8E6B', credibility:0.45, desc:'Scenario Shell compatible 1.5°C. Plus pragmatique que NZE.', brief:'Vision petrolier majeur compat. 1.5°C' },
];

const startVal = 102;
const profiles: Record<string, (y: number) => number> = {
  'OPEC Reference':    y => startVal + (y - 2024) * 0.55,
  'EIA High Growth':   y => startVal + (y - 2024) * 0.70,
  'EIA Reference':     y => startVal + (y - 2024) * 0.30,
  'EIA Low Growth':    y => y <= 2035 ? startVal : startVal - (y - 2035) * 1.0,
  'IEA STEPS':         y => y <= 2030 ? startVal + (y-2024)*0.2 : startVal+1.2-(y-2030)*1.2,
  'IEA APS':           y => y <= 2026 ? startVal+(y-2024)*0.5 : Math.max(55,startVal+1.0-(y-2026)*2.5),
  'IEA Net Zero 2050': y => Math.max(24, startVal-(y-2024)*3.1),
  'Shell Sky 1.5':     y => y <= 2027 ? startVal+(y-2024)*0.3 : Math.max(30,startVal+0.9-(y-2027)*2.8),
};

const PROJ_DATA = Array.from({length:27},(_,i)=>2024+i).map(y => {
  const pt: any = { year: y };
  SCENARIOS.forEach(s => { pt[s.name] = Math.max(20, profiles[s.name]?.(y) ?? 100); });
  const vals = SCENARIOS.map(s => pt[s.name]);
  pt._min = Math.min(...vals);
  pt._max = Math.max(...vals);
  return pt;
});

export default function Demand() {
  const { data: peakData } = usePeakOilAnalysis();
  const { data: regionalData, isLoading: regionalLoading } = useRegionalDemand({ start_year: 1965, end_year: 2023 });
  const [visible, setVisible] = useState<Set<string>>(new Set(SCENARIOS.map(s => s.name)));
  const toggle = (n: string) => setVisible(prev => { const nx = new Set(prev); nx.has(n) ? nx.delete(n) : nx.add(n); return nx; });

  return (
    <div className="min-h-screen bg-oil-sand-light">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        <Section title="Peak oil demand - de quoi parle-t-on ?">
          <div className="space-y-3 text-sm text-oil-slate leading-relaxed">
            <p>Le <strong>peak oil demand</strong> designe le point maximal de la consommation mondiale, apres lequel elle decline structurellement. Concept distinct du <strong>peak oil supply</strong> (limite geologique) qui dominait avant 2010.</p>
            <p className="text-xs p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 leading-relaxed">
              <strong>Sur le peak supply :</strong> les limites geologiques sont aujourd'hui secondaires face aux enjeux strategiques. Les chiffres de reserves sont manipules (OPEC 1980s, Venezuela, Iran), les donnees russes post-2022 sont opaques, et les Etats ont interet a ne pas divulguer leurs contraintes reelles. Le peak de production est analyse dans l'onglet Production.
            </p>
            <p>L'ecart de <strong className="text-oil-rust">~96 mb/d en 2050</strong> entre EIA High Growth (120) et IEA NZE (24) signifie que la grande majorite de ces projections sera fausse. Sources et scores detail dans l'onglet Sources.</p>
          </div>
        </Section>

        <Section title="8 scenarios de projection 2024-2050">
          <div className="space-y-2">
            {SCENARIOS.map(s => (
              <div key={s.name} className={"border-l-4 "+s.color+" bg-oil-sand-light rounded-r-lg px-4 py-2.5"}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor:s.lineColor}}/>
                    <span className="font-bold text-sm text-oil-slate">{s.name}</span>
                    <span className="text-xs text-oil-slate/40">— {s.brief}</span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-oil-slate/50">Source: <span className="font-semibold text-oil-slate">{s.source}</span></span>
                    <span className="text-oil-slate/50">Peak: <span className="font-semibold text-oil-rust">{s.peak}</span></span>
                    <span className="text-oil-slate/50">2050: <span className="font-semibold">{s.val2050}</span></span>
                    <span className={"font-bold px-1.5 py-0.5 rounded text-xs "+(s.credibility>=0.6?'bg-green-100 text-green-800':s.credibility>=0.4?'bg-amber-100 text-amber-800':'bg-red-100 text-red-800')}>TVA {(s.credibility*100).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-xs text-oil-slate/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Projections 2024-2050 — Vue comparee" subtitle="Zone rouge = enveloppe incertitude min/max · Courbes epaisses differenciees">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {SCENARIOS.map(s => {
              const active = visible.has(s.name);
              return (
                <button key={s.name} onClick={() => toggle(s.name)}
                  className={"px-2.5 py-1 rounded text-xs font-semibold border transition "+(active?'text-white border-transparent':'bg-white text-oil-slate/50 border-oil-sand-dark')}
                  style={active?{backgroundColor:s.lineColor,borderColor:s.lineColor}:{}}>
                  {s.source} {s.name.replace(s.source+' ','').split(' ').slice(0,2).join(' ')}
                </button>
              );
            })}
          </div>
          <ResponsiveContainer width="100%" height={480}>
            <ComposedChart data={PROJ_DATA} margin={{top:10,right:30,left:10,bottom:50}}>
              <CartesianGrid {...GRID_STYLE}/>
              <XAxis dataKey="year" {...AXIS_STYLE} label={{value:'Annee',position:'insideBottom',offset:-15,fill:'#2C3E50',fontSize:12}}/>
              <YAxis {...AXIS_STYLE} domain={[15,130]} label={{value:'mb/d',angle:-90,position:'insideLeft',fill:'#2C3E50',fontSize:12}}/>
              <Tooltip contentStyle={{backgroundColor:'#FFFAF4',border:'1px solid #D4C7B3',borderRadius:'8px',fontSize:11}}
                formatter={(v:number,n:string)=>n.startsWith('_')?[null,''] as any:[`${v.toFixed(1)} mb/d`,n]}/>
              <Legend wrapperStyle={{paddingTop:20,fontSize:10}} formatter={v=>v.startsWith('_')?null:v}/>
              <Area dataKey="_max" stroke="none" fill="#B85450" fillOpacity={0.07} name="_max" legendType="none"/>
              <Area dataKey="_min" stroke="none" fill="#FFFAF4" fillOpacity={1} name="_min" legendType="none"/>
              <ReferenceLine y={100} stroke="#2C3E50" strokeDasharray="4 3" opacity={0.2} label={{value:'100 mb/d',fill:'#2C3E50',fontSize:9,position:'right'}}/>
              {SCENARIOS.map(s=>{
                if(!visible.has(s.name)) return null;
                const isDash = s.source==='Shell'||s.name.includes('High')||s.name.includes('Net Zero');
                return <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.lineColor} strokeWidth={2.5} strokeDasharray={isDash?'6 3':undefined} dot={false} activeDot={{r:5,fill:s.lineColor}} name={s.name}/>;
              })}
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-oil-slate/50">
            <span>Trait plein = scenario principal</span>
            <span>Tirets = variante/normatif</span>
            <span>Zone rouge = enveloppe incertitude</span>
          </div>
        </Section>

        <Section title="Synthese peaks par scenario">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-oil-sand-dark">
                {['Scenario','En quoi ca consiste','Peak','2050','Declin/an'].map(h=>(
                  <th key={h} className="text-left py-2 pr-3 text-oil-slate/60 font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map(s=>(
                <tr key={s.name} className="border-b border-oil-sand-dark/40 hover:bg-oil-sand-light/50">
                  <td className="py-1.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor:s.lineColor}}/>
                      <div>
                        <div className="font-bold text-oil-slate text-xs">{s.name}</div>
                        <div className="text-oil-slate/40" style={{fontSize:9}}>{s.source}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-1.5 pr-3 text-oil-slate/60 leading-relaxed">{s.brief}</td>
                  <td className="py-1.5 pr-3">
                    {s.peak==='Aucun'?<span className="text-green-700 font-semibold">Aucun</span>:<span className="text-oil-rust font-bold">{s.peak}</span>}
                  </td>
                  <td className="py-1.5 pr-3 font-mono text-oil-slate">{s.val2050}</td>
                  <td className="py-1.5 font-mono">{s.decline.startsWith('-')?<span className="text-oil-rust">{s.decline}</span>:<span className="text-green-600">+</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Demande par region 1965-2023">
          {regionalLoading?<div className="h-48 flex items-center justify-center text-oil-slate/50">Chargement...</div>
          :regionalData&&regionalData.length>0?<RegionalDemandChart data={regionalData}/>
          :<div className="h-48 flex flex-col items-center justify-center text-oil-slate/50 gap-2">
            <AlertCircle size={24} className="text-oil-rust/50"/>
            <p className="text-sm">Donnees non importees</p>
            <code className="text-xs bg-oil-sand px-2 py-1 rounded">docker exec oil-backend python scripts/import_regional_demand.py</code>
          </div>}
        </Section>

      </div>
    </div>
  );
}
