'use client';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname,useRouter} from 'next/navigation';
import {Activity,Sun,Monitor,TriangleAlert,ChartNoAxesCombined,Users,Settings,LayoutDashboard,Bell,Menu,X,Leaf,MapPinned,Boxes,Sparkles,ShoppingCart,Truck,Building2,CalendarClock,Cloud,LogOut} from 'lucide-react';
import {useEffect,useState} from 'react';
import {currentUser,signOut as supabaseSignOut} from '../lib/supabase-auth';

type NavItem={label:string;href:string;icon:typeof Activity;badge?:string;tag?:string};
type NavGroup={title:string;items:NavItem[];icon?:typeof Cloud;href?:string;badge?:string};
const groups:NavGroup[]=[
  {title:'COLD-CHAIN MONITORING · SUNVAX DEVICE',items:[
    {label:'Temperature',href:'/temperature',icon:Activity},{label:'Solar & Energy',href:'/energy',icon:Sun},{label:'Device Location (GPS)',href:'/locations',icon:MapPinned},{label:'Alerts',href:'/alerts',icon:TriangleAlert,badge:'2'},{label:'Devices',href:'/devices',icon:Monitor},
  ]},
  {title:'SUPPLY CHAIN · ALL FACILITIES',icon:Cloud,href:'/supply-chain',badge:'No device required',items:[
    {label:'Vaccine Marketplace & Orders',href:'/marketplace',icon:ShoppingCart,tag:'New'},{label:'Inventory & Stock',href:'/inventory',icon:Boxes},{label:'Distribution & Deliveries',href:'/distribution',icon:Truck},{label:'Facilities & Network',href:'/facilities',icon:Building2},{label:'Stock & Expiry Management',href:'/expiry',icon:CalendarClock},
  ]},
  {title:'INTELLIGENCE',items:[{label:'AI Demand Forecasting',href:'/analytics',icon:Sparkles,tag:'New'},{label:'Reports & Analytics',href:'/reports',icon:ChartNoAxesCombined}]},
  {title:'SYSTEM MANAGEMENT',items:[{label:'Users & Roles',href:'/users',icon:Users},{label:'Settings',href:'/settings',icon:Settings}]},
];
type Account={name:string;email:string;organization:string};
export function AppShell({children}:{children:React.ReactNode}){
  const path=usePathname();const router=useRouter();const [open,setOpen]=useState(false);const [account,setAccount]=useState<Account|null>(null);const [ready,setReady]=useState(false);
  useEffect(()=>{let active=true;currentUser().then(user=>{if(!active)return;const profile=user?{name:user.user_metadata?.full_name||user.email||'SUNVAX User',email:user.email||'',organization:user.user_metadata?.organization||'SUNVAX'}:null;setAccount(profile);setReady(true);if(!profile)router.replace('/signup')});return()=>{active=false}},[router]);
  const active=groups.flatMap(group=>group.items).find(item=>item.href===path)?.label??(path==='/supply-chain'?'Supply Chain':'Overview');
  const signOut=async()=>{await supabaseSignOut().catch(()=>{});setAccount(null);router.replace('/signup')};
  if(!ready||!account)return <div className="grid min-h-screen place-items-center bg-[#f5f7f9]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#16803d] border-t-transparent"/></div>;
  const linkClass=(href:string)=>`flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium transition ${path===href?'bg-white text-[#15385c] shadow-sm':'text-white/75 hover:bg-white/10 hover:text-white'}`;
  return <div className="min-h-screen bg-[#f5f7f9] text-[#1d2b3d]">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[292px] flex-col bg-[#132b4a] text-white transition-transform lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5"><Link href="/" className="min-w-0 flex-1"><div className="inline-flex max-w-full items-center rounded-lg bg-white px-2 py-1"><Image src="/sunvax-logo.jpg" alt="SUNVAX cold-chain logo" width={1536} height={512} priority className="h-[42px] w-auto max-w-full object-contain"/></div></Link><button className="ml-2 shrink-0 lg:hidden" onClick={()=>setOpen(false)} aria-label="Close menu"><X/></button></div>
      <div className="mx-4 mt-3 shrink-0 rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-2 text-[10px] font-bold tracking-[.1em] text-yellow-300"><span className="h-2 w-2 rounded-full bg-yellow-300"/> NIGERIA · WEST AFRICA</div><div className="mt-1 text-[11px] text-white/65">Cold-chain and supply network</div></div>
      <nav className="mt-3 flex-1 space-y-2 overflow-y-auto px-3 pb-3 scrollbar-hide">
        <Link href="/" onClick={()=>setOpen(false)} className={linkClass('/')}><LayoutDashboard size={16}/>Overview</Link>
        {groups.map(group=>{const GroupIcon=group.icon??Cloud;return <section key={group.title} className="border-t border-white/15 pt-2">
          {group.href?<Link href={group.href} onClick={()=>setOpen(false)} className="mb-1 flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-bold tracking-wide text-white/90 hover:bg-white/10"><GroupIcon size={15}/><span className="min-w-0 flex-1">Supply Chain <span className="font-normal text-white/60">(For All Facilities)</span></span><span className="rounded-full bg-[#16803d] px-2 py-0.5 text-[8px] normal-case tracking-normal">No device required</span></Link>:<h2 className="mb-1 px-2 py-1.5 text-[9px] font-bold tracking-[.09em] text-white/55">{group.title}</h2>}
          {group.items.map(({label,href,icon:Icon,badge,tag})=><Link key={href} href={href} onClick={()=>setOpen(false)} className={linkClass(href)}><Icon size={16}/><span className="min-w-0 flex-1 truncate">{label}</span>{badge&&<span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#e85d4a] px-1 text-[9px] text-white">{badge}</span>}{tag&&<span className="rounded-full bg-[#16803d] px-1.5 py-0.5 text-[8px] font-bold uppercase">{tag}</span>}</Link>)}
        </section>})}
      </nav>
      <div className="m-3 shrink-0 rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-2 text-[11px] font-semibold"><Leaf size={14} className="text-[#9bd278]"/>Powered by the Sun</div><p className="mt-1 text-[10px] leading-relaxed text-white/60">Protecting every dose, from solar panel to patient.</p></div>
    </aside>
    {open&&<button aria-label="Close menu overlay" onClick={()=>setOpen(false)} className="fixed inset-0 z-30 bg-black/30 lg:hidden"/>}
    <div className="lg:pl-[292px]"><header className="sticky top-0 z-20 flex h-[66px] items-center justify-between border-b border-[#e8edf1] bg-white/90 px-4 backdrop-blur md:px-8"><div className="flex items-center gap-3"><button onClick={()=>setOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Open menu"><Menu size={20}/></button><div className="text-[13px] text-slate-400">SUNVAX <span className="mx-2 text-slate-300">/</span><span className="font-semibold text-[#1d2b3d]">{active}</span></div></div><div className="flex items-center gap-2"><button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell size={18}/><i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500"/></button><div className="hidden h-8 w-px bg-slate-200 sm:block"/><div className="hidden text-right sm:block"><b className="block text-xs">{account.name}</b><small className="text-[10px] text-slate-400">{account.organization}</small></div><button onClick={signOut} title="Sign out" aria-label="Sign out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><LogOut size={16}/></button></div></header><main className="mx-auto max-w-[1500px] p-4 md:p-8">{children}<footer className="mt-10 flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-[11px] text-slate-400 sm:flex-row"><span>SUNVAX · Powered by the Sun. Protecting Every Dose.</span><span>Developed by Cytobiz Innovation Labs</span></footer></main></div>
  </div>;
}
