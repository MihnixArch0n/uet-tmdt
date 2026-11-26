import type { AdminLevel, EcommerceMetric, FilterCriteria } from '@/types/market';
import {
  getMetricValue,
  inferAdminLevelFromCode,
  normalizeCategoryTag,
} from './ecommerceData';

export interface MarketFilterResult {
  matchedCodes: Set<string>;
  matchedCount: number;
  totalCount: number;
  matchingRecords: EcommerceMetric[];
}

/**
 * Returns true if any Layer 3 market filter criterion is actively constraining results.
 */
export function hasActiveMarketFilters(criteria: FilterCriteria): boolean {
  return (
    criteria.minEbi !== undefined ||
    criteria.maxEbi !== undefined ||
    criteria.minIncome !== undefined ||
    criteria.maxIncome !== undefined ||
    (Array.isArray(criteria.selectedCategories) && criteria.selectedCategories.length > 0) ||
    Boolean(criteria.selectedCategory)
  );
}

/**
 * Pure, unit-testable multi-criteria market filter engine.
 * Evaluates EBI range, Monthly Income range, and inclusive-OR product category tags.
 */
export function evaluateMarketFilters(
  recordsByCode: Record<string, EcommerceMetric>,
  adminLevel: AdminLevel | 'all',
  criteria: FilterCriteria
): MarketFilterResult {
  const scopedRecords = Object.values(recordsByCode).filter((rec) => {
    const level = inferAdminLevelFromCode(rec.code);
    if (level === 'country') return false;
    if (adminLevel === 'all') return true;
    return level === adminLevel;
  });

  const activeCategories = new Set<string>([
    ...(criteria.selectedCategories ?? []),
    ...(criteria.selectedCategory ? [criteria.selectedCategory] : []),
  ]);

  const matchingRecords = scopedRecords.filter((rec) => {
    // 1. EBI range check (exclude null when EBI filter is active)
    if (criteria.minEbi !== undefined || criteria.maxEbi !== undefined) {
      const ebi = getMetricValue(rec, 'ebiScore');
      if (ebi === null) return false;
      if (criteria.minEbi !== undefined && ebi < criteria.minEbi) return false;
      if (criteria.maxEbi !== undefined && ebi > criteria.maxEbi) return false;
    }

    // 2. Average monthly income range check (exclude null when income filter is active)
    if (criteria.minIncome !== undefined || criteria.maxIncome !== undefined) {
      const income = getMetricValue(rec, 'avgMonthlyIncome');
      if (income === null) return false;
      if (criteria.minIncome !== undefined && income < criteria.minIncome) return false;
      if (criteria.maxIncome !== undefined && income > criteria.maxIncome) return false;
    }

    // 3. Multi-select product categories (inclusive OR)
    if (activeCategories.size > 0) {
      const regionTags = new Set(
        (rec.topCategories ?? []).map((cat) => normalizeCategoryTag(cat.category))
      );
      let hasAny = false;
      for (const selected of activeCategories) {
        if (regionTags.has(selected as ReturnType<typeof normalizeCategoryTag>)) {
          hasAny = true;
          break;
        }
      }
      if (!hasAny) return false;
    }

    return true;
  });

  const matchedCodes = new Set(matchingRecords.map((r) => r.code));

  return {
    matchedCodes,
    matchedCount: matchingRecords.length,
    totalCount: scopedRecords.length,
    matchingRecords,
  };
}
