'use client';
import {useMemo,useState,type FormEvent} from 'react';
import {AlertTriangle,ArrowDownUp,Boxes,CalendarClock,PackagePlus,Plus,Search,X} from 'lucide-react';
import {addInventoryLot,getDevices,getInventory} from '@/lib/data-service';
import type {InventoryLot} from '@/lib/types';
import {Metric,PageHeading,Panel,PanelTitle} from './ui';

type Filter='all'|'expired'|'expiring'|'low'|'in-stock';
type SortKey='product'|'quantity'|'expiryDate';
type Draft={product:string;batch:string;site:string;quantity:string;reorderLevel:string;expiryDate:string};
const emptyDraft:Draft={product:'',batch:'',site:'',quantity:'',reorderLevel:'',expiryDate:''};
const today=()=>new Date().toISOString().slice(0,10);
function daysUntil(date:string){return Math.ceil((new Date(`${date}T23:59:59`).getTime()-Date.now())/86400000)}
function lotState(lot:InventoryLot){const days=daysUntil(lot.expiryDate);if(days<0)return 'expired';if(days<=30)return 'expiring';if(lot.quantity<=lot.reorderLevel)return 'low';return 'in-stock'}
const labels:Record<Filter,string>={all:'All stock',expired:'Expired',expiring:'Expiring within 30 days',low:'Below reorder level','in-stock':'In stock'};

