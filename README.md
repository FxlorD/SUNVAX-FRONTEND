# SUNVAX cold-chain and supply platform

SUNVAX is a Next.js web platform for vaccine cold-chain monitoring, facility operations, stock management, and vaccine ordering. It is developed by Cytobiz Innovation Labs and uses the identity line **“Powered by the Sun. Protecting Every Dose.”**

## Product areas

- Cold-chain monitoring: temperature, solar and energy, GPS locations, alerts, and connected devices.
- Supply chain: vaccine marketplace and order preparation, inventory, distribution, facilities, and expiry management.
- Intelligence: AI demand forecasting and operational reporting.
- System management: team access and workspace settings.
- `app/signup`: required account registration screen.

## Project structure

- `app/`: Next.js App Router pages.
- `components/app-shell.tsx`: grouped navigation and signup-gated workspace shell.
- `components/dashboard.tsx`: monitoring, alerts, reports, team, and settings screens.
- `components/marketplace.tsx`: searchable product catalogue and order selection.
- `components/inventory.tsx`: stock lots, filters, expiry, and reorder indicators.
- `components/location-tracking.tsx`: GPS tracking interface.
- `lib/vaccines.ts`: 50 vaccine products and NGN prices supplied for the catalogue.
- `lib/seed-data.ts`: initial device, alert, user, and inventory records for the interface.
- `lib/data-service.ts`: data boundary to connect API methods.

## Run locally

Requirements: Node.js 20.9 or later and pnpm (the repository includes `pnpm-lock.yaml`).

```bash
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The app currently uses local seed records. Device readings, GPS positions, alerts, users, and stock need backend services before they represent live operations. Product catalogue prices are the values supplied for this project.

## Account registration

The signup screen currently stores the registered profile in that browser's local storage. It gates the workspace in that browser but does not verify an email, authenticate a password, or create a shared company account. Connect a real authentication provider and server-side route protection before using this for production access or across devices.

## Build

```bash
pnpm build
pnpm start
```

## Vercel deployment

Import the GitHub repository into Vercel and keep the detected Next.js framework preset. The project root directory is `./`. Add `NEXT_PUBLIC_API_BASE_URL` in Vercel when the backend API is ready, then redeploy. The frontend API client still needs to be implemented before real device and business data will appear.

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL for frontend requests. | empty |

Do not place device credentials or private service keys in `NEXT_PUBLIC_` variables.

## Integration notes

- The ESP32 should send authenticated, timestamped readings to the backend using HTTPS or MQTT over TLS.
- The backend should validate and store device telemetry, GPS, alerts, and inventory changes.
- The SUNVAX frontend should read those records through an authenticated API.
- GPS coordinates and telemetry in `lib/seed-data.ts` are starting records, not live device reports.
- AI forecasting should be connected only after reliable device, stock, and delivery history is available.
- Vaccine prices are supplied catalogue data and should be confirmed by the organization before accepting orders.
