# Implementation Plan: Layer 3 Purchasing Power, EBI, Market Filter & Compare Mode

**Branch**: `001-ebi-filtering-comparison` | **Date**: 2026-11-26 | **Spec**: [spec.md](file:///home/phdoanh/projects/personal/uet-tmdt/specs/001-ebi-filtering-comparison/spec.md)

**Input**: Feature specification from `/specs/001-ebi-filtering-comparison/spec.md` + Member 4 vertical-slice technical constraints.

## Summary

Implement the Layer 3 Purchasing Power, E-Commerce Readiness (EBI), Multi-Criteria Market Filter, and Two-Region Compare Mode within the existing Static-First Next.js GIS application while strictly respecting 5-person vertical-slice file boundaries. The existing curated dataset `public/data/ecommerce.json` (113 records) is loaded and indexed client-side by `src/lib/ecommerceData.ts` for O(1) lookup by administrative `code` without mutating the source JSON. `EcommerceLayer.tsx` drives MapLibre GL 2D choropleth fills (and optional 3D extrusion) plus filter-highlight opacity via GPU data-driven `match`/`case` expressions at 60fps. `src/lib/ecommerceFilter.ts` evaluates multi-criteria filters (`ebiScore`, `avgMonthlyIncome`, multi-select `topCategories`) purely client-side, feeding `MarketFilterPanel.tsx`, while `ComparePanel.tsx` renders side-by-side metrics, Recharts/delta bars, safe `null`/zero-division delta math, and administrative-level mismatch warnings.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) on Next.js 16.4.6 (App Router, Turbopack) + React 19.3.0  
**Primary Dependencies**: `maplibre-gl` (^6.19.0), `react-map-gl` (^8.1.3), `zustand` (^5.1.0), `recharts` (^3.11.0), `lucide-react` (^1.77.0), Tailwind CSS v4 (`@tailwindcss/turbopack` 4.3.3), shadcn/ui primitives  
**Storage**: Static JSON (`public/data/ecommerce.json` — 113 pre-populated records, read-only) joined client-side with boundary GeoJSONs via administrative `code`; no backend database  
**Testing**: `pnpm run lint`, `pnpm run build`, and Node built-in test runner (`node --test`) unit tests for `ecommerceFilter.ts`, delta/percentage math, and `ecommerce.json` schema validation  
**Target Platform**: Modern desktop and mobile web browsers (WebGL-enabled), deployed on Vercel Serverless  
**Project Type**: Client-centric static-first Next.js web application (5-person vertical slice)  
**Performance Goals**: 60fps MapLibre pan/zoom/slider updates; <500ms metric switching, filter evaluation, and comparison updates with zero page reloads  
**Constraints**:
- **File Ownership**: Restrict primary implementation to Member 4 paths (`src/components/layers/EcommerceLayer.tsx`, `src/components/dashboard/ComparePanel.tsx`, `src/components/search/MarketFilterPanel.tsx`, `src/lib/ecommerce*.ts`). Do NOT overwrite `public/data/ecommerce.json`. Do NOT modify `BaseMap.tsx`, `BoundaryLayer.tsx`, `PopulationLayer.tsx`, `PoiLayer.tsx`, or `/api/analyze/*`.
- **Shared Contracts**: Minimal, backwards-compatible additive updates only in `src/types/market.ts` and `src/store/useMapStore.ts`.
- **SSR & State**: No MapLibre/browser APIs during SSR; atomic Zustand selectors only; no GeoJSON feature collections in Zustand.
**Scale/Scope**: 113 administrative records in `public/data/ecommerce.json` (provinces + HN/HCMC districts/wards + `VN`), 3 thematic metrics (`ebiScore`, `avgMonthlyIncome`, `totalRetailSales` where available), 4 product category verticals (`F&B`, `Fashion`, `Tech`, `FMCG`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Status | Compliance Notes |
| :--- | :--- | :--- |
| **I. Static-First & Zero-Backend GIS** | PASS | Reads existing `public/data/ecommerce.json` statically; all indexing, filtering, choropleth expressions, and delta math execute 100% client-side. |
| **II. SSR Safety & WebGL Isolation** | PASS | `EcommerceLayer` runs inside `BaseMap` (`ssr: false` dynamic import); `ComparePanel` and `MarketFilterPanel` are `'use client'` components with no SSR browser globals. |
| **III. Strict Schema Contracts & Single Source of Truth** | PASS | Additive types (`EcommerceMetricKey`, `MarketFilterCriteria`, `CompareSelection`) extend `src/types/market.ts` backwards-compatibly; joins use `code` exclusively. |
| **IV. Atomic State Management & 60fps Performance** | PASS | All components use atomic Zustand selectors (`useMapStore(s => s.xxx)`); store holds only `code` strings, `FilterCriteria`, and lightweight `RegionProperties`/`EcommerceMetric` summaries. MapLibre `match` expressions update fills/opacity on GPU without re-parsing GeoJSON. |
| **V. Grounded AI Decision Advisory** | PASS | `selectedEcommerce` stays populated in `useMapStore` and untouched `/api/analyze/*` remains compatible. |

*Post-Design Re-Check*: Verified after Phase 1 artifacts — no violations, no team-boundary conflicts.

## Project Structure

### Documentation (this feature)

```text
specs/001-ebi-filtering-comparison/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── layer3-contracts.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root — Member 4 Vertical Slice)

```text
public/data/
└── ecommerce.json                       # READ-ONLY: Existing 113 curated records (do NOT overwrite/fabricate)

src/
├── types/
│   └── market.ts                        # Shared Contract (additive only): EcommerceMetricKey, MarketFilterCriteria, CompareSelection
├── store/
│   └── useMapStore.ts                   # Shared Store (Layer 3 slices only): activeEcommerceMetric, filters, matchedRegionCodes, isCompareMode, compareRegions
├── lib/
│   ├── ecommerceData.ts                 # Thin loader, O(1) index by `code`, runtime schema validator, choropleth scale builder
│   ├── ecommerceFilter.ts               # Pure, unit-testable multi-criteria filter engine -> matched `code` Set & stats
│   ├── ecommerceCompare.ts              # Pure delta/percentage math (null & zero-division safe) + admin level parity check
│   └── i18n/
│       └── translations.ts              # Additive Layer 3 EN/VI labels (metrics, filters, Compare Mode, "No data")
└── components/
    ├── layers/
    │   └── EcommerceLayer.tsx           # MapLibre choropleth fill/line/extrusion expressions, filter highlight mask, hover/click hooks
    ├── dashboard/
    │   └── ComparePanel.tsx             # Side-by-side 2-region comparison drawer/modal with Recharts/delta bars & category badges
    ├── search/
    │   └── MarketFilterPanel.tsx        # Multi-criteria filter UI (EBI range, income range, category multi-select, count, list, reset)
    └── filters/
        └── MarketFilterPanel.tsx        # Thin re-export of @/components/search/MarketFilterPanel (preserves existing Navbar import without editing Navbar)

tests/
└── ecommerce.test.ts                    # Unit tests: filter engine, delta/pct math, and public/data/ecommerce.json schema validation
```

**Structure Decision**: Strictly scoped to Member 4's vertical slice (`EcommerceLayer.tsx`, `dashboard/ComparePanel.tsx`, `search/MarketFilterPanel.tsx`, and `src/lib/ecommerce*.ts`) with zero edits to `BaseMap.tsx`, `BoundaryLayer.tsx`, `PopulationLayer.tsx`, `PoiLayer.tsx`, or `/api/analyze/*`. Re-exporting `src/components/search/MarketFilterPanel.tsx` from `src/components/filters/MarketFilterPanel.tsx` keeps existing imports working seamlessly.

## Complexity Tracking

> No Constitution Check violations; no complexity exceptions required.
