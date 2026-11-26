---

description: "Task list for Layer 3 Purchasing Power, EBI, Market Filter & Compare Mode"
---

# Tasks: Layer 3 Purchasing Power, EBI, Market Filter & Compare Mode

**Input**: Design documents from `/specs/001-ebi-filtering-comparison/`  
**Prerequisites**: [plan.md](file:///home/phdoanh/projects/personal/uet-tmdt/specs/001-ebi-filtering-comparison/plan.md), [spec.md](file:///home/phdoanh/projects/personal/uet-tmdt/specs/001-ebi-filtering-comparison/spec.md), [research.md](file:///home/phdoanh/projects/personal/uet-tmdt/specs/001-ebi-filtering-comparison/research.md), [data-model.md](file:///home/phdoanh/projects/personal/uet-tmdt/specs/001-ebi-filtering-comparison/data-model.md), [layer3-contracts.md](file:///home/phdoanh/projects/personal/uet-tmdt/specs/001-ebi-filtering-comparison/contracts/layer3-contracts.md)

**Tests**: Unit tests are included for filter logic, safe `null`/zero-division delta math, and `public/data/ecommerce.json` schema validation as specified in `plan.md` and `quickstart.md`.

**Organization**: Tasks are grouped by user story (P1 → P2 → P3) so each story is independently implementable and testable while respecting Member 4 vertical-slice file boundaries (do NOT modify `public/data/ecommerce.json`, `BaseMap.tsx`, `BoundaryLayer.tsx`, `PopulationLayer.tsx`, `PoiLayer.tsx`, or `/api/analyze/*`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes exact file paths and cites `data-model.md` `Entity.field` constraints where applicable

---

## Phase 1: Setup (Shared Contracts & Localization)

**Purpose**: Establish backwards-compatible TypeScript schemas, Zustand Layer 3 state slices, and EN/VI translation keys before story implementation.

- [ ] T001 Add backwards-compatible `EcommerceMetricKey`, `CompareSelection`, `RegionComparisonDelta`, nullable `EcommerceMetric.ebiScore` / `EcommerceMetric.avgMonthlyIncome` / `EcommerceMetric.totalRetailSales`, and `FilterCriteria.maxEbi` / `FilterCriteria.minIncome` / `FilterCriteria.maxIncome` / `FilterCriteria.selectedCategories` (per `data-model.md`) in `src/types/market.ts`
- [ ] T002 [P] Add Layer 3 state slices (`activeEcommerceMetric`, `matchedRegionCodes`, `isCompareMode`, `compareRegions`, `activeCompareSlot`, `assignCompareRegion`, `swapCompareRegions`, `clearCompareSlot`) with viewport-preserving `setCompareMode` (per `data-model.md` Store State) in `src/store/useMapStore.ts`
- [ ] T003 [P] Add EN/VI localization strings for EBI, Monthly Income, Total Retail Sales, `"No data"` / `"Chưa có dữ liệu"`, Market Filter controls, and Compare Mode labels in `src/lib/i18n/translations.ts`

---

## Phase 2: Foundational (Static Data Loader & Schema Validation)

**Purpose**: Build the thin client-side data loader/normalizer and O(1) `code` index over the existing read-only `public/data/ecommerce.json` (113 records).

**⚠️ CRITICAL**: No user story UI work can begin until this phase is complete.

- [ ] T004 Implement client-side loader `loadEcommerceIndex()`, `validateEcommerceRecords()`, `getMetricValue()`, `computeChoroplethScale()`, `normalizeCategoryTag()`, and `formatMetricValue()` handling `EcommerceMetric.code`, `EcommerceMetric.ebiScore`, `EcommerceMetric.avgMonthlyIncome`, `EcommerceMetric.totalRetailSales`, and `EcommerceMetric.topCategories` (per `data-model.md` and `contracts/layer3-contracts.md`) without mutating `public/data/ecommerce.json` in `src/lib/ecommerceData.ts`
- [ ] T005 [P] Add schema validation unit tests verifying all 113 records in `public/data/ecommerce.json` against `EcommerceMetric` and confirming `null`/missing `totalRetailSales` never coerces to `0` in `tests/ecommerce.test.ts`

**Checkpoint**: Foundation ready — `public/data/ecommerce.json` is indexed O(1) by `code` and validated. User stories can now proceed.

---

## Phase 3: User Story 1 - Purchasing Power & EBI Map Visualization (Priority: P1) 🎯 MVP

**Goal**: Enable switching between EBI, Average Monthly Income, and Total Retail Sales choropleth modes on the map with dynamic legend thresholds, concise hover tooltips, region economic breakdown, and explicit neutral-gray `"No data"` handling.

**Independent Test**: Toggle Layer 3 on, switch across all 3 metrics, verify <500ms map colors & legend updates, hover regions with data and missing data (`"No data"`), and click a region to inspect its Layer 3 breakdown.

### Implementation for User Story 1

- [ ] T006 [US1] Implement MapLibre GL data-driven choropleth `fill-color` (including neutral gray fallback for `null` values per `data-model.md` Null vs. Zero rule) and `fill-opacity` expressions keyed on `['get', 'code']` for `EcommerceMetricKey`, plus hover tooltip and click-to-select routing using atomic Zustand selectors in `src/components/layers/EcommerceLayer.tsx`
- [ ] T007 [P] [US1] Update `MapLegend` with atomic `useMapStore` selectors to display the active `EcommerceMetricKey` title, unit, dynamic 5-stop min/max range thresholds from `computeChoroplethScale()`, and a neutral-gray `"No data"` swatch in `src/components/map/MapLegend.tsx`
- [ ] T008 [P] [US1] Add Layer 3 metric selector (`ebiScore`, `avgMonthlyIncome`, `totalRetailSales`) visible when `layers.ecommerce` is enabled using atomic Zustand selectors in `src/components/map/LayerControl.tsx`
- [ ] T009 [US1] Update `DetailDrawer` with atomic Zustand selectors to display `selectedEcommerce.ebiScore`, `selectedEcommerce.avgMonthlyIncome`, `selectedEcommerce.totalRetailSales` (or `"No data"`), and `selectedEcommerce.topCategories` badges in `src/components/analytics/DetailDrawer.tsx`

**Checkpoint**: User Story 1 (MVP) is fully functional and independently testable.

---

## Phase 4: User Story 2 - Multi-Criteria Market Filter (Priority: P2)

**Goal**: Allow users to filter regions simultaneously by EBI range, Average Monthly Income range, and multi-select product categories (`F&B`, `Fashion`, `Tech`, `FMCG`), highlighting matching regions and dimming non-matching regions on the map with live counts, clickable focus list, empty state, and one-click reset.

**Independent Test**: Open Market Filter panel, combine EBI + Income + Category filters, verify map highlight/dimming and live match count, click a matched region to focus, test zero-match empty state, and click Reset Filters.

### Tests for User Story 2

- [ ] T010 [P] [US2] Add unit tests for `evaluateMarketFilters()` covering `FilterCriteria.minEbi`/`maxEbi`, `FilterCriteria.minIncome`/`maxIncome`, inclusive-OR `FilterCriteria.selectedCategories`, `null` metric exclusion, and empty result sets in `tests/ecommerce.test.ts`

### Implementation for User Story 2

- [ ] T011 [US2] Implement pure filter evaluation engine `evaluateMarketFilters()` returning `matchedCodes`, `matchedCount`, `totalCount`, and `matchingRecords` (per `data-model.md` `FilterCriteria` and `contracts/layer3-contracts.md`) in `src/lib/ecommerceFilter.ts`
- [ ] T012 [US2] Build `MarketFilterPanel` with EBI min/max inputs, Income min/max inputs, multi-select category pills (`F&B`, `Fashion`, `Tech`, `FMCG`), live `"X / Y match"` counter, clickable matched region list (`flyToRegion`), empty-state message, and single-click Reset button using atomic Zustand selectors in `src/components/search/MarketFilterPanel.tsx`
- [ ] T013 [P] [US2] Replace legacy filter panel implementation with a clean re-export of `@/components/search/MarketFilterPanel` to preserve existing `Navbar` imports without modifying `Navbar.tsx` in `src/components/filters/MarketFilterPanel.tsx`
- [ ] T014 [US2] Wire `matchedRegionCodes` into `EcommerceLayer` MapLibre `fill-opacity` and highlight border expressions so matching regions stand out (`0.82` opacity) and non-matching regions dim (`0.15` opacity) at 60fps in `src/components/layers/EcommerceLayer.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently and together without page reloads.

---

## Phase 5: User Story 3 - Two-Region Comparison Mode (Priority: P3)

**Goal**: Enable toggling Compare Mode to select two distinct regions (Slot A and Slot B) via map click or dropdown selector, inspecting side-by-side metrics, Recharts/delta bars, absolute and percentage differences with leader badges, swapping/clearing slots, duplicate-selection prevention, administrative-level mismatch warnings, and viewport preservation on exit.

**Independent Test**: Toggle Compare Mode, select Region A & Region B via map click and selector, verify deltas and leader highlights, attempt duplicate selection, test cross-level warning, swap/clear slots, and exit Compare Mode verifying unchanged map viewport.

### Tests for User Story 3

- [ ] T015 [P] [US3] Add unit tests for `computeComparisonDelta()` and `hasAdminLevelMismatch()` verifying `RegionComparisonDelta.absDiff`, `RegionComparisonDelta.pctDiff`, `RegionComparisonDelta.leader`, `null` -> `"na"`, and `valueB === 0` zero-division safety in `tests/ecommerce.test.ts`

### Implementation for User Story 3

- [ ] T016 [US3] Implement pure comparison helpers `computeComparisonDelta()` and `hasAdminLevelMismatch()` (per `data-model.md` `RegionComparisonDelta` & Scale Parity rules) in `src/lib/ecommerceCompare.ts`
- [ ] T017 [US3] Build `ComparePanel` with Slot A & Slot B region selectors, duplicate-region warning, cross-level (`AdminLevel`) scale-difference banner, side-by-side EBI / Income / Retail Sales / Top Categories display, Recharts/Tailwind comparison bars, delta/leader badges, Swap, Clear Slot, and Exit buttons using atomic Zustand selectors in `src/components/dashboard/ComparePanel.tsx`
- [ ] T018 [US3] Update `EcommerceLayer` click handler to route polygon clicks to `assignCompareRegion()` when `isCompareMode === true` (without overwriting `selectedRegion` or `viewState`) and render distinct Slot A / Slot B outline highlights in `src/components/layers/EcommerceLayer.tsx`
- [ ] T019 [US3] Mount `ComparePanel` and expose Compare Mode toggle trigger cleanly in `src/app/page.tsx` and `src/components/layout/Navbar.tsx` (minimal coordination-only wiring; do NOT alter unrelated layout/nav items)

**Checkpoint**: All 3 user stories (Choropleth, Market Filter, Compare Mode) are independently functional and integrated.

---

## Phase 6: Polish & Cross-Cutting Verification

**Purpose**: Finalize unit test execution, static analysis, production build, and end-to-end validation.

- [ ] T020 Run Layer 3 unit test suite `node --test tests/ecommerce.test.ts` and fix any failing assertions
- [ ] T021 Run `pnpm run lint && pnpm run build` and verify zero ESLint warnings/errors and clean TypeScript production build
- [ ] T022 Verify all interactive scenarios in `specs/001-ebi-filtering-comparison/quickstart.md` and confirm `git status` shows zero unintended edits to `public/data/ecommerce.json`, `BaseMap.tsx`, `BoundaryLayer.tsx`, `PopulationLayer.tsx`, `PoiLayer.tsx`, or `/api/analyze/*`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately (`T001`, `T002`, `T003` can run in parallel).
- **Phase 2 (Foundational)**: Depends on `T001` — BLOCKS all user stories (`T004`, then `T005` in parallel/immediately after).
- **Phase 3 (US1 - Choropleth)**: Depends on Phase 2 (`T006`–`T009`, where `T007` and `T008` are parallelizable).
- **Phase 4 (US2 - Market Filter)**: Depends on Phase 2; `T014` integrates into `EcommerceLayer.tsx` after `T006`. `T010`, `T011`, `T012`, `T013` can proceed in parallel with or right after US1.
- **Phase 5 (US3 - Compare Mode)**: Depends on Phase 2; `T018` integrates click routing into `EcommerceLayer.tsx` after `T006`. `T015`, `T016`, `T017` can proceed in parallel.
- **Phase 6 (Polish)**: Depends on Phases 3, 4, and 5 completion.

### Parallel Opportunities

```bash
# Phase 1 parallel batch:
T001 (src/types/market.ts) | T002 (src/store/useMapStore.ts) | T003 (src/lib/i18n/translations.ts)

# US1 parallel UI batch (after T004):
T007 (MapLegend.tsx) | T008 (LayerControl.tsx) | T009 (DetailDrawer.tsx)

# US2 parallel logic + test batch:
T010 (tests/ecommerce.test.ts) | T011 (src/lib/ecommerceFilter.ts) | T013 (src/components/filters/MarketFilterPanel.tsx)

# US3 parallel logic + test + UI batch:
T015 (tests/ecommerce.test.ts) | T016 (src/lib/ecommerceCompare.ts) | T017 (src/components/dashboard/ComparePanel.tsx)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (`T001`–`T003`) and Phase 2 (`T004`–`T005`).
2. Complete Phase 3 (`T006`–`T009`).
3. **STOP & VALIDATE**: Test choropleth metric switching, dynamic legend, hover tooltips, `"No data"` rendering, and `DetailDrawer` Layer 3 breakdown.

### Incremental Delivery

1. Foundation (`T001`–`T005`) → O(1) validated Layer 3 data access.
2. Add US1 (`T006`–`T009`) → Choropleth MVP.
3. Add US2 (`T010`–`T014`) → Multi-Criteria Market Filter & map highlight/dimming.
4. Add US3 (`T015`–`T019`) → Two-Region Compare Mode.
5. Run Phase 6 (`T020`–`T022`) → Unit tests, `pnpm run lint`, `pnpm run build`, and `quickstart.md` verification.
