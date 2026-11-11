import Image from 'next/image';

const concepts=[
  {src:'/sunvax-solar-refrigerator.jpg',alt:'SUNVAX solar-powered vaccine refrigerator concept with a solar panel and battery',title:'Solar-powered cold storage',copy:'Refrigeration concept for reliable vaccine storage at health facilities.'},
  {src:'/sunvax-vaccine-delivery.jpg',alt:'SUNVAX vaccine delivery motorcycles with insulated cold-chain boxes',title:'Vaccine delivery network',copy:'Last-mile delivery concept for temperature-managed vaccine transport.'},
];

export function ProductShowcase(){return <section className="mt-8" aria-labelledby="sunvax-concepts-title">
  <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#16803d]">The SUNVAX vision</span><h2 id="sunvax-concepts-title" className="mt-1 text-lg font-bold text-[#193654]">Cold-chain infrastructure, from storage to delivery</h2></div><span className="rounded-full bg-[#edf6e9] px-3 py-1.5 text-[10px] font-semibold text-[#16803d]">Product concepts</span></div>
  <div className="grid gap-4 lg:grid-cols-2">{concepts.map(item=><article key={item.src} className="overflow-hidden rounded-2xl border border-[#e8edf1] bg-white shadow-[0_3px_15px_rgba(32,54,80,.025)]"><div className="relative aspect-[16/9] bg-[#f3f6f8]"><Image src={item.src} alt={item.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover"/></div><div className="p-4"><h3 className="text-sm font-bold text-[#213751]">{item.title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">{item.copy}</p></div></article>)}</div>
  <p className="mt-3 text-[10px] text-slate-400">Illustrative product concepts; final hardware design and operating data are still being developed.</p>
</section>}
