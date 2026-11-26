import type {
  AdminLevel,
  EcommerceMetric,
  EcommerceMetricKey,
  ProductCategoryKey,
} from '@/types/market';

export interface ChoroplethStop {
  value: number;
  color: string;
  label: string;
}

export interface ChoroplethScale {
  key: EcommerceMetricKey;
  min: number;
  max: number;
  unit: string;
  hasData: boolean;
  stops: ChoroplethStop[];
}

export const CHOROPLETH_COLORS = [
  '#fef3c7', // amber-100
  '#fcd34d', // amber-300
  '#f59e0b', // amber-500
  '#ea580c', // orange-600
  '#be123c', // rose-700
] as const;

export const NO_DATA_COLOR_LIGHT = '#9ca3af';
export const NO_DATA_COLOR_DARK = '#52525b';

let cachedRecords: EcommerceMetric[] | null = null;
let cachedIndex: Record<string, EcommerceMetric> | null = null;
let inflightPromise: Promise<Record<string, EcommerceMetric>> | null = null;

/**
 * Indexes an array of EcommerceMetric records by administrative `code` for O(1) lookup.
 */
export function indexEcommerceRecords(
  records: EcommerceMetric[]
): Record<string, EcommerceMetric> {
  const index: Record<string, EcommerceMetric> = {};
  for (const record of records) {
    if (record && typeof record.code === 'string' && record.code.length > 0) {
      index[record.code] = record;
    }
  }
  return index;
}

/**
 * Loads and caches `/data/ecommerce.json` client-side without mutating the source file.
 */
