import * as turf from '@turf/turf';
import { SiteAnalysisResult } from '@/types/market';

/**
 * Calculates demographic reach and competitive landscape within a given buffer radius.
 * Owned and customized by Member 5.
 */
export function analyzeSiteBuffer(
  centerLngLat: [number, number],
  radiusKm: number,
  poisGeoJson?: GeoJSON.FeatureCollection
): SiteAnalysisResult {
  const centerPoint = turf.point(centerLngLat);
  const bufferedCircle = turf.circle(centerPoint, radiusKm, { units: 'kilometers' });

  let competitorCount = 0;
  let logisticsHubCount = 0;

  if (poisGeoJson && poisGeoJson.features) {
    poisGeoJson.features.forEach((feature) => {
      if (feature.geometry.type === 'Point') {
        const isInside = turf.booleanPointInPolygon(
          feature.geometry as GeoJSON.Point,
          bufferedCircle
        );
        if (isInside) {
          const cat = feature.properties?.category;
          if (cat === 'mall' || cat === 'supermarket') competitorCount++;
          if (cat === 'warehouse' || cat === 'post_office' || cat === 'logistics_hub') logisticsHubCount++;
        }
      }
    });
  }

  // Preliminary estimation based on buffer area (Member 5 can refine formula)
  const estimatedPopulation = Math.round(Math.PI * Math.pow(radiusKm, 2) * 2800);
  const suitabilityScore = Math.min(
    95,
    Math.round(40 + (logisticsHubCount * 12) + (estimatedPopulation / 10000) * 5 - competitorCount * 4)
  );

  return {
    center: centerLngLat,
    radiusKm,
    estimatedPopulation,
    competitorCount,
    logisticsHubCount,
    suitabilityScore: Math.max(20, suitabilityScore),
    recommendations: [
      `Estimated reachable population: ~${estimatedPopulation.toLocaleString()} people within ${radiusKm}km.`,
      logisticsHubCount > 0 
        ? `Advantage: Found ${logisticsHubCount} active logistics hubs/post offices in area.`
        : 'Warning: No existing logistics/post office infrastructure found nearby.',
      competitorCount > 2
        ? 'High competition: Multiple established retail centers/malls nearby.'
        : 'Opportunity: Low direct commercial retail competition.'
    ]
  };
}
