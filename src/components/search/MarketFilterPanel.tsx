'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Filter, SlidersHorizontal, RotateCcw, MapPin } from 'lucide-react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import {
  EcommerceMetric,
  ProductCategoryKey,
  RegionProperties,
} from '@/types/market';
import {
  formatMetricValue,
  inferAdminLevelFromCode,
  loadEcommerceIndex,
} from '@/lib/ecommerceData';
import {
  evaluateMarketFilters,
  hasActiveMarketFilters,
} from '@/lib/ecommerceFilter';

const CATEGORY_OPTIONS: ProductCategoryKey[] = ['F&B', 'Fashion', 'Tech', 'FMCG'];

export function MarketFilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [recordsByCode, setRecordsByCode] = useState<Record<string, EcommerceMetric>>({});
  const [regionsByCode, setRegionsByCode] = useState<Record<string, RegionProperties>>({});

  const filters = useMapStore((s) => s.filters);
  const setFilters = useMapStore((s) => s.setFilters);
  const resetFilters = useMapStore((s) => s.resetFilters);
  const setMatchedRegionCodes = useMapStore((s) => s.setMatchedRegionCodes);
  const flyToRegion = useMapStore((s) => s.flyToRegion);
  const setSelectedRegion = useMapStore((s) => s.setSelectedRegion);
  const setLayer = useMapStore((s) => s.setLayer);

  const { t, language } = useTranslation();

  useEffect(() => {
    let mounted = true;
    loadEcommerceIndex()
      .then((index) => {
        if (mounted) setRecordsByCode(index);
      })
      .catch(() => {});

    fetch('/data/boundaries/provinces_sample.geojson')
      .then((res) => res.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (!mounted) return;
        const map: Record<string, RegionProperties> = {};
        for (const f of geo.features ?? []) {
          const props = (f.properties ?? {}) as Partial<RegionProperties>;
          if (props.code && props.name && Array.isArray(props.center)) {
            map[props.code] = {
              code: props.code,
              name: props.name,
              level: props.level ?? inferAdminLevelFromCode(props.code),
              parentCode: props.parentCode,
              center: props.center as [number, number],
            };
          }
        }
        setRegionsByCode(map);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const isFilterActive = hasActiveMarketFilters(filters);

  const filterResult = useMemo(
    () => evaluateMarketFilters(recordsByCode, 'all', filters),
    [recordsByCode, filters]
  );

  useEffect(() => {
    if (!isFilterActive) {
      setMatchedRegionCodes(null);
    } else {
      setMatchedRegionCodes(Array.from(filterResult.matchedCodes));
    }
  }, [isFilterActive, filterResult.matchedCodes, setMatchedRegionCodes]);

  const toggleCategory = (cat: ProductCategoryKey) => {
    const current = new Set(filters.selectedCategories ?? []);
    if (current.has(cat)) {
      current.delete(cat);
    } else {
      current.add(cat);
    }
    setFilters({ selectedCategories: Array.from(current) });
    setLayer('ecommerce', true);
  };

  const handleFocusRegion = (metric: EcommerceMetric) => {
    const regionProps: RegionProperties = regionsByCode[metric.code] ?? {
      code: metric.code,
      name: metric.code,
      level: inferAdminLevelFromCode(metric.code),
      center: [106.0, 16.0],
    };
    if (regionsByCode[metric.code]?.center) {
      flyToRegion(regionsByCode[metric.code].center, regionProps.level === 'province' ? 7.5 : 11);
    }
    setSelectedRegion(regionProps, null, metric);
  };

  const minIncomeMillions =
    filters.minIncome !== undefined ? Math.round(filters.minIncome / 1_000_000) : '';
  const maxIncomeMillions =
    filters.maxIncome !== undefined ? Math.round(filters.maxIncome / 1_000_000) : '';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-200 shadow-sm transition-all cursor-pointer"
      >
        <Filter className="w-4 h-4 text-indigo-500" />
        <span className="hidden sm:inline">{t.filters.buttonLabel}</span>
        {isFilterActive && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
            {filterResult.matchedCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 z-50 text-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
              {t.filters.title}
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              {t.filters.reset}
            </button>
          </div>

          {/* EBI Score Min-Max */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t.ecommerceMetrics.ebiScore} (0–100)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                max={100}
                placeholder={t.filters.minEbi}
                value={filters.minEbi ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : Number(e.target.value);
                  setFilters({ minEbi: val });
                  setLayer('ecommerce', true);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="number"
                min={0}
                max={100}
                placeholder={t.filters.maxEbi}
                value={filters.maxEbi ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : Number(e.target.value);
                  setFilters({ maxEbi: val });
                  setLayer('ecommerce', true);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Monthly Income Min-Max (Millions VND) */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t.ecommerceMetrics.avgMonthlyIncome}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                step={1}
                placeholder={t.filters.minIncome}
                value={minIncomeMillions}
                onChange={(e) => {
                  const val =
                    e.target.value === '' ? undefined : Number(e.target.value) * 1_000_000;
                  setFilters({ minIncome: val });
                  setLayer('ecommerce', true);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="number"
                min={0}
                step={1}
                placeholder={t.filters.maxIncome}
                value={maxIncomeMillions}
                onChange={(e) => {
                  const val =
                    e.target.value === '' ? undefined : Number(e.target.value) * 1_000_000;
                  setFilters({ maxIncome: val });
                  setLayer('ecommerce', true);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Multi-select Product Categories */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t.filters.categories}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const selected = (filters.selectedCategories ?? []).includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Match Count & Quick List */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span>{t.filters.matchedRegions}</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {t.filters.matchCount
                  .replace('{matched}', String(filterResult.matchedCount))
                  .replace('{total}', String(filterResult.totalCount))}
              </span>
            </div>

            {filterResult.matchedCount === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs space-y-1">
                <div className="font-semibold text-amber-800 dark:text-amber-300">
                  {t.filters.emptyTitle}
                </div>
                <p className="text-amber-700 dark:text-amber-400/90 text-[11px]">
                  {t.filters.emptyHint}
                </p>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filterResult.matchingRecords.slice(0, 25).map((rec) => {
                  const label = regionsByCode[rec.code]?.name ?? rec.code;
                  return (
                    <button
                      key={rec.code}
                      type="button"
                      onClick={() => handleFocusRegion(rec)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0 ml-2">
                        {formatMetricValue(rec.ebiScore, 'ebiScore', language)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