export function Inventory(){
  const [lots,setLots]=useState<InventoryLot[]>(()=>getInventory().map(l=>({...l})));
  const [filter,setFilter]=useState<Filter>('all');
  const [query,setQuery]=useState('');
  const [sortKey,setSortKey]=useState<SortKey>('expiryDate');
  const [ascending,setAscending]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [draft,setDraft]=useState<Draft>(emptyDraft);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const sites=[...new Set(getDevices().map(d=>d.site))];
  const counts={expired:lots.filter(l=>lotState(l)==='expired').length,expiring:lots.filter(l=>lotState(l)==='expiring').length,low:lots.filter(l=>lotState(l)==='low').length};
  const totalDoses=lots.filter(l=>lotState(l)!=='expired').reduce((sum,l)=>sum+l.quantity,0);
  const visible=useMemo(()=>lots.filter(l=>{
    const matchesFilter=filter==='all'||(filter==='expired'?lotState(l)==='expired':filter==='expiring'?lotState(l)==='expiring':filter==='low'?lotState(l)==='low':lotState(l)==='in-stock');
    const matchesQuery=`${l.product} ${l.batch} ${l.site}`.toLowerCase().includes(query.toLowerCase());
    return matchesFilter&&matchesQuery;
  }).sort((a,b)=>{
    const result=sortKey==='quantity'?a.quantity-b.quantity:sortKey==='expiryDate'?a.expiryDate.localeCompare(b.expiryDate):a.product.localeCompare(b.product);
    return ascending?result:-result;
  }),[lots,filter,query,sortKey,ascending]);
  function toggleSort(key:SortKey){if(key===sortKey)setAscending(!ascending);else{setSortKey(key);setAscending(true)}}
  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError('');
    const quantity=Number(draft.quantity),reorderLevel=Number(draft.reorderLevel);
    if(!draft.product.trim()||!draft.batch.trim()||!draft.site||!draft.expiryDate||!Number.isInteger(quantity)||quantity<1||!Number.isInteger(reorderLevel)||reorderLevel<0){setError('Enter a product, batch, facility, valid whole-number quantities, and an expiry date.');return}
    if(draft.expiryDate<=today()){setError('For this demo, new stock must have a future expiry date.');return}
    const next=addInventoryLot({product:draft.product.trim(),batch:draft.batch.trim(),site:draft.site,quantity,reorderLevel,unit:'doses',expiryDate:draft.expiryDate});
    setLots(current=>[next,...current]);setDraft(emptyDraft);setShowForm(false);setNotice('Stock lot added to demo inventory.');
  }
  return <>
    <PageHeading title="Inventory & expiry" sub="Track vaccine stock by batch, facility, and expiry date." action={<button onClick={()=>{setShowForm(!showForm);setError('')}} className="inline-flex items-center gap-2 rounded-lg bg-[#16803d] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#126b33]">{showForm?<X size={14}/>:<Plus size={14}/>} {showForm?'Close form':'Record stock'}</button>}/>
    <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4"><Metric label="Available stock" value={totalDoses.toLocaleString()} unit="doses" icon={Boxes} color="green"/><Metric label="Low-stock lots" value={counts.low} icon={PackagePlus} color={counts.low?'yellow':'green'}/><Metric label="Expiring soon" value={counts.expiring} unit="within 30 days" icon={CalendarClock} color={counts.expiring?'yellow':'green'}/><Metric label="Expired lots" value={counts.expired} icon={AlertTriangle} color={counts.expired?'red':'green'}/></div>
    {notice&&<div role="status" className="mb-4 rounded-lg bg-[#edf6e9] px-4 py-2.5 text-xs font-medium text-[#16803d]">{notice}</div>}
    {showForm&&<Panel className="mb-5"><PanelTitle title="Record a stock lot" sub="Add a batch to this browser-only demo inventory."/><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <label className="text-xs font-medium text-slate-600">Product<input required value={draft.product} onChange={e=>setDraft({...draft,product:e.target.value})} placeholder="e.g. Measles vaccine" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#16803d]"/></label>
      <label className="text-xs font-medium text-slate-600">Batch number<input required value={draft.batch} onChange={e=>setDraft({...draft,batch:e.target.value})} placeholder="e.g. MEAS-NG-2701" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#16803d]"/></label>
      <label className="text-xs font-medium text-slate-600">Facility<select required value={draft.site} onChange={e=>setDraft({...draft,site:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Choose a facility</option>{sites.map(site=><option key={site}>{site}</option>)}</select></label>
      <label className="text-xs font-medium text-slate-600">Quantity (doses)<input required type="number" min="1" step="1" value={draft.quantity} onChange={e=>setDraft({...draft,quantity:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#16803d]"/></label>
      <label className="text-xs font-medium text-slate-600">Reorder threshold<input required type="number" min="0" step="1" value={draft.reorderLevel} onChange={e=>setDraft({...draft,reorderLevel:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#16803d]"/></label>
      <label className="text-xs font-medium text-slate-600">Expiry date<input required type="date" min={today()} value={draft.expiryDate} onChange={e=>setDraft({...draft,expiryDate:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#16803d]"/></label>
      {error&&<p role="alert" className="text-xs text-red-600 sm:col-span-2 xl:col-span-3">{error}</p>}<div className="flex justify-end sm:col-span-2 xl:col-span-3"><button type="submit" className="rounded-lg bg-[#16803d] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#126b33]">Add demo stock</button></div>
    </form></Panel>}
    <Panel><PanelTitle title="Vaccine stock lots" sub="Sample records for the Nigeria demonstration network."/>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search size={15} className="absolute left-3 top-2.5 text-slate-400"/><input aria-label="Search stock" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search product, batch, or facility" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-[#16803d]"/></label><select aria-label="Filter stock status" value={filter} onChange={e=>setFilter(e.target.value as Filter)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400"><th className="pb-3 font-semibold"><button onClick={()=>toggleSort('product')} className="inline-flex items-center gap-1">Product & batch <ArrowDownUp size={11}/></button></th><th className="pb-3 font-semibold">Facility</th><th className="pb-3 font-semibold"><button onClick={()=>toggleSort('quantity')} className="inline-flex items-center gap-1">Stock <ArrowDownUp size={11}/></button></th><th className="pb-3 font-semibold">Reorder at</th><th className="pb-3 font-semibold"><button onClick={()=>toggleSort('expiryDate')} className="inline-flex items-center gap-1">Expiry <ArrowDownUp size={11}/></button></th><th className="pb-3 font-semibold">Status</th></tr></thead><tbody>{visible.map(lot=>{const state=lotState(lot),days=daysUntil(lot.expiryDate);const status=state==='expired'?'Expired':state==='expiring'?'Expiring soon':state==='low'?'Low stock':'In stock';return <tr key={lot.id} className="border-b border-slate-50 text-xs"><td className="py-3"><b className="text-[#203a58]">{lot.product}</b><span className="mt-1 block text-[10px] text-slate-400">{lot.batch}</span></td><td className="text-slate-500">{lot.site}</td><td className="font-semibold">{lot.quantity.toLocaleString()} {lot.unit}</td><td className="text-slate-500">{lot.reorderLevel.toLocaleString()} doses</td><td><span className="font-medium">{new Date(`${lot.expiryDate}T12:00:00`).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</span><span className="mt-1 block text-[10px] text-slate-400">{days<0?`${Math.abs(days)} days past expiry`:days===0?'Expires today':`${days} days left`}</span></td><td><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${state==='expired'?'bg-[#ffebe7] text-[#ca4d3d]':state==='expiring'||state==='low'?'bg-[#fff4db] text-[#a57608]':'bg-[#edf6e9] text-[#16803d]'}`}>{status}</span></td></tr>})}</tbody></table></div>
      {visible.length===0&&<div className="py-12 text-center"><Boxes className="mx-auto mb-2 text-slate-300" size={24}/><p className="text-sm font-semibold text-slate-600">No stock lots match</p><p className="mt-1 text-xs text-slate-400">Try another filter or search term.</p></div>}
      <p className="mt-4 rounded-lg bg-[#fff8e4] px-3 py-2.5 text-[10px] leading-relaxed text-[#8e6c15]">DEMO INVENTORY · Quantities and expiry dates are sample data only. Stock changes stay in this browser session and are not synced to a backend.</p>
    </Panel>
  </>;
}
