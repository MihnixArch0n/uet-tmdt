# Quickstart Validation Guide: Layer 3 EBI, Filtering & Region Comparison

**Feature**: `001-ebi-filtering-comparison` | **Date**: 2026-11-26

## Prerequisites

- Node.js 20+ and `pnpm` v12+ installed
- Dependencies installed via `pnpm install`
- `public/data/ecommerce.json` intact (113 records, unmodified)

## Automated Quality Gates & Unit Tests

```bash
# 1. Run Layer 3 unit tests (filter engine, delta math, ecommerce.json schema validation)
node --test tests/ecommerce.test.ts

# 2. Run ESLint and strict TypeScript + Next.js production build
pnpm run lint && pnpm run build
```

All commands MUST exit with code `0`.

## Interactive Validation Scenarios (`pnpm run dev` at `http://localhost:3000`)

1. **Choropleth & "No Data" (US1)**: Enable Layer 3 (`ecommerce`), switch between EBI, Average Monthly Income, and Total Retail Sales; verify <500ms color & legend updates, hover tooltips, region breakdown, and neutral-gray `"No data"` rendering where a metric is unavailable.
2. **Multi-Criteria Market Filter (US2)**: Open `MarketFilterPanel`, combine EBI range + Income range + multi-select categories; verify map highlight/dimming, live `"X / Y match"` count, clickable focus list, empty-state message on zero matches, and one-click Reset.
3. **Two-Region Compare Mode (US3)**: Toggle Compare Mode on, assign Region A & Region B via map click or selector, verify deltas & leader badges, test duplicate-region prevention, test cross-level scale warning, test Swap & Clear, and exit Compare Mode verifying exact viewport preservation.
