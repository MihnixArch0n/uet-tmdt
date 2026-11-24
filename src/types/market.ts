// ==============================================================================
// CONTRACT TYPE DEFINITIONS FOR E-COMMERCE DIGITAL MAP PROJECT
// Shared schema across all 5 members to prevent integration discrepancies
// ==============================================================================

// 1. Administrative hierarchy levels
export type AdminLevel = 'country' | 'province' | 'district' | 'ward';

// Standard properties for an administrative or geographical unit
export interface RegionProperties {
  code: string;            // Identifier code (e.g. "VN-HN", "001", "00001")
  name: string;            // Region name (e.g. "Hà Nội", "Quận Cầu Giấy")
  level: AdminLevel;
  parentCode?: string;     // Parent administrative code
  center: [number, number]; // [lng, lat]
}

// 2. LAYER 2: Population & Demographics (Owned by Member 3)
export interface DemographicMetric {
  code: string;                  // Foreign key referencing RegionProperties.code
  population: number;            // Total population count
  density: number;               // Population density (people/km2)
  genderRatio: {
    male: number;                // Male %
    female: number;              // Female %
  };
  ageGroups: {
    under18: number;             // Under 18 %
    genZ: number;                // Gen Z (18 - 25) %
    workingAge: number;          // Working age (26 - 45) %
    above45: number;             // Above 45 %
  };
  urbanizationRate: number;      // Urbanization percentage (%)
}

// 3. LAYER 3: Purchasing Power & E-Commerce Readiness (Owned by Member 4)
export interface HotCategory {
  category: string;              // Category name (Fashion, FMCG, Tech, Mom & Baby, etc.)
  marketShare: number;           // Market share percentage (%)
  growthRate: number;            // Growth rate percentage (%)
}

export interface EcommerceMetric {
  code: string;                  // Foreign key referencing RegionProperties.code
  ebiScore: number;              // Vietnam E-business Index score (scale 0-100)
  avgMonthlyIncome: number;      // Average monthly income per capita (VND/month)
  monthlyOnlineOrders: number;   // Average monthly orders per consumer
  avgOrderValue: number;         // Average Order Value (AOV in VND)
  topCategories: HotCategory[];  // Top selling categories
}

// 4. LAYER 4: Logistics Infrastructure & Retail POIs (Owned by Member 5)
export type PoiCategory = 'warehouse' | 'post_office' | 'mall' | 'supermarket' | 'logistics_hub';

export interface PoiProperties {
  id: string;
  name: string;
  category: PoiCategory;
  brand?: string;                // Shopee, Tiki, GHTK, ViettelPost, WinMart, Aeon...
  address: string;
  regionCode: string;            // Parent province or district code
}

export interface PoiFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: PoiProperties;
}

// 5. Site Selection & Buffer Radius Analysis (Owned by Member 5)
export interface SiteAnalysisResult {
  center: [number, number];      // Center coordinates [lng, lat]
  radiusKm: number;              // Buffer radius in km
  estimatedPopulation: number;   // Estimated reachable population within buffer
  competitorCount: number;       // Retail competitor / mall count in area
  logisticsHubCount: number;     // Number of post offices / logistics hubs nearby
  suitabilityScore: number;      // Calculated score (0 - 100)
  recommendations: string[];     // Actionable strategy suggestions
}

// 6. Global Multi-criteria Filter State (Owned by Member 4)
export interface FilterCriteria {
  minPopulation?: number;
  minIncome?: number;
  minEbi?: number;
  selectedCategory?: string;
}

// 7. Layer Visibility State (Managed by Member 1 / Tech Lead)
export interface LayerVisibilityState {
  boundary: boolean;    // Layer 1: Admin boundaries
  demographics: boolean;// Layer 2: Population density (Choropleth/3D)
  ecommerce: boolean;   // Layer 3: Purchasing power & EBI
  pois: boolean;        // Layer 4: Warehouses & Logistics POIs
}
