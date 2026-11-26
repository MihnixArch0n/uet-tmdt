# Research & Technical Decisions: Layer 3 EBI, Filtering & Comparison

**Feature**: `001-ebi-filtering-comparison` | **Date**: 2026-11-26

## 1. Existing Dataset Inspection & Thin Data Loader (`src/lib/ecommerceData.ts`)

- **Observed State**: `public/data/ecommerce.json` already exists with **113 curated records** containing keys `code`, `ebiScore`, `avgMonthlyIncome`, `monthlyOnlineOrders`, `avgOrderValue`, and `topCategories` (Vietnamese labels such as `"FMCG & Mỹ phẩm"`, `"Thời trang & Phụ kiện"`, `"Nhà cửa & Gia dụng"`, `"Công nghệ & Điện tử"`). `totalRetailSales` is not present in the current JSON records.
- **Decision**: Do NOT overwrite or mutate `public/data/ecommerce.json`. Build `src/lib/ecommerceData.ts` as a thin client-side loader/normalizer that:
  1. Fetches `/data/ecommerce.json` once and indexes records into `Record<string, EcommerceMetric>` by `code` for O(1) lookup.
  2. Validates each record against `src/types/market.ts` at runtime/test time.
  3. Treats missing/absent fields (such as `totalRetailSales` when absent, or `null` values) as `null` ("No data") rather than `0`.
  4. Normalizes `topCategories[].category` strings into canonical vertical keys (`'F&B' | 'Fashion' | 'Tech' | 'FMCG'`) for reliable multi-select filtering.
- **Rationale**: Preserves curated team data, prevents merge conflicts on `public/data/ecommerce.json`, and guarantees accurate "No data" handling.
- **Alternatives Considered**: Mutating `ecommerce.json` to add synthetic `totalRetailSales` — rejected per strict data-preservation rules.

## 2. MapLibre Styling & 60fps Performance (`EcommerceLayer.tsx`)

- **Decision**: Drive MapLibre GL choropleth fill colors (and optional 3D `fill-extrusion-height`) and filter-highlight opacity using data-driven `match` / `case` expressions keyed on `['get', 'code']` against the existing boundary GeoJSON source (or a lightweight Layer 3 expression layer), without re-parsing GeoJSON geometries when metrics or filter sliders change.
- **Rationale**: Re-evaluating a MapLibre paint property (`fill-color`, `fill-opacity`) executes on the GPU in <16ms (60fps), whereas rebuilding GeoJSON geometries on every slider drag would cause frame drops. Missing/null codes explicitly resolve to neutral gray (`#9ca3af` light / `#52525b` dark) via fallback in `match`.
- **Alternatives Considered**: `map.setFeatureState()` — requires modifying `BoundaryLayer.tsx` (owned by Member 2) to configure `promoteId` on every GeoJSON source. Using `['match', ['get', 'code'], ...]` works without touching `BoundaryLayer.tsx`.

## 3. Pure Filter Evaluation Engine (`src/lib/ecommerceFilter.ts`)

- **Decision**: Implement `evaluateMarketFilters(recordsByCode, adminLevel, criteria)` as a pure, side-effect-free TypeScript function returning `{ matchedCodes: Set<string>, matchedCount: number, totalCount: number, matchingRecords: EcommerceMetric[] }`.
- **Rationale**: Isolating filter logic in a pure module makes it trivially unit-testable with `node --test` and keeps `MarketFilterPanel.tsx` and `EcommerceLayer.tsx` decoupled and fast (<1ms per evaluation).
- **Alternatives Considered**: Filtering inside React component `useMemo` blocks — harder to unit test and duplicates logic between the panel list and the map layer.

## 4. Compare Mode State Machine (`src/store/useMapStore.ts` & `ComparePanel.tsx`)

- **Decision**: Manage Compare Mode with explicit Zustand state: `isCompareMode: boolean`, `compareRegions: [string | null, string | null]` (plus lightweight metadata cache or `RegionProperties` lookup), and `activeCompareSlot: 0 | 1`.
  - **Normal Mode (`isCompareMode === false`)**: Clicking a region sets `selectedRegion` for `DetailDrawer`.
  - **Compare Mode (`isCompareMode === true`)**: Clicking a region populates Slot A (`[0]`) then Slot B (`[1]`) without overwriting `selectedRegion` or mutating `viewState`. Duplicate `code` selection is rejected with user feedback; differing `AdminLevel`s trigger a non-blocking scale-difference notice.
- **Rationale**: Prevents accidental side-drawer conflicts and preserves the user's exact map viewport when entering/exiting Compare Mode.
- **Alternatives Considered**: Reusing `selectedRegion` as Slot A — couples inspection state with comparison state.

## 5. Unit Testing & Verification Strategy

- **Decision**: Add `tests/ecommerce.test.ts` using Node's built-in test runner (`node --test`) to verify:
  1. `evaluateMarketFilters` (EBI range, income range, multi-select category OR logic, empty results, null handling).
  2. `computeComparisonDelta` (positive/negative deltas, `null` -> `"na"`, zero baseline `valueB === 0` -> `pctDiff: null` without `Infinity`/`NaN`).
  3. Schema validation of every record in `public/data/ecommerce.json` against `src/types/market.ts`.
- **Rationale**: Zero new heavy test-runner dependencies required, fast execution in CI/local, and full coverage of business-critical math and data contracts.
