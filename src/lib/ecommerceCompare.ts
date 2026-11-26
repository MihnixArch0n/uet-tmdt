import type {
  AdminLevel,
  EcommerceMetric,
  EcommerceMetricKey,
  RegionComparisonDelta,
} from '@/types/market';
import { getMetricValue } from './ecommerceData';

/**
 * Safely computes absolute and percentage differences between Region A and Region B.
 * Handles `null` ("No data") and zero-baseline (`valueB === 0`) without NaN/Infinity.
 */
export function computeComparisonDelta(
  a: EcommerceMetric | null | undefined,
  b: EcommerceMetric | null | undefined,
  key: EcommerceMetricKey
): RegionComparisonDelta {
  const valueA = getMetricValue(a, key);
  const valueB = getMetricValue(b, key);

  if (valueA === null || valueB === null) {
    return {
      metric: key,
      valueA,
      valueB,
      absDiff: null,
      pctDiff: null,
      leader: 'na',
    };
  }

  const absDiff = valueA - valueB;
  const pctDiff = valueB === 0 ? null : ((valueA - valueB) / valueB) * 100;
  const leader: RegionComparisonDelta['leader'] =
    valueA > valueB ? 'A' : valueB > valueA ? 'B' : 'tie';

  return {
    metric: key,
    valueA,
    valueB,
    absDiff,
    pctDiff,
    leader,
  };
}

/**
 * Checks whether two compared regions belong to different administrative tiers.
 */
export function hasAdminLevelMismatch(
  levelA?: AdminLevel,
  levelB?: AdminLevel
): boolean {
  if (!levelA || !levelB) return false;
  return levelA !== levelB;
}
