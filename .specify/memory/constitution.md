<!--
Sync Impact Report
- Version: initial -> 1.0.0
- Modified principles: N/A (initial ratification)
- Added sections:
  - Core Principles:
    - I. Static-First & Zero-Backend GIS Architecture
    - II. SSR Safety & WebGL Isolation
    - III. Strict Schema Contracts & Single Source of Truth
    - IV. Atomic State Management & 60fps Performance
    - V. Grounded AI Decision Advisory
  - Technology Stack & Architectural Constraints
  - Development Workflow & Quality Gates
  - Governance
- Removed sections: None
- Follow-up TODOs: None
-->

# Vietnam Market GIS Platform Constitution

## Core Principles

### I. Static-First & Zero-Backend GIS Architecture
All geospatial boundaries, demographics, economic indicators, and retail/logistics POIs MUST be distributed as pre-computed, optimized static assets under `public/data/`. The system MUST NOT rely on a dedicated VPS, external database server (e.g., PostgreSQL/PostGIS), or persistent stateful backends. All spatial computations—including buffer generation, point-in-polygon containment, and distance calculations—MUST execute client-side via `@turf/turf`.

*Rationale: Eliminates infrastructure operational complexity, network latency, CORS hurdles, and runtime hosting costs while enabling rapid Vercel serverless deployments.*

### II. SSR Safety & WebGL Isolation
MapLibre GL and any browser-only APIs (such as `window`, `document`, and WebGL canvas contexts) MUST NEVER execute during Server-Side Rendering (SSR). Map container components MUST be wrapped with Next.js dynamic imports disabling SSR (`dynamic(() => import(...), { ssr: false })`). Coordinates across all layers, utilities, and states MUST strictly adhere to the GIS standard `[longitude, latitude]`.

*Rationale: Next.js 16 App Router renders components on the server by default. Attempting to evaluate MapLibre GL on Node.js runtimes causes fatal hydration and runtime crashes.*

### III. Strict Schema Contracts & Single Source of Truth
All administrative boundaries, demographics, e-commerce indices, and POI records MUST strictly adhere to TypeScript interfaces declared in `src/types/market.ts`. Relational linking between geometry files and tabular metrics MUST occur solely through the official administrative code (`code`). GeoJSON polygons MUST be pre-simplified using `mapshaper` to keep initial bundle sizes lightweight.

*Rationale: Decoupling geometric boundaries from statistical attributes ensures modular parallel development and prevents payload bloat across the 4 core data layers.*

### IV. Atomic State Management & 60fps Performance
Application state MUST be centralized in Zustand (`src/store/useMapStore.ts`) and accessed strictly through atomic, granular selectors (e.g., `useMapStore(state => state.selectedRegion)`). Components MUST NOT destructure the entire store. Large GeoJSON feature collections MUST NEVER be stored in the Zustand store state; only identifiers, filter criteria, and lightweight metrics belong in store memory.

*Rationale: Unnecessary component re-renders degrade WebGL rendering frames below the target 60fps, degrading user experience during interactive zoom and pan operations.*

### V. Grounded AI Decision Advisory
AI decision support and market consulting MUST be executed via Next.js Route Handlers (`src/app/api/analyze/route.ts`) utilizing the Vercel AI SDK and Google Gemini 2.5 Flash API. Prompts MUST be deterministically grounded in real quantitative data from the active region's demographics, EBI metrics, and POI density. The AI MUST provide actionable business insights (e.g., optimal retail formats, logistics fulfillment strategies) and fail gracefully with structured fallback messages if the upstream API is unavailable.

*Rationale: Ensures strategic recommendations remain credible, verifiable, and directly anchored in geospatial evidence rather than speculative hallucinations.*

## Technology Stack & Architectural Constraints

1. **Framework & Language:** Next.js 16 (App Router, Turbopack), React 19, TypeScript with strict type-checking enabled. Route handlers and dynamic params MUST handle asynchronous resolution.
2. **Interactive Mapping:** MapLibre GL v6 with `react-map-gl`, utilizing free vector basemap styles (CartoDB Positron / OpenFreeMap).
3. **Styling & Design System:** Tailwind CSS v4 (`@theme inline`), shadcn/ui accessible component primitives, Lucide React icons, and Recharts for statistical visualizers.
4. **Spatial & Decision Tooling:** `@turf/turf` for client-side spatial queries, Fuse.js for fuzzy administrative search, and Vercel AI SDK for LLM integration.
5. **Layout Standard:** Fixed `100vh` full-bleed viewport layout with floating controls, responsive drawers, and accessible color ramps (Choropleth 2D and 3D Extrusion).

## Development Workflow & Quality Gates

1. **Vertical Slice Development:** Team members maintain modular ownership across the four data layers (`boundaries/`, `demographics.json`, `ecommerce.json`, `pois.geojson`) and their corresponding UI components to minimize merge conflicts.
2. **Quality Gates (Pre-Merge & CI):**
   - `pnpm run lint`: Zero ESLint errors or unescaped entities.
   - `pnpm run build`: Strict TypeScript type-check and successful Next.js production build without warnings.
   - Data Contract Validation: All JSON and GeoJSON fixtures MUST validate against `src/types/market.ts` before committing.
3. **Interactive Scenario Testing:** All user flows—including 4-tier administrative drill-down, 1km–10km buffer queries, compare mode, and AI analysis triggers—MUST be manually verified on desktop and mobile viewports before release.

## Governance

1. **Authority:** This Constitution forms the highest engineering and architectural law of the project. It supersedes informal agreements, spontaneous implementations, and unvetted conventions.
2. **Amendment Procedure:** Amendments require explicit review and approval by the Tech Lead. Proposed modifications MUST specify the problem, architectural impact, and migration plan.
3. **Versioning Policy:** The Constitution follows Semantic Versioning (SemVer):
   - **MAJOR:** Incompatible governance alterations, elimination of core architectural constraints (e.g., adding an external database backend).
   - **MINOR:** Addition of new principles, structural sections, or significant governance expansions.
   - **PATCH:** Formatting, clarifications, typo fixes, or non-semantic wording enhancements.
4. **Compliance Review:** All pull requests and code modifications MUST be audited against the core principles outlined herein. Violations of SSR safety, atomic state selectors, or data contracts MUST block merge approval.

**Version**: 1.0.0 | **Ratified**: 2026-11-24 | **Last Amended**: 2026-11-24
