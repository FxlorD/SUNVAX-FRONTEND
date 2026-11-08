import {initialAlerts,initialDevices,initialInventory,initialUsers} from './demo-data';
import type {Device,InventoryLot,Telemetry} from './types';
/** Data boundary: swap this implementation for an API client without changing UI consumers. */
const apiBase=process.env.NEXT_PUBLIC_API_BASE_URL;
export const dataMode=process.env.NEXT_PUBLIC_DATA_MODE==='api'&&apiBase?'api':'demo';
export const demoStore={devices:initialDevices.map(d=>({...d,history:[...d.history]})),alerts:initialAlerts.map(a=>({...a})),users:initialUsers.map(u=>({...u})),inventory:initialInventory.map(l=>({...l}))};
export function getDevices(){return demoStore.devices}
export function getDevice(id:string){return demoStore.devices.find(d=>d.id===id)}
export function getAlerts(){return demoStore.alerts}
export function getUsers(){return demoStore.users}
export function getInventory(){return demoStore.inventory}
export function addInventoryLot(lot:Omit<InventoryLot,'id'|'receivedAt'>){const next:InventoryLot={...lot,id:`LOT-${String(Date.now()).slice(-6)}`,receivedAt:new Date().toISOString().slice(0,10)};demoStore.inventory.unshift(next);return next}
export function nextTelemetry(d:Device):Telemetry{const prev=d.telemetry;const temp=Math.max(2.1,Math.min(7.8,prev.temperature+(Math.random()-.5)*.5));return{timestamp:new Date().toISOString(),temperature:Number(temp.toFixed(1)),battery:Math.max(12,Math.min(100,prev.battery+(Math.random()>.7?1:-1))),solar:Math.max(0,Math.min(100,Math.round(prev.solar+(Math.random()-.42)*15))),humidity:Math.round(prev.humidity+(Math.random()-.5)*2),signal:Math.max(45,Math.min(100,Math.round(prev.signal+(Math.random()-.5)*3)))}}
export function appendTelemetry(d:Device,t:Telemetry){d.telemetry=t;d.lastSeen='Just now';d.history=[...d.history.slice(-23),t];d.status=d.status==='offline'?'healthy':t.temperature>7.5||t.battery<20?'critical':t.temperature>6.8||t.battery<35?'warning':'healthy'}
export function apiUrl(path:string){return apiBase?`${apiBase.replace(/\/$/,'')}${path}`:path}
