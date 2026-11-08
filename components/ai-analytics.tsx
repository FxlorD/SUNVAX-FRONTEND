import {Activity,Boxes,Clock3,Database,ShieldAlert,Sparkles,Sun} from 'lucide-react';
import {PageHeading,Panel,PanelTitle} from './ui';

const planned=[
  {title:'Cold-chain risk forecasting',copy:'Use device history and excursion patterns to help teams spot storage risks earlier.',icon:ShieldAlert},
  {title:'Stock and expiry planning',copy:'Combine batch expiry, stock levels, and usage trends to support replenishment decisions.',icon:Boxes},
  {title:'Solar and battery planning',copy:'Compare solar generation, battery reserves, and power demand to flag possible energy gaps.',icon:Sun},
];

export function AiAnalytics(){return <>
  <PageHeading title="AI analytics" sub="Planned decision support for vaccine storage, inventory, and energy." action={<span className="inline-flex items-center gap-2 self-start rounded-full bg-[#fff6df] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#9d7411]"><Clock3 size={13}/> Underway</span>}/>
  <Panel className="mb-5 overflow-hidden border-[#dce9df] bg-gradient-to-br from-white to-[#f3f8f0]">
    <div className="flex flex-col gap-5 md:flex-row md:items-start"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf6e9] text-[#16803d]"><Sparkles size={22}/></div><div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#16803d]">In development</span><h2 className="mt-2 text-xl font-bold tracking-tight text-[#193654]">Analytics will run in the software platform.</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">The ESP32 should collect sensor readings and send them securely. A future backend can store device history and inventory records, then run analytics and return useful summaries to this dashboard. This keeps model updates and heavier processing out of the device and lets the platform use data from many units.</p></div></div>
    <div className="mt-6 grid gap-3 border-t border-[#e5ece5] pt-5 sm:grid-cols-3">{[['Device telemetry','Temperature · battery · solar'],['Stock records','Batch · quantity · expiry'],['Operational history','Facilities · alerts · service events']].map(([title,detail])=><div key={title} className="rounded-xl border border-[#e8edf1] bg-white/80 p-3"><b className="text-xs text-[#213751]">{title}</b><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">{detail}</span></div>)}</div>
  </Panel>
  <div className="mb-5 grid gap-4 lg:grid-cols-3">{planned.map(({title,copy,icon:Icon})=><Panel key={title} className="relative overflow-hidden"><div className="flex items-start justify-between gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf6e9] text-[#16803d]"><Icon size={19}/></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">Planned</span></div><h3 className="mt-4 text-sm font-bold text-[#213751]">{title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-500">{copy}</p></Panel>)}</div>
  <Panel><PanelTitle title="A sensible rollout" sub="Keep sensor collection reliable, then add analytics in stages."/><div className="grid gap-4 md:grid-cols-3">{[
    {n:'01',title:'Connect and validate data',text:'The ESP32 sends timestamped readings. The backend checks device identity, units, and missing or implausible values.',icon:Activity},
    {n:'02',title:'Build a useful history',text:'Store telemetry, alerts, stock movements, and expiry dates so reports have enough context.',icon:Database},
    {n:'03',title:'Add decision support',text:'Start with explainable rules and forecasts; evaluate AI models only after enough reliable data is available.',icon:Sparkles},
  ].map(({n,title,text,icon:Icon})=><div key={n} className="flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f3f6f8] text-[#47627e]"><Icon size={17}/></div><div><span className="text-[10px] font-bold text-[#16803d]">STEP {n}</span><h3 className="mt-1 text-xs font-bold text-[#213751]">{title}</h3><p className="mt-1 text-[11px] leading-relaxed text-slate-500">{text}</p></div></div>)}</div><p className="mt-5 rounded-lg bg-[#fff8e4] px-3 py-2.5 text-[10px] leading-relaxed text-[#8e6c15]">No AI model is connected yet. The cards above describe planned capabilities; they do not display predictions or AI-generated recommendations.</p></Panel>
</>}
