# SUNVAX frontend demonstration

SUNVAX is a responsive frontend demonstration of a solar-powered vaccine refrigeration and cold-chain monitoring platform. It is developed by Cytobiz Innovation Labs and uses the identity line **“Powered by the Sun. Protecting Every Dose.”** Every reading in this application is clearly marked as simulated. No hardware, broker, backend, production authentication, or real user service is connected.

## Architecture

- `app/`: Next.js App Router pages for the product areas, including GPS tracking, inventory, and planned AI analytics.
- `components/app-shell.tsx`: responsive navigation, demo labeling, and shared layout.
- `components/dashboard.tsx`: reusable data-driven page views, charts, tables, and interactive demonstration flows.
- `components/ui.tsx`: shared page headings, cards, metric tiles, status pills, and controls.
- `components/inventory.tsx`: searchable, filterable, sortable demo stock lots with expiry and reorder indicators.
- `components/ai-analytics.tsx`: AI analytics roadmap; explicitly no model or prediction is connected yet.
- `lib/types.ts`: reusable TypeScript device telemetry, device, inventory, alert, and user contracts.
- `lib/demo-data.ts`: seeded Nigeria demonstration fixtures, approximate GPS coordinates, stock lots, and timestamped history.
- `lib/data-service.ts`: centralized data boundary. Replace the demo implementation with API-backed methods when a backend is ready.

## Run locally

Requirements: Node.js 20.9 or later and pnpm (the repository includes `pnpm-lock.yaml`).

```bash
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard refreshes simulated device values every 15 seconds. Use **Refresh readings** to generate a new sample immediately. Changes to demo invitations, alert acknowledgements, inventory entries, and settings remain in memory for the current page session.

## Build

```bash
pnpm build
pnpm start
```

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```

There is no automated test suite configured yet.

## Vercel deployment

Import this repository into Vercel and keep the detected Next.js framework preset. Configure the environment variables below in the Vercel project settings, then deploy. The default is the standalone demo mode; no secrets are needed.

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_DATA_MODE` | Reserved selector for the future service integration; use `demo` until the API exists. | `demo` |
| `NEXT_PUBLIC_API_BASE_URL` | Future backend base URL. No API calls are implemented in this frontend stage. | empty |

`.env.example` contains names only and no secrets. Do not set the mode to `api` until API methods, authentication, and server-side security have been implemented and reviewed.

## Product assumptions

The Master Website Development Specification mentioned in the task was not present in the project folder or attached as an accessible page during implementation. The supplied task brief was used as the requirements source. Device names, regions, sample alert scenarios, roles, and metric values are illustrative demonstration content and should be replaced or validated against the master specification before production use.

Temperature safe range is shown as +2°C to +8°C for the demonstration. This frontend is not a medical device and must not be used to make vaccine handling decisions.

GPS coordinates on the location tracking page are illustrative placeholders for Nigerian cities, not live device locations. Replace them with authenticated backend data when GPS hardware and the service are connected.

Inventory lots and expiry dates are demonstration records only. Connect them to an authorized inventory service before operational use. AI analytics is marked underway: the recommended design is to send device and inventory records to a backend for storage, validation, and analysis. The ESP32 can focus on collecting and securely transmitting readings; this frontend currently displays no AI-generated predictions or recommendations.
