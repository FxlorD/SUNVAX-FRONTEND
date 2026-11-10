import {initialAlerts,initialDevices,initialInventory,initialUsers} from './seed-data';
import type {InventoryLot} from './types';

/** Central data boundary for replacing the local records with backend methods. */
const apiBase=process.env.NEXT_PUBLIC_API_BASE_URL;
export const dataStore={devices:initialDevices.map(d=>({...d,history:[...d.history]})),alerts:initialAlerts.map(a=>({...a})),users:initialUsers.map(u=>({...u})),inventory:initialInventory.map(l=>({...l}))};
export function getDevices(){return dataStore.devices}
export function getDevice(id:string){return dataStore.devices.find(d=>d.id===id)}
export function getAlerts(){return dataStore.alerts}
export function getUsers(){return dataStore.users}
export function getInventory(){return dataStore.inventory}
export function addInventoryLot(lot:Omit<InventoryLot,'id'|'receivedAt'>){const next:InventoryLot={...lot,id:`LOT-${String(Date.now()).slice(-6)}`,receivedAt:new Date().toISOString().slice(0,10)};dataStore.inventory.unshift(next);return next}
export function apiUrl(path:string){return apiBase?`${apiBase.replace(/\/$/,'')}${path}`:path}
