# Data Model: Layer 3 Purchasing Power, EBI, Filtering & Region Comparison

**Feature**: `001-ebi-filtering-comparison` | **Date**: 2026-11-26

## 1. Shared Schema Extensions (`src/types/market.ts` — Additive & Backwards-Compatible)

### `EcommerceMetricKey`
```ts
export type EcommerceMetricKey = 'ebiScore' | 'avgMonthlyIncome' | 'totalRetailSales';
```

### `EcommerceMetric` (Existing + Optional Additive Field)
Linked to `RegionProperties` via `code`:
- `code: string` — Standardized administrative region code (`"VN-HN"`, `"001"`, `"00001"`, `"VN"`).
- `ebiScore: number` (or `number | null` when missing) — VECOM E-Business Index (0–100).
- `avgMonthlyIncome: number` (or `number | null` when missing) — Average monthly income per capita (VND/month).
- `totalRetailSales?: number | null` — Optional macro-level total retail sales (Billion VND); `null`/`undefined` renders as `"No data"`.
- `monthlyOnlineOrders: number` — Average monthly online orders per consumer.
- `avgOrderValue: number` — Average Order Value (VND).
- `topCategories: HotCategory[]` — Ranked potential online product categories (`category`, `marketShare`, `growthRate`).

### `MarketFilterCriteria` / `FilterCriteria` (Backwards-Compatible Extension)
- `minEbi?: number` / `maxEbi?: number` — EBI score bounds (0–100).
- `minIncome?: number` / `maxIncome?: number` — Average monthly income bounds (VND/month).
- `selectedCategories?: string[]` — Multi-select product verticals (`'F&B'`, `'Fashion'`, `'Tech'`, `'FMCG'`).
- `minPopulation?: number` & `selectedCategory?: string` — Retained for backwards compatibility.

### `CompareSelection` & `RegionComparisonDelta`
- `CompareSelection`: `[string | null, string | null]` (administrative `code` tuple for Slot A and Slot B).
- `RegionComparisonDelta`:
  - `metric: EcommerceMetricKey`
  - `valueA: number | null`
  - `valueB: number | null`
  - `absDiff: number | null` (`valueA - valueB`)
  - `pctDiff: number | null` (`((valueA - valueB) / valueB) * 100`, or `null` when `valueB === 0` or either value is `null`)
  - `leader: 'A' | 'B' | 'tie' | 'na'`

## 2. Zustand Store State (`src/store/useMapStore.ts` — Layer 3 Slices)

| Slice Field | Type | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `activeEcommerceMetric` | `EcommerceMetricKey` | `'ebiScore'` | Active Layer 3 choropleth metric |
| `filters` | `FilterCriteria` | `{}` | Multi-criteria filter bounds & categories |
| `matchedRegionCodes` | `string[] \| null` | `null` | `null` when unfiltered; array of matching `code`s when filtered |
| `isCompareMode` | `boolean` | `false` | Toggles Compare Mode state machine |
| `compareRegions` | `[string \| null, string \| null]` | `[null, null]` | Slot A and Slot B administrative `code`s |
| `compareRegion` | `RegionProperties \| null` | `null` | Retained for backwards compatibility |

## 3. Validation & State Rules

- **O(1) Indexing**: `src/lib/ecommerceData.ts` indexes `public/data/ecommerce.json` into `Record<string, EcommerceMetric>` keyed by `code`.
- **Null vs. Zero**: `0` is a valid value; `null` or `undefined` displays `"No data"` and maps to neutral gray on the choropleth.
- **Compare Uniqueness**: `compareRegions[0] !== compareRegions[1]`; duplicate assignment is rejected with user feedback.
- **Scale Parity**: If Slot A and Slot B have differing administrative levels, `ComparePanel` displays a clear scale-difference warning.
- **Viewport Preservation**: Toggling `isCompareMode` never mutates `viewState`.
