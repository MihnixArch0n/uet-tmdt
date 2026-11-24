# Zustand State Management Guidelines

This rulebook defines state architecture, store subscriptions, and synchronization conventions across the application.

## Central Store Location
- **Primary Store:** `src/store/useMapStore.ts`
- **State Management Engine:** `zustand` (v5+)

---

## 1. Store Architecture & Domains

The store handles 7 interconnected functional domains:

1. **Theme & Localization:**
   - `theme` (`'light' | 'dark'`), `setTheme`, `toggleTheme` (persisted in `localStorage['app_theme']`).
   - `language` (`'vi' | 'en'`), `setLanguage` (persisted in `localStorage['app_lang']`).
2. **Camera & Viewport:**
   - `viewState`: `{ longitude, latitude, zoom, pitch, bearing }`.
   - `flyToRegion(center, zoom?)`: Smoothly moves the map camera to the target coordinates.
3. **Layer Visibility:**
   - `layers`: Flags for `boundary`, `demographics`, `ecommerce`, `pois`.
   - `toggleLayer(layerKey)` / `setLayer(layerKey, visible)`.
4. **Active Region Inspection:**
   - `selectedRegion`: Currently selected region metadata (`RegionProperties`).
   - `selectedDemographics`: Accompanying demographic data (`DemographicMetric`).
   - `selectedEcommerce`: Accompanying e-commerce metrics (`EcommerceMetric`).
   - `setSelectedRegion(region, demo?, ecom?)`: Synchronizes the right-side `DetailDrawer`.
5. **Comparison Mode:**
   - `isCompareMode`, `compareRegion`, `setCompareRegion`: Compares two regions side-by-side.
6. **Multi-criteria Market Filters:**
   - `filters`: `{ minPopulation, minIncome, minEbi, selectedCategory }`.
   - `setFilters(partial)`, `resetFilters()`.
7. **Spatial Decision & Site Selection:**
   - `isSiteSelectionActive`, `siteRadiusKm`, `lastSiteAnalysis`.
   - `setLastSiteAnalysis(result: SiteAnalysisResult | null)`.
8. **AI Strategic Consultant:**
   - `isAiModalOpen`, `setAiModalOpen(boolean)`.

---

## 2. Component Subscription Rules (Performance Critical)

### Atomic Selectors
Always subscribe using atomic selector functions. **Never** destructure the entire store object at component level, as this causes the entire UI to re-render on any map movement.

```tsx
// ✅ CORRECT: Re-renders ONLY when `selectedRegion` changes
const selectedRegion = useMapStore((state) => state.selectedRegion);
const setSelectedRegion = useMapStore((state) => state.setSelectedRegion);

// ❌ WRONG: Re-renders on EVERY viewport change, layer toggle, or filter update
const { selectedRegion, viewState, layers } = useMapStore();
```

---

## 3. State Invariants & Safety Protocols
1. **No Heavy Geometries in State:**
   - Do NOT store large GeoJSON feature collections or polygon coordinates in Zustand.
   - Store only lightweight IDs, codes, bounding boxes, or statistical metric objects.
   - Large geometries belong in static files or WebGL source caches.
2. **SSR Guard on Initial State:**
   - When reading `window` or `localStorage` during store initialization, always guard with `typeof window !== 'undefined'` fallback to prevent Next.js hydration mismatches.
3. **Layer Interlocking:**
   - When switching visual modes (e.g. toggling between Population Choropleth and Ecommerce EBI Heatmap), maintain consistent base boundaries so the user does not experience map flash.
4. **Camera Synchronization:**
   - Use `onMove={(evt) => setViewState(evt.viewState)}` in `<Map>` to keep Zustand's `viewState` synced with user pan/zoom gestures.
