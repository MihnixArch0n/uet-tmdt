<!--
Sync Impact Report
- Version: 1.0.0 -> 2.0.0
- Modified principles:
  - Project Title: Vietnam Market GIS Platform Constitution -> AtlasIQ Constitution
  - I. Static-First & Zero-Backend GIS Architecture (added 3-Concentric-Ring 0-3km client-side spatial scoring via @turf/turf)
  - III. Strict Schema Contracts & Single Source of Truth (added 63->34 mapping table, null-safety for missing metrics, and mapshaper simplification)
  - V. Grounded AI Decision Advisory (grounded in 4-layer data, 3-ring site score, and Needs-Wants-Demand-Behavior proxy framing for 3 target user groups)
- Added sections:
  - VI. 3-Tier Administrative Model, Sovereignty & Data Transparency
- Updated sections:
  - Technology Stack & Architectural Constraints (added CartoDB Positron, Fuse.js old/new province search, Compare Mode, and 3-Concentric-Ring scoring parameters)
  - Development Workflow & Quality Gates (updated from 4-tier/1-10km buffer to 3-tier 01/07/2025 drill-down and 3-Concentric-Ring 0-3km scoring + null-safety & sovereignty checks)
- Removed sections: None
- Follow-up TODOs: None
-->

# AtlasIQ Constitution

## Core Principles

### I. Static-First & Zero-Backend GIS Architecture
All geospatial boundaries, demographics, economic indicators, and retail/logistics POIs MUST be distributed as pre-computed, optimized static assets under `public/data/`. The system MUST NOT rely on a dedicated VPS, external database server (e.g., PostgreSQL/PostGIS), or persistent stateful backends. All spatial computations—including 3-Concentric-Ring buffer generation (`0–1km`, `1–2km`, `2–3km`), `turf.distance` ring assignment (preventing double-counting), and weighted site scoring—MUST execute client-side via `@turf/turf`.

*Rationale: Eliminates infrastructure operational complexity, network latency, CORS hurdles, and runtime hosting costs while enabling rapid Vercel serverless deployments and deterministic client-side scoring.*

### II. SSR Safety & WebGL Isolation
MapLibre GL and any browser-only APIs (such as `window`, `document`, and WebGL canvas contexts) MUST NEVER execute during Server-Side Rendering (SSR). Map container components MUST be wrapped with Next.js dynamic imports disabling SSR (`dynamic(() => import(...), { ssr: false })`). Coordinates across all layers, utilities, and states MUST strictly adhere to the GIS standard `[longitude, latitude]`.

*Rationale: Next.js 16 App Router renders components on the server by default. Attempting to evaluate MapLibre GL on Node.js runtimes causes fatal hydration and runtime crashes.*

### III. Strict Schema Contracts & Single Source of Truth
All administrative boundaries, demographics, e-commerce indices, and POI records MUST strictly adhere to TypeScript interfaces declared in `src/types/market.ts`. Relational linking between geometry files and tabular metrics MUST occur solely through the official administrative code (`code`), supported by a `63 -> 34` province conversion mapping table for historical datasets (GSO, VECOM EBI). GeoJSON polygons MUST be pre-simplified using `mapshaper` to keep initial bundle sizes lightweight. Missing statistical fields MUST be typed and stored as `null` rather than coerced to `0`.

*Rationale: Decoupling geometric boundaries from statistical attributes ensures modular parallel development across the 4 core data layers, preserves historical continuity across the 01/07/2025 administrative reform, and prevents misleading zero-imputation.*

### IV. Atomic State Management & 60fps Performance
Application state MUST be centralized in Zustand (`src/store/useMapStore.ts`) and accessed strictly through atomic, granular selectors (e.g., `useMapStore(state => state.selectedRegion)`). Components MUST NOT destructure the entire store. Large GeoJSON feature collections MUST NEVER be stored in the Zustand store state; only identifiers, filter criteria, scoring weights, and lightweight metrics belong in store memory.

*Rationale: Unnecessary component re-renders degrade WebGL rendering frames below the target 60fps, degrading user experience during interactive zoom, pan, and 3D extrusion operations.*

### V. Grounded AI Decision Advisory
AI decision support and market consulting MUST be executed via Next.js Route Handlers (`src/app/api/analyze/route.ts`) utilizing the Vercel AI SDK and Google Gemini 2.5 Flash API. Prompts MUST be deterministically grounded in quantitative data from the active region's 4 data layers (demographics, EBI, POI density) and the 3-Concentric-Ring site score, framed around the *Needs–Wants–Demand–Behavior* model for AtlasIQ's 3 target user groups (O2O Brands/Sellers, SME Retail Chains, Last-Mile Logistics Operators). The AI MUST fail gracefully with structured fallback messages if the upstream API is unavailable.

*Rationale: Ensures strategic recommendations remain credible, verifiable, and directly anchored in geospatial evidence rather than speculative hallucinations.*

