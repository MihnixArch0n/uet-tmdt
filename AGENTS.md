<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Vietnam E-Commerce Market & Customer Demand GIS Platform

This document serves as the master instruction set for all AI agents and developers operating in this repository.

## 1. Project Overview & Vision
This application is a **Digital Map GIS Platform** designed for analyzing the Vietnamese e-commerce market, customer demographics, purchasing power, logistics readiness, and spatial retail decisions.

### Key Capabilities:
1. **Interactive Digital Mapping (GIS):** Multi-scale administrative boundary visualization (Country $\rightarrow$ Province $\rightarrow$ District $\rightarrow$ Ward) powered by WebGL.
2. **Multi-layer Data Visualization:** 2D Choropleth and 3D Extrusion maps for population density and Vietnam E-business Index (EBI) scores.
3. **Spatial Decision Support:** Buffer radius analysis (1km–10km) using Turf.js to estimate reachable population and evaluate competitive retail/logistics presence.
4. **AI Strategic Consultant:** Automated market potential evaluation powered by Google Gemini API via Vercel AI SDK (`/api/analyze`).

---

## 2. System Architecture & Philosophy
- **Client-Centric & Static-First:** No dedicated VPS or SQL database backend. All boundary polygons and statistical metrics are served as static assets from `public/data/` and processed client-side.
- **Framework & Runtime:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript.
- **Package Manager:** `pnpm` (v12+).
- **Deployment Target:** Vercel Serverless.

---

## 3. Four Core Data Layers
All data structures conform to `src/types/market.ts`:

1. **Layer 1: Administrative Boundaries (`public/data/boundaries/*.geojson`)**
   - 4 hierarchical tiers: Country, 63 Provinces, Urban Districts, Wards/Communes.
   - Bound to attributes via unique administrative code `code`.
2. **Layer 2: Demographics & Population (`public/data/demographics.json`)**
   - Total population, density ($\text{people/km}^2$), gender ratios, and age demographics (Gen Z, working age, etc.).
3. **Layer 3: Sức mua & E-Commerce Readiness (`public/data/ecommerce.json`)**
   - Vietnam E-business Index (EBI), average monthly income per capita, average order values (AOV), and top product categories.
4. **Layer 4: Logistics Infrastructure & Retail POIs (`public/data/pois.geojson`)**
   - Point locations for fulfillment hubs, post offices (GHTK, ViettelPost, VNPost, Shopee Express), malls, and supermarkets.

---

## 4. Specialized Technical Rulebooks
Detailed technical specifications are modularized under `.agents/rules/`:

| Rulebook | Scope & Key Constraints |
| :--- | :--- |
| [gis-maplibre.md](file:///.agents/rules/gis-maplibre.md) | MapLibre GL v6, `react-map-gl`, SSR avoidance (`dynamic({ ssr: false })`), coordinate standards `[lng, lat]`, 3D extrusion, clustering, Turf.js spatial operations. |
| [data-contracts.md](file:///.agents/rules/data-contracts.md) | Strict TypeScript schemas from `src/types/market.ts`, foreign key integrity (`code`), GeoJSON simplification, static fetch hygiene. |
| [state-zustand.md](file:///.agents/rules/state-zustand.md) | Centralized state in `src/store/useMapStore.ts`, atomic selectors to avoid re-render loops, camera syncing, filter & breadcrumb state. |
| [ui-ux.md](file:///.agents/rules/ui-ux.md) | Tailwind CSS v4 (`@theme inline`), shadcn/ui primitives, Recharts responsive integration, dark/light theme, fixed `100vh` canvas layout. |

---

## 5. Development Conventions & Guidelines

### Next.js 16 & React 19 Safety
1. **SSR Isolation for Browser APIs:**
   MapLibre GL and canvas utilities must NEVER be evaluated during server-side rendering. Always isolate map components using Next.js `dynamic(..., { ssr: false })`.
2. **Async Route Handlers & Params:**
   In Next.js 16, route handler parameters and dynamic route segments are asynchronous. Await `params` and `searchParams` where applicable.
3. **Client Component Declarations:**
   Mark interactive components with `'use client';` at the very top line.

### State & Performance Rules
1. **Never destructure the entire Zustand store.** Always use atomic selectors:
   ```tsx
   const selectedRegion = useMapStore((state) => state.selectedRegion);
   ```
2. **Never store large GeoJSON payloads inside Zustand.** Store only identifiers and lightweight summary metrics.

### AI Decision Support API
- The AI consultant is located at `src/app/api/analyze/route.ts`.
- It accepts the active region's demographics, e-commerce data, and POI density, then streams or returns strategic business recommendations using the Gemini 2.5 Flash API.

---

## 6. Directory Layout
```text
uet-tmdt/
├── .agents/
│   └── rules/                  # Modular technical rulebooks
│       ├── gis-maplibre.md
│       ├── data-contracts.md
│       ├── state-zustand.md
│       └── ui-ux.md
├── public/
│   └── data/                   # Static GIS boundaries & datasets
│       ├── boundaries/
│       ├── demographics.json
│       ├── ecommerce.json
│       └── pois.geojson
├── src/
│   ├── app/
│   │   ├── api/analyze/        # Gemini AI strategic consultant endpoint
│   │   ├── globals.css         # Tailwind v4 configuration & theme tokens
│   │   ├── layout.tsx
│   │   └── page.tsx            # Main GIS dashboard shell
│   ├── components/
│   │   ├── analytics/          # Recharts demographic & e-commerce drawers
│   │   ├── decision/           # Site selection buffer tool & AI modal
│   │   ├── filters/            # Multi-criteria filter drawer
│   │   ├── layers/             # Boundary, Population, Ecommerce, and POI layers
│   │   ├── layout/             # Top navbar & navigation controls
│   │   ├── map/                # BaseMap, LayerControl, MapLegend
│   │   ├── search/             # Location autocomplete & flyTo search bar
│   │   └── ui/                 # shadcn/ui primitives
│   ├── lib/
│   │   ├── i18n/               # Vietnamese & English localization
│   │   ├── spatial.ts          # Turf.js spatial calculation utilities
│   │   └── utils.ts
│   ├── store/
│   │   └── useMapStore.ts      # Central Zustand store
│   └── types/
│       └── market.ts           # Authoritative contract schemas
├── package.json
└── tsconfig.json
```

---

## 7. Verification & Workflow Commands
```bash
# Start local development server (Turbopack)
pnpm run dev

# Run TypeScript typecheck and Next.js build
pnpm run build

# Run ESLint validation
pnpm run lint
```
