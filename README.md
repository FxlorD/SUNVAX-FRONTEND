# SUNVAX cold-chain and supply platform

SUNVAX is a Next.js platform for vaccine cold-chain monitoring and supply operations. The ESP32 prototype currently measures two DS18B20 probes locally. Live cloud telemetry only appears after a Supabase project is configured, a device is provisioned, and its firmware is updated to send readings.

## Supabase setup

1. Create a Supabase project and copy its **Project URL** and **anon/public key** from Project Settings → API.
2. In Supabase **SQL Editor**, run `supabase/migrations/202611100001_initial_cold_chain.sql`.
3. Copy `.env.example` to `.env.local`; fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Add it to local `.env.local` and Vercel Project Settings → Environment Variables. Do not use a `NEXT_PUBLIC_` prefix, commit it, or put it in ESP32 firmware.
5. In Supabase Authentication → URL Configuration, set the production Site URL to the SUNVAX website and add local and production callback URLs as allowed redirect URLs. Email confirmation can be enabled in Authentication settings.
6. Deploy/restart the app after setting environment variables. Signup and sign-in use Supabase Auth; when email confirmation is enabled, users must confirm before signing in.

### Configure local development

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` with the project values and run the repository's normal Next.js development command. Never paste a service-role key or device token into chat, GitHub, or source files.

## Provision the ESP32

Create a long random token locally and store it securely. In the Supabase SQL Editor, add the device with the SHA-256 hash of that token, replacing the example values:

```sql
insert into public.devices (device_code, name, location, token_hash)
values (
  'SUNVAX-001',
  'Ilorin prototype',
  'Ilorin, Kwara State',
  encode(digest('YOUR_RANDOM_DEVICE_TOKEN', 'sha256'), 'hex')
);
```

Configure the ESP32 to POST JSON to `https://YOUR-SUNVAX-DOMAIN/api/telemetry`, with header `x-device-token: YOUR_RANDOM_DEVICE_TOKEN` and `Content-Type: application/json`. Example for the two connected probes:

```json
{
  "schemaVersion": 1,
  "messageId": "unique-per-reading-id",
  "deviceCode": "SUNVAX-001",
  "sequence": 1,
  "recordedAt": "2026-11-10T12:00:00Z",
  "temperature1C": 4.2,
  "temperature2C": 4.4
}
```

The endpoint checks the device token, validates fields, ignores repeated `(device, messageId)` submissions, stores device measurement time separately from server receipt time, and updates `last_seen_at`. Door state and future battery/solar/humidity/GPS values are optional and should only be sent after the corresponding input is genuinely available. A device token can be rotated by updating `token_hash`; setting `revoked_at=now()` disables it.

## Current scope and limitations

- The SQL schema, Supabase signup/sign-in, and secured telemetry ingestion endpoint are prepared.
- Dashboard pages still use local seed records; wiring their queries to Supabase and replacing the seed-based metrics is the next implementation step. The endpoint alone does not make dashboard readings live.
- The account organization is stored as Auth user metadata. Fine-grained organization/facility access policies and user invitations are not implemented yet; the initial read policies are for a trusted single-organization MVP.
- GPS, solar, battery, alerts, inventory, and forecasting must not be presented as live until connected to verified inputs and backend workflows.
- No telemetry ingestion tests have been run against a real Supabase project yet.
- The prototype has not been certified or qualified as a vaccine-grade refrigeration system.
