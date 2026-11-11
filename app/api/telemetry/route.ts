import {createHash,timingSafeEqual} from 'node:crypto';
import {NextResponse} from 'next/server';

export const runtime='nodejs';
type Payload={schemaVersion?:unknown;messageId?:unknown;deviceCode?:unknown;sequence?:unknown;recordedAt?:unknown;temperature1C?:unknown;temperature2C?:unknown;doorOpen?:unknown;batteryVoltage?:unknown;signalRssi?:unknown;solarVoltage?:unknown;humidityPercent?:unknown;latitude?:unknown;longitude?:unknown};
const hash=(value:string)=>createHash('sha256').update(value,'utf8').digest('hex');
const numberOrNull=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)?value:null;
const validTemperature=(value:unknown)=>value===undefined||value===null||(typeof value==='number'&&Number.isFinite(value)&&value>=-55&&value<=125);
const validOptionalNumber=(value:unknown,min:number,max:number)=>value===undefined||value===null||(typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max);

export async function POST(request:Request){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token=request.headers.get('x-device-token')||'';
  if(!url||!serviceKey)return NextResponse.json({error:'Telemetry service is not configured.'},{status:503});
  if(token.length<32)return NextResponse.json({error:'A valid device token is required.'},{status:401});
  let body:Payload;
  try{body=await request.json() as Payload}catch{return NextResponse.json({error:'Request body must be valid JSON.'},{status:400})}
  if(body.schemaVersion!==1||typeof body.messageId!=='string'||body.messageId.length<1||body.messageId.length>128||typeof body.deviceCode!=='string'||body.deviceCode.length<1||body.deviceCode.length>80||typeof body.recordedAt!=='string'||!Number.isFinite(Date.parse(body.recordedAt))||!validTemperature(body.temperature1C)||!validTemperature(body.temperature2C)||(body.doorOpen!==undefined&&body.doorOpen!==null&&typeof body.doorOpen!=='boolean')||!validOptionalNumber(body.batteryVoltage,0,100)||!validOptionalNumber(body.solarVoltage,0,1000)||!validOptionalNumber(body.humidityPercent,0,100)||!validOptionalNumber(body.latitude,-90,90)||!validOptionalNumber(body.longitude,-180,180)||(body.signalRssi!==undefined&&body.signalRssi!==null&&(typeof body.signalRssi!=='number'||!Number.isInteger(body.signalRssi)||body.signalRssi< -200||body.signalRssi>0)))return NextResponse.json({error:'Telemetry payload is invalid.'},{status:400});
  const base=url.replace(/\/$/,'');
  const headers={apikey:serviceKey,Authorization:`Bearer ${serviceKey}`};
  try{
    const lookup=await fetch(`${base}/rest/v1/devices?device_code=eq.${encodeURIComponent(body.deviceCode)}&select=id,token_hash,is_active,revoked_at`,{headers:{...headers,Accept:'application/json'},cache:'no-store'});
    if(!lookup.ok)return NextResponse.json({error:'Could not validate device.'},{status:502});
    const devices=await lookup.json() as Array<{id:string;token_hash:string;is_active:boolean;revoked_at:string|null}>;
    const device=devices[0];
    const provided=Buffer.from(hash(token),'hex');
    const expected=device?Buffer.from(device.token_hash,'hex'):Buffer.alloc(32);
    const tokenMatches=provided.length===expected.length&&timingSafeEqual(provided,expected);
    if(!device||!tokenMatches||!device.is_active||device.revoked_at)return NextResponse.json({error:'Device credentials are invalid or revoked.'},{status:401});
    const row={device_id:device.id,message_id:body.messageId,sequence:typeof body.sequence==='number'&&Number.isInteger(body.sequence)&&body.sequence>=0?body.sequence:null,schema_version:1,recorded_at:new Date(body.recordedAt).toISOString(),temperature_1_c:numberOrNull(body.temperature1C),temperature_2_c:numberOrNull(body.temperature2C),door_open:typeof body.doorOpen==='boolean'?body.doorOpen:null,battery_voltage:numberOrNull(body.batteryVoltage),signal_rssi:typeof body.signalRssi==='number'&&Number.isInteger(body.signalRssi)?body.signalRssi:null,solar_voltage:numberOrNull(body.solarVoltage),humidity_percent:numberOrNull(body.humidityPercent),latitude:numberOrNull(body.latitude),longitude:numberOrNull(body.longitude)};
    const inserted=await fetch(`${base}/rest/v1/telemetry?on_conflict=device_id,message_id`,{method:'POST',headers:{...headers,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify(row),cache:'no-store'});
    if(!inserted.ok)return NextResponse.json({error:'Telemetry could not be stored.'},{status:502});
    const rows=await inserted.json() as unknown[];
    if(rows.length)await fetch(`${base}/rest/v1/devices?id=eq.${encodeURIComponent(device.id)}`,{method:'PATCH',headers:{...headers,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({last_seen_at:new Date().toISOString()}),cache:'no-store'});
    return NextResponse.json({accepted:true,duplicate:rows.length===0},{status:rows.length?201:200});
  }catch{return NextResponse.json({error:'Telemetry service could not reach the database.'},{status:502})}
}
