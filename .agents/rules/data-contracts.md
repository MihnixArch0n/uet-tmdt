# Data Contracts & GIS Schemas

All data ingested, generated, or modified in this project must strictly comply with the contracts defined in `src/types/market.ts`.

## Data Pipeline Philosophy
- **Static-First:** All datasets reside under `public/data/` as static assets and are fetched via HTTP client `fetch()`.
- **Relational Integrity via Administrative Codes:** Geographic shapes (`boundaries/*.geojson`) and tabular metrics (`demographics.json`, `ecommerce.json`) are decoupled to minimize file size and are linked via `code` (e.g., `"VN-HN"`, `"001"`, `"00001"`).

---

## 1. The 4 Data Layers Architecture

```
public/data/
├── boundaries/
│   ├── country.geojson          # Level 0: Vietnam national border
│   ├── provinces.geojson        # Level 1: 63 Provinces & Municipalities
│   ├── districts-hn.geojson     # Level 2: Districts of key cities
│   └── wards-hn.geojson         # Level 3: Wards/Communes (focus demo areas)
├── demographics.json            # Layer 2: Demographic & population stats
├── ecommerce.json               # Layer 3: Purchasing power & EBI index
└── pois.geojson                 # Layer 4: Logistics hubs, warehouses, retail POIs
```

---

## 2. Layer Specifications & TypeScript Interfaces

### Layer 1: Administrative Boundaries (`boundaries/*.geojson`)
Every boundary GeoJSON Feature MUST contain:
```ts
export type AdminLevel = 'country' | 'province' | 'district' | 'ward';

export interface RegionProperties {
  code: string;            // Standard ISO/GSO administrative code
  name: string;            // Official Vietnamese name (e.g., "Quận Cầu Giấy")
  level: AdminLevel;
  parentCode?: string;     // References parent administrative code
  center: [number, number];// [longitude, latitude]
}
```

### Layer 2: Demographics & Population (`demographics.json`)
```ts
export interface DemographicMetric {
  code: string;                  // FK -> RegionProperties.code
  population: number;            // Total count
  density: number;               // People per km2
  genderRatio: {
    male: number;                // Percentage (0 - 100)
    female: number;              // Percentage (0 - 100)
  };
  ageGroups: {
    under18: number;             // Percentage
    genZ: number;                // 18 - 25 years old (%)
    workingAge: number;          // 26 - 45 years old (%)
    above45: number;             // Above 45 years old (%)
  };
  urbanizationRate: number;      // Urbanization percentage (%)
}
```

### Layer 3: Purchasing Power & E-Commerce Readiness (`ecommerce.json`)
```ts
export interface HotCategory {
  category: string;              // "Fashion" | "FMCG" | "Tech" | "Mom & Baby" | "Cosmetics"
  marketShare: number;           // % of total e-commerce spending in region
  growthRate: number;            // YoY growth %
}

export interface EcommerceMetric {
  code: string;                  // FK -> RegionProperties.code
  ebiScore: number;              // Vietnam E-business Index (VECOM scale 0 - 100)
  avgMonthlyIncome: number;      // VND per capita per month
  monthlyOnlineOrders: number;   // Average orders per online shopper / month
  avgOrderValue: number;         // Average Order Value (AOV in VND)
  topCategories: HotCategory[];
}
```

### Layer 4: Infrastructure POIs (`pois.geojson`)
GeoJSON `FeatureCollection` where each feature is a `Point`:
```ts
export type PoiCategory = 'warehouse' | 'post_office' | 'mall' | 'supermarket' | 'logistics_hub';

export interface PoiProperties {
  id: string;                    // Unique identifier (e.g., "poi_gh_001")
  name: string;                  // Display title
  category: PoiCategory;
  brand?: string;                // "Shopee Express", "GHTK", "ViettelPost", "WinMart", etc.
  address: string;
  regionCode: string;            // FK -> RegionProperties.code
}
```

---

## 3. Data Optimization & Hygiene Rules
1. **Coordinate Precision:** Round longitude and latitude to 5 or 6 decimal places (sufficient for meter-level accuracy, saves up to 40% file size).
2. **GeoJSON Vertex Simplification:** When adding boundary layers, simplify polygons using `mapshaper -simplify 10% keep-shapes` to prevent multi-megabyte bundle bloat.
3. **Foreign Key Completeness:** Any `code` present in `demographics.json` or `ecommerce.json` must have a corresponding boundary feature with matching `code`.
4. **Number Formats:** Financial amounts in VND must be integers (e.g. `15000000`). Percentages must sum to 100 (allowing `±0.5%` for rounding).
