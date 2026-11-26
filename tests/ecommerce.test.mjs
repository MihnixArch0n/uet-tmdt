import { registerHooks } from 'node:module';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const target = path.resolve(projectRoot, 'src', specifier.slice(2));
      const withExt = fs.existsSync(`${target}.ts`) ? `${target}.ts` : target;
      return nextResolve(pathToFileURL(withExt).href, context);
    }
    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      !path.extname(specifier) &&
      context.parentURL?.startsWith('file://')
    ) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname);
      const candidate = path.resolve(parentDir, `${specifier}.ts`);
      if (fs.existsSync(candidate)) {
        return nextResolve(pathToFileURL(candidate).href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const {
  getMetricValue,
  indexEcommerceRecords,
  validateEcommerceRecords,
} = await import('../src/lib/ecommerceData.ts');
const { evaluateMarketFilters } = await import('../src/lib/ecommerceFilter.ts');
const {
  computeComparisonDelta,
  hasAdminLevelMismatch,
} = await import('../src/lib/ecommerceCompare.ts');

describe('public/data/ecommerce.json schema & data loader', () => {
  const jsonPath = path.resolve(process.cwd(), 'public/data/ecommerce.json');
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  it('validates all curated records against EcommerceMetric schema', () => {
    const result = validateEcommerceRecords(raw);
    assert.equal(result.valid, true, `Schema errors: ${result.errors.join('; ')}`);
    assert.ok(raw.length > 0, 'ecommerce.json should not be empty');
  });

  it('indexes records by code for O(1) lookup and preserves null for missing fields', () => {
    const index = indexEcommerceRecords(raw);
    assert.ok(index['VN-HN'], 'Expected VN-HN in index');
    assert.ok(index['VN-SG'], 'Expected VN-SG in index');
    assert.equal(getMetricValue(index['VN-HN'], 'totalRetailSales'), null);
  });
});

describe('evaluateMarketFilters', () => {
  const sampleRecords = {
    'VN-HN': {
      code: 'VN-HN',
      ebiScore: 87.5,
      avgMonthlyIncome: 16_000_000,
      monthlyOnlineOrders: 4.9,
      avgOrderValue: 310_000,
      topCategories: [
        { category: 'FMCG & Mỹ phẩm', marketShare: 31, growthRate: 29.8 },
        { category: 'Công nghệ & Điện tử', marketShare: 19, growthRate: 22.4 },
      ],
    },
    'VN-DN': {
      code: 'VN-DN',
      ebiScore: 62.0,
      avgMonthlyIncome: 11_000_000,
      monthlyOnlineOrders: 3.5,
      avgOrderValue: 271_000,
      topCategories: [
        { category: 'Thời trang & Phụ kiện', marketShare: 32, growthRate: 35.9 },
      ],
    },
    'VN-NULL': {
      code: 'VN-NULL',
      ebiScore: null,
      avgMonthlyIncome: null,
      monthlyOnlineOrders: 0,
      avgOrderValue: 0,
      topCategories: [],
    },
  };

  it('filters by EBI range, income range, and inclusive-OR categories', () => {
    const res = evaluateMarketFilters(sampleRecords, 'province', {
      minEbi: 70,
      minIncome: 15_000_000,
      selectedCategories: ['Tech', 'F&B'],
    });
    assert.equal(res.matchedCount, 1);
    assert.equal(res.totalCount, 3);
    assert.equal(res.matchedCodes.has('VN-HN'), true);
    assert.equal(res.matchedCodes.has('VN-DN'), false);
    assert.equal(res.matchedCodes.has('VN-NULL'), false);
  });

  it('returns empty match set when no regions satisfy criteria', () => {
    const res = evaluateMarketFilters(sampleRecords, 'province', {
      minEbi: 99,
      minIncome: 50_000_000,
    });
    assert.equal(res.matchedCount, 0);
    assert.equal(res.matchingRecords.length, 0);
  });
});

describe('computeComparisonDelta & hasAdminLevelMismatch', () => {
  const regA = {
    code: 'VN-SG',
    ebiScore: 90,
    avgMonthlyIncome: 10_000_000,
    totalRetailSales: 500,
    monthlyOnlineOrders: 5,
    avgOrderValue: 300_000,
    topCategories: [],
  };

  const regB = {
    code: 'VN-HN',
    ebiScore: 80,
    avgMonthlyIncome: 10_000_000,
    totalRetailSales: 0,
    monthlyOnlineOrders: 4.5,
    avgOrderValue: 280_000,
    topCategories: [],
  };

  const regMissing = {
    code: '001',
    ebiScore: 70,
    avgMonthlyIncome: null,
    totalRetailSales: null,
    monthlyOnlineOrders: 3,
    avgOrderValue: 250_000,
    topCategories: [],
  };

  it('computes positive delta and leader A', () => {
    const delta = computeComparisonDelta(regA, regB, 'ebiScore');
    assert.equal(delta.absDiff, 10);
    assert.equal(delta.pctDiff, 12.5);
    assert.equal(delta.leader, 'A');
  });

  it('handles ties cleanly', () => {
    const delta = computeComparisonDelta(regA, regB, 'avgMonthlyIncome');
    assert.equal(delta.absDiff, 0);
    assert.equal(delta.pctDiff, 0);
    assert.equal(delta.leader, 'tie');
  });

  it('handles zero baseline without division-by-zero NaN/Infinity', () => {
    const delta = computeComparisonDelta(regA, regB, 'totalRetailSales');
    assert.equal(delta.absDiff, 500);
    assert.equal(delta.pctDiff, null);
    assert.equal(delta.leader, 'A');
  });

  it('returns "na" when either region has null data', () => {
    const delta = computeComparisonDelta(regA, regMissing, 'avgMonthlyIncome');
    assert.equal(delta.absDiff, null);
    assert.equal(delta.pctDiff, null);
    assert.equal(delta.leader, 'na');
  });

  it('detects administrative level mismatches', () => {
    assert.equal(hasAdminLevelMismatch('province', 'ward'), true);
    assert.equal(hasAdminLevelMismatch('province', 'province'), false);
  });
});
