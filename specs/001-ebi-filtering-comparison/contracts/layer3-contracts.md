# Interface Contracts: Layer 3 EBI, Filtering & Region Comparison

**Feature**: `001-ebi-filtering-comparison` | **Date**: 2026-11-26

## 1. Static Dataset Contract (`public/data/ecommerce.json` — Read-Only)

113 pre-populated records conforming to `EcommerceMetric[]`:
- **Loader**: `loadEcommerceIndex(): Promise<Record<string, EcommerceMetric>>` in `src/lib/ecommerceData.ts`
- **Validator**: `validateEcommerceRecords(data: unknown): { valid: boolean; errors: string[] }`
- **Constraint**: `public/data/ecommerce.json` MUST NOT be overwritten or modified at runtime or build time.

## 2. Pure Logic Module Contracts

### `src/lib/ecommerceData.ts`
- `getMetricValue(record: EcommerceMetric | undefined | null, key: EcommerceMetricKey): number | null`
- `computeChoroplethScale(records: EcommerceMetric[], key: EcommerceMetricKey): ChoroplethScale`
- `normalizeCategoryTag(rawCategory: string): 'F&B' | 'Fashion' | 'Tech' | 'FMCG' | 'Other'`
- `formatMetricValue(value: number | null | undefined, key: EcommerceMetricKey, locale: 'vi' | 'en'): string`

### `src/lib/ecommerceFilter.ts`
- `evaluateMarketFilters(recordsByCode: Record<string, EcommerceMetric>, adminLevel: AdminLevel | 'all', criteria: FilterCriteria): { matchedCodes: Set<string>; matchedCount: number; totalCount: number; matchingRecords: EcommerceMetric[] }`

### `src/lib/ecommerceCompare.ts`
- `computeComparisonDelta(a: EcommerceMetric | null | undefined, b: EcommerceMetric | null | undefined, key: EcommerceMetricKey): RegionComparisonDelta`
- `hasAdminLevelMismatch(levelA?: AdminLevel, levelB?: AdminLevel): boolean`

## 3. Component & Store Boundary Contracts

- **Owned UI Components**:
  - `src/components/layers/EcommerceLayer.tsx`: Subscribes atomically to `activeEcommerceMetric`, `matchedRegionCodes`, `isCompareMode`, `layers.ecommerce`. Renders MapLibre paint expressions (`fill-color`, `fill-opacity`), hover tooltip, and click routing.
  - `src/components/search/MarketFilterPanel.tsx` (re-exported via `src/components/filters/MarketFilterPanel.tsx`): Subscribes atomically to `filters`, `setFilters`, `resetFilters`, `matchedRegionCodes`, `flyToRegion`.
  - `src/components/dashboard/ComparePanel.tsx`: Subscribes atomically to `isCompareMode`, `compareRegions`, `setCompareRegions`, `swapCompareRegions`, `clearCompareSlot`, `setCompareMode`.
- **Untouched Team Files**: `BaseMap.tsx`, `BoundaryLayer.tsx`, `PopulationLayer.tsx`, `PoiLayer.tsx`, `/api/analyze/*`.