### VI. 3-Tier Administrative Model, Sovereignty & Data Transparency
All geographic hierarchies MUST conform to Vietnam's **01/07/2025 3-tier administrative structure**: `Country -> 34 Provinces/Cities -> 3,321 Wards/Communes/Special Zones` (omitting the District tier and enabling direct Province-to-Ward drill-down). Country and province GeoJSON boundaries MUST accurately depict full Vietnamese territorial sovereignty, explicitly including Hoàng Sa, Trường Sa archipelagos, and all islands. Statistical indicators MUST clearly distinguish official published figures from estimated/interpolated values, preserve `null` ("Chưa có dữ liệu") for missing fields, and treat Layer 2 and Layer 3 metrics as demand proxies rather than equating raw population with online purchasing demand.

*Rationale: Aligns the platform with Vietnam's current administrative boundaries, enforces national cartographic accuracy, and upholds analytical rigor by preventing fabricated zeros or conflation of population size with e-commerce demand.*

## Technology Stack & Architectural Constraints

1. **Framework & Language:** Next.js 16 (App Router, Turbopack), React 19, TypeScript with strict type-checking enabled. Route handlers and dynamic params MUST handle asynchronous resolution.
2. **Interactive Mapping:** MapLibre GL v6 with `react-map-gl`, utilizing free vector basemap styles (CartoDB Positron Vector Style).
3. **Styling & Design System:** Tailwind CSS v4 (`@theme inline`), shadcn/ui accessible component primitives, Lucide React icons, and Recharts for statistical visualizers (4 age groups, gender ratio, urbanization, top categories).
4. **Spatial & Decision Tooling:** `@turf/turf` for client-side 3-Concentric-Ring (`0–1km`, `1–2km`, `2–3km`) spatial scoring, `fuse.js` for Vietnamese fuzzy search (supporting accented/unaccented queries and old/new 63-to-34 province names), and Vercel AI SDK for Gemini 2.5 Flash integration.
5. **3-Concentric-Ring Scoring Standard:**
   - **Exclusion Threshold:** Total reachable population within `3km < 5,000` MUST return `Score = 0`.
   - **Distance Decay Weights:** Ring 1 (`0–1km`): Population `1.0`, Logistics `1.0`, Competition `1.0`; Ring 2 (`1–2km`): Population `0.7`, Logistics `0.6`, Competition `0.5`; Ring 3 (`2–3km`): Population `0.4`, Logistics `0.3`, Competition `0.2`.
   - **Normalization & Composite Score:** Each indicator MUST use Min-Max normalization clamped to `[0, 100]` against fixed national bounds `(X_min, X_max)`. Final `Score = clamp(0, 100, w1*D_norm + w2*E_norm + w3*L_norm - w4*C_norm)` with default weights `w1=0.35, w2=0.35, w3=0.30, w4=0.20` and interactive UI sliders/presets.
6. **Layout Standard:** Fixed `100vh` full-bleed viewport layout with floating controls, responsive drawers, Compare Mode, and accessible color ramps (Choropleth 2D, 3D Extrusion, and POI Clustering).

## Development Workflow & Quality Gates

1. **Vertical Slice Development:** Team members maintain modular ownership across the four data layers (`boundaries/`, `demographics.json`, `ecommerce.json`, `pois.geojson`) and their corresponding UI components to minimize merge conflicts.
2. **Quality Gates (Pre-Merge & CI):**
   - `pnpm run lint`: Zero ESLint errors or unescaped entities.
   - `pnpm run build`: Strict TypeScript type-check and successful Next.js production build without warnings.
   - Data Contract & Null-Safety Validation: All JSON and GeoJSON fixtures MUST validate against `src/types/market.ts`, enforce `63 -> 34` code alignment, and preserve `null` for missing values before committing.
3. **Interactive Scenario Testing:** All user flows—including 3-tier administrative drill-down (`Country -> 34 Provinces -> Wards/Communes`), old/new province search (`fuse.js`), 3-Concentric-Ring (`0–3km`) scoring with `< 5,000` exclusion and weight sliders, Compare Mode, and AI analysis triggers—MUST be manually verified on desktop and mobile viewports before release.

## Governance

1. **Authority:** This Constitution forms the highest engineering and architectural law of AtlasIQ. It supersedes informal agreements, spontaneous implementations, and unvetted conventions.
2. **Amendment Procedure:** Amendments require explicit review and approval by the Tech Lead. Proposed modifications MUST specify the problem, architectural impact, and migration plan.
3. **Versioning Policy:** The Constitution follows Semantic Versioning (SemVer):
   - **MAJOR:** Incompatible governance alterations, elimination of core architectural constraints (e.g., adding an external database backend, changing administrative tier structure).
   - **MINOR:** Addition of new principles, structural sections, or significant governance expansions.
   - **PATCH:** Formatting, clarifications, typo fixes, or non-semantic wording enhancements.
4. **Compliance Review:** All pull requests and code modifications MUST be audited against the core principles outlined herein. Violations of SSR safety, atomic state selectors, null-safety, territorial sovereignty, or data contracts MUST block merge approval.

**Version**: 2.0.0 | **Ratified**: 2026-11-24 | **Last Amended**: 2026-11-26