export async function loadEcommerceIndex(): Promise<Record<string, EcommerceMetric>> {
  if (cachedIndex) return cachedIndex;
  if (inflightPromise) return inflightPromise;

  inflightPromise = fetch('/data/ecommerce.json')
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch ecommerce.json: ${res.status}`);
      }
      return res.json() as Promise<EcommerceMetric[]>;
    })
    .then((data) => {
      cachedRecords = Array.isArray(data) ? data : [];
      cachedIndex = indexEcommerceRecords(cachedRecords);
      return cachedIndex;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

/**
 * Returns the cached array of EcommerceMetric records if already loaded.
 */
export function getCachedEcommerceRecords(): EcommerceMetric[] {
  return cachedRecords ?? [];
}

/**
 * Validates raw parsed JSON data against the `EcommerceMetric` contract in `src/types/market.ts`.
 */
export function validateEcommerceRecords(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!Array.isArray(data)) {
    return { valid: false, errors: ['Root value must be an array of EcommerceMetric records.'] };
  }

  const seenCodes = new Set<string>();
  data.forEach((item, idx) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Record[${idx}] is not an object.`);
      return;
    }
    const rec = item as Record<string, unknown>;
    if (typeof rec.code !== 'string' || rec.code.trim() === '') {
      errors.push(`Record[${idx}].code must be a non-empty string.`);
    } else if (seenCodes.has(rec.code)) {
      errors.push(`Duplicate code "${rec.code}" at Record[${idx}].`);
    } else {
      seenCodes.add(rec.code);
    }

    if (
      rec.ebiScore !== null &&
      (typeof rec.ebiScore !== 'number' || Number.isNaN(rec.ebiScore) || rec.ebiScore < 0 || rec.ebiScore > 100)
    ) {
      errors.push(`Record[${idx}].ebiScore must be null or a number between 0 and 100.`);
    }

    if (
      rec.avgMonthlyIncome !== null &&
      (typeof rec.avgMonthlyIncome !== 'number' || Number.isNaN(rec.avgMonthlyIncome) || rec.avgMonthlyIncome < 0)
    ) {
      errors.push(`Record[${idx}].avgMonthlyIncome must be null or a non-negative number.`);
    }

    if (
      rec.totalRetailSales !== undefined &&
      rec.totalRetailSales !== null &&
      (typeof rec.totalRetailSales !== 'number' || Number.isNaN(rec.totalRetailSales) || rec.totalRetailSales < 0)
    ) {
      errors.push(`Record[${idx}].totalRetailSales must be undefined, null, or a non-negative number.`);
    }

    if (!Array.isArray(rec.topCategories)) {
      errors.push(`Record[${idx}].topCategories must be an array.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Safely extracts a metric value from an EcommerceMetric record, returning `null` when unavailable.
 */
export function getMetricValue(
  record: EcommerceMetric | undefined | null,
  key: EcommerceMetricKey
): number | null {
  if (!record) return null;
  const raw = record[key];
  if (raw === undefined || raw === null || typeof raw !== 'number' || Number.isNaN(raw)) {
    return null;
  }
  return raw;
}

/**
 * Normalizes raw Vietnamese/English category labels into canonical product category verticals.
 */
export function normalizeCategoryTag(rawCategory: string): ProductCategoryKey | 'Other' {
  const lower = rawCategory.toLowerCase();
  if (lower.includes('f&b') || lower.includes('ẩm thực') || lower.includes('đồ uống') || lower.includes('thực phẩm')) {
    return 'F&B';
  }
  if (lower.includes('fashion') || lower.includes('thời trang') || lower.includes('phụ kiện')) {
    return 'Fashion';
  }
  if (lower.includes('tech') || lower.includes('công nghệ') || lower.includes('điện tử')) {
    return 'Tech';
  }
  if (lower.includes('fmcg') || lower.includes('tiêu dùng') || lower.includes('mỹ phẩm')) {
    return 'FMCG';
  }
  return 'Other';
}

/**
 * Infers administrative level from standard Vietnam GIS region code format.
 */
export function inferAdminLevelFromCode(code: string): AdminLevel {
  if (code === 'VN') return 'country';
  if (code.startsWith('VN-')) return 'province';
  if (/^\d{3}$/.test(code)) return 'district';
  return 'ward';
}

/**
 * Formats a metric value for display with localized "No data" handling.
 */
export function formatMetricValue(
  value: number | null | undefined,
  key: EcommerceMetricKey,
  locale: 'vi' | 'en'
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return locale === 'vi' ? 'Chưa có dữ liệu' : 'No data';
  }

  switch (key) {
    case 'ebiScore':
      return `${value.toFixed(1)} / 100`;
    case 'avgMonthlyIncome': {
      const millions = value / 1_000_000;
      return locale === 'vi'
        ? `${millions.toFixed(2)} tr đ/tháng`
        : `${millions.toFixed(2)}M VND/mo`;
    }
    case 'totalRetailSales': {
      if (value >= 1000) {
        const trillions = value / 1000;
        return locale === 'vi'
          ? `${trillions.toFixed(1)} nghìn tỷ đ`
          : `${trillions.toFixed(1)}T VND`;
      }
      return locale === 'vi'
        ? `${value.toLocaleString('vi-VN')} tỷ đ`
        : `${value.toLocaleString('en-US')}B VND`;
    }
  }
}

/**
 * Computes a dynamic 5-stop choropleth scale from non-null values of the selected metric.
 */
export function computeChoroplethScale(
  records: EcommerceMetric[],
  key: EcommerceMetricKey
): ChoroplethScale {
  const unitMap: Record<EcommerceMetricKey, string> = {
    ebiScore: 'pts (0–100)',
    avgMonthlyIncome: 'M VND/mo',
    totalRetailSales: 'B VND',
  };

  const values = records
    .map((r) => getMetricValue(r, key))
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return {
      key,
      min: 0,
      max: 0,
      unit: unitMap[key],
      hasData: false,
      stops: [],
    };
  }

  const min = values[0];
  const max = values[values.length - 1];
  const span = max - min || 1;

  const stops: ChoroplethStop[] = CHOROPLETH_COLORS.map((color, idx) => {
    const ratio = idx / (CHOROPLETH_COLORS.length - 1);
    const val = min + span * ratio;
    const label =
      key === 'avgMonthlyIncome'
        ? `${(val / 1_000_000).toFixed(1)}M`
        : key === 'totalRetailSales'
        ? val >= 1000
          ? `${(val / 1000).toFixed(1)}T`
          : `${Math.round(val)}B`
        : val.toFixed(1);
    return { value: val, color, label };
  });

  return {
    key,
    min,
    max,
    unit: unitMap[key],
    hasData: true,
    stops,
  };
}
