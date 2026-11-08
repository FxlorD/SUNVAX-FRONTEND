'use client';
import {useMemo,useState} from 'react';
import {ExternalLink,MapPinned,Navigation,Signal,Smartphone} from 'lucide-react';
import {getDevices} from '@/lib/data-service';
import type {Device} from '@/lib/types';
import {Metric,PageHeading,Panel,PanelTitle,StatusPill} from './ui';

export function LocationTracking(){
  const [devices]=useState<Device[]>(()=>getDevices().map(d=>({...d})));
  const [selectedId,setSelectedId]=useState(devices[0]?.id??'');
  const selected=devices.find(d=>d.id===selectedId)??devices[0];
  const mapUrl=useMemo(()=>{
    if(!selected)return '';
    const {latitude,longitude}=selected.location;
    const delta=.025;
    const bbox=[longitude-delta,latitude-delta,longitude+delta,latitude+delta].join('%2C');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  },[selected]);
  const mapLink=selected?`https://www.openstreetmap.org/?mlat=${selected.location.latitude}&mlon=${selected.location.longitude}#map=15/${selected.location.latitude}/${selected.location.longitude}`:'#';
  const online=devices.filter(d=>d.status!=='offline').length;

  return <>
    <PageHeading title="GPS tracking" sub="View the reported location of each cold-chain unit."/>
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Metric label="Registered units" value={devices.length} icon={Smartphone} color="blue"/>
      <Metric label="Reporting units" value={online} unit={`/ ${devices.length}`} icon={Signal} color="green"/>
      <Metric label="Location source" value="GPS" icon={MapPinned} color="yellow"/>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
      <Panel className="p-3 md:p-4">
        <div className="mb-3 flex items-center justify-between gap-2 px-2 pt-1">
          <div><h2 className="text-sm font-bold text-[#213751]">{selected?.site??'Unit location'}</h2><p className="mt-1 text-[11px] text-slate-400">Map marker for {selected?.id}</p></div>
          {selected&&<a href={mapLink} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">Open map <ExternalLink size={13}/></a>}
        </div>
        {selected?<iframe key={selected.id} title={`Map showing ${selected.name}`} src={mapUrl} className="h-[430px] w-full rounded-xl border-0 bg-slate-100" loading="lazy"/>:<div className="grid h-[430px] place-items-center text-sm text-slate-400">No units to show.</div>}
        <p className="px-2 pt-3 text-[10px] leading-relaxed text-slate-400">Demonstration map and approximate sample coordinates. Live GPS positions will appear after the devices and backend are connected.</p>
      </Panel>
      <Panel>
        <PanelTitle title="Tracked units" sub="Select a unit to view its sample map position"/>
        <div className="space-y-2">
          {devices.map(device=><button key={device.id} type="button" onClick={()=>setSelectedId(device.id)} className={`w-full rounded-xl border p-3 text-left transition ${selectedId===device.id?'border-[#8fc47a] bg-[#f3faf6]':'border-slate-100 hover:bg-slate-50'}`}>
            <div className="flex items-start justify-between gap-2"><span className="min-w-0"><b className="block truncate text-xs text-[#203a58]">{device.name}</b><span className="mt-1 block text-[10px] text-slate-400">{device.id} · {device.site}</span></span><StatusPill status={device.status}/></div>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500"><Navigation size={12} className="text-[#16803d]"/>{device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)}<span className="ml-auto">±{device.location.accuracyMeters} m</span></div>
          </button>)}
        </div>
        {selected&&<div className="mt-4 rounded-xl bg-[#f6f8fa] p-3 text-[10px] leading-relaxed text-slate-500"><b className="text-slate-700">Selected: {selected.id}</b><br/>Temperature {selected.telemetry.temperature.toFixed(1)}°C · Battery {selected.telemetry.battery}%<br/>Location values shown here are placeholders for the frontend demonstration.</div>}
      </Panel>
    </div>
  </>;
}
