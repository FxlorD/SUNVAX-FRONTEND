create extension if not exists pgcrypto;

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  device_code text not null unique,
  name text not null,
  location text,
  is_active boolean not null default true,
  token_hash text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  revoked_at timestamptz
);

create table if not exists public.telemetry (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.devices(id) on delete cascade,
  message_id text not null,
  sequence bigint,
  schema_version integer not null default 1,
  recorded_at timestamptz not null,
  received_at timestamptz not null default now(),
  temperature_1_c double precision,
  temperature_2_c double precision,
  door_open boolean,
  battery_voltage double precision,
  signal_rssi integer,
  solar_voltage double precision,
  humidity_percent double precision,
  latitude double precision,
  longitude double precision,
  unique (device_id, message_id),
  check (temperature_1_c is null or temperature_1_c between -55 and 125),
  check (temperature_2_c is null or temperature_2_c between -55 and 125),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create index if not exists telemetry_device_recorded_idx
  on public.telemetry (device_id, recorded_at desc);

alter table public.devices enable row level security;
alter table public.telemetry enable row level security;

-- No browser role can read device credentials or write telemetry.
revoke all on public.devices, public.telemetry from anon, authenticated;
grant select on public.devices, public.telemetry to authenticated;
grant usage, select on sequence public.telemetry_id_seq to service_role;
grant all on public.devices, public.telemetry to service_role;

create policy "signed-in users can read devices"
  on public.devices for select to authenticated using (true);
create policy "signed-in users can read telemetry"
  on public.telemetry for select to authenticated using (true);

-- Provision a device after generating a long random token. Store only its hash:
-- insert into public.devices (device_code, name, location, token_hash)
-- values ('SUNVAX-001', 'Ilorin prototype', 'Ilorin, Kwara State',
--         encode(digest('PASTE_RANDOM_DEVICE_TOKEN_HERE', 'sha256'), 'hex'));
-- Rotate a token by updating token_hash with the new digest; revoke with revoked_at=now().
