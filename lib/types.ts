export type DeviceStatus = 'healthy'|'warning'|'critical'|'offline';
export interface Telemetry { timestamp:string; temperature:number; battery:number; solar:number; humidity:number; signal:number }
export interface Device { id:string; name:string; site:string; region:string; status:DeviceStatus; lastSeen:string; telemetry:Telemetry; history:Telemetry[]; firmware:string; serial:string; location:{latitude:number;longitude:number;accuracyMeters:number}; }
export interface Alert { id:string; title:string; device:string; severity:'critical'|'warning'|'info'; time:string; description:string; acknowledged:boolean }
export interface User { id:string; name:string; email:string; role:string; site:string; status:'Active'|'Invited' }
