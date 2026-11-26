'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  AlertTriangle,
  Award,
  GitCompare,
  Trash2,
  X,
} from 'lucide-react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import {
  EcommerceMetric,
  EcommerceMetricKey,
  RegionProperties,
} from '@/types/market';
import {
  formatMetricValue,
  inferAdminLevelFromCode,
  loadEcommerceIndex,
} from '@/lib/ecommerceData';
import {
  computeComparisonDelta,
  hasAdminLevelMismatch,
} from '@/lib/ecommerceCompare';

export function ComparePanel() {
  const isCompareMode = useMapStore((s) => s.isCompareMode);
  const setCompareMode = useMapStore((s) => s.setCompareMode);
  const compareRegions = useMapStore((s) => s.compareRegions);
  const compareSlotRegions = useMapStore((s) => s.compareSlotRegions);
  const setCompareSlotRegion = useMapStore((s) => s.setCompareSlotRegion);
  const swapCompareRegions = useMapStore((s) => s.swapCompareRegions);
  const clearCompareSlot = useMapStore((s) => s.clearCompareSlot);
  const compareFeedback = useMapStore((s) => s.compareFeedback);
  const clearCompareFeedback = useMapStore((s) => s.clearCompareFeedback);

  const { t, language } = useTranslation();

  const [recordsByCode, setRecordsByCode] = useState<Record<string, EcommerceMetric>>({});
  const [regionList, setRegionList] = useState<RegionProperties[]>([]);

  useEffect(() => {
    if (!isCompareMode) return;
    let mounted = true;

    Promise.all([
      loadEcommerceIndex(),
      fetch('/data/boundaries/provinces_sample.geojson')
        .then((r) => r.json())
        .catch(() => ({ features: [] })),
    ]).then(([index, geo]) => {
      if (!mounted) return;
      setRecordsByCode(index);

      const boundaryNames = new Map<string, RegionProperties>();
      for (const f of (geo as GeoJSON.FeatureCollection).features ?? []) {
        const props = (f.properties ?? {}) as Partial<RegionProperties>;
        if (props.code && props.name) {
          boundaryNames.set(props.code, {
            code: props.code,
            name: props.name,
            level: props.level ?? inferAdminLevelFromCode(props.code),
            parentCode: props.parentCode,
            center: Array.isArray(props.center) ? (props.center as [number, number]) : [106.0, 16.0],
          });
        }
      }

      const list: RegionProperties[] = Object.keys(index)
        .filter((code) => code !== 'VN')
        .map(
          (code) =>
            boundaryNames.get(code) ?? {
              code,
              name: code,
              level: inferAdminLevelFromCode(code),
              center: [106.0, 16.0],
            }
        );

      setRegionList(list);
    });

    return () => {
      mounted = false;
    };
  }, [isCompareMode]);

  const [codeA, codeB] = compareRegions;
  const [slotA, slotB] = compareSlotRegions;
  const metricA = codeA ? recordsByCode[codeA] ?? null : null;
  const metricB = codeB ? recordsByCode[codeB] ?? null : null;

  const levelA = slotA?.level ?? (codeA ? inferAdminLevelFromCode(codeA) : undefined);
  const levelB = slotB?.level ?? (codeB ? inferAdminLevelFromCode(codeB) : undefined);
  const levelMismatch = Boolean(codeA && codeB && hasAdminLevelMismatch(levelA, levelB));

  const metricRows: Array<{ key: EcommerceMetricKey; label: string }> = useMemo(
    () => [
      { key: 'ebiScore', label: t.ecommerceMetrics.ebiScore },
      { key: 'avgMonthlyIncome', label: t.ecommerceMetrics.avgMonthlyIncome },
      { key: 'totalRetailSales', label: t.ecommerceMetrics.totalRetailSales },
    ],
    [t]
  );

  if (!isCompareMode) return null;

  const handleSelectChange = (slot: 0 | 1, code: string) => {
    if (!code) {
      clearCompareSlot(slot);
      return;
    }
    const found = regionList.find((r) => r.code === code) ?? {
      code,
      name: code,
      level: inferAdminLevelFromCode(code),
      center: [106.0, 16.0],
    };
    setCompareSlotRegion(slot, found);
  };

  return (
    <aside className="absolute top-4 right-4 bottom-4 w-[26rem] max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 z-30 flex flex-col overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {t.compare.title}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={swapCompareRegions}
            disabled={!codeA && !codeB}
            className="px-2 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-700 dark:text-zinc-200 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>{t.compare.swap}</span>
          </button>
          <button
            type="button"
            onClick={() => setCompareMode(false)}
            title={t.compare.exit}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
        {t.compare.clickMapHint}
      </p>

      {/* Duplicate Warning */}
      {compareFeedback === 'duplicate' && (
        <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
          <span>{t.compare.duplicateWarning}</span>
          <button
            type="button"
            onClick={clearCompareFeedback}
            className="text-rose-500 hover:text-rose-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Administrative Level Mismatch Warning */}
      {levelMismatch && (
        <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{t.compare.levelMismatchWarning}</span>
        </div>
      )}

      {/* Region A & Region B Selectors */}
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {[
          { slot: 0 as const, label: t.compare.slotA, code: codeA, border: 'border-indigo-500/50' },
          { slot: 1 as const, label: t.compare.slotB, code: codeB, border: 'border-amber-500/50' },
        ].map((item) => (
          <div
            key={item.slot}
            className={`p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border ${item.border} space-y-1.5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {item.label}
              </span>
              {item.code && (
                <button
                  type="button"
                  onClick={() => clearCompareSlot(item.slot)}
                  title={t.compare.clear}
                  className="text-zinc-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <select
              value={item.code ?? ''}
              onChange={(e) => handleSelectChange(item.slot, e.target.value)}
              className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-800 dark:text-zinc-100"
            >
              <option value="">{t.compare.selectPlaceholder}</option>
              {regionList.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Side-by-Side Metrics & Deltas */}
      <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3">
        {metricRows.map((row) => {
          const delta = computeComparisonDelta(metricA, metricB, row.key);
          const maxVal = Math.max(delta.valueA ?? 0, delta.valueB ?? 0, 1);
          const pctBarA = delta.valueA !== null ? Math.min(100, (delta.valueA / maxVal) * 100) : 0;
          const pctBarB = delta.valueB !== null ? Math.min(100, (delta.valueB / maxVal) * 100) : 0;

          return (
            <div
              key={row.key}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  {row.label}
                </span>
                {delta.leader !== 'na' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
                    <Award className="w-3 h-3" />
                    {delta.leader === 'tie'
                      ? t.compare.tieLabel
                      : `${delta.leader} ${t.compare.leaderBadge}`}
                    {delta.pctDiff !== null && delta.leader !== 'tie' && (
                      <span>
                        ({delta.pctDiff > 0 ? '+' : ''}
                        {delta.pctDiff.toFixed(1)}%)
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">
                    {codeA
                      ? formatMetricValue(delta.valueA, row.key, language)
                      : '---'}
                  </div>
                  <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${pctBarA}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-amber-600 dark:text-amber-400">
                    {codeB
                      ? formatMetricValue(delta.valueB, row.key, language)
                      : '---'}
                  </div>
                  <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${pctBarB}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Top Online Categories Side-by-Side */}
        {(metricA || metricB) && (
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              {t.compare.topCategories}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[metricA, metricB].map((m, idx) => (
                <div key={idx} className="flex flex-wrap gap-1">
                  {m?.topCategories?.length ? (
                    m.topCategories.slice(0, 3).map((cat) => (
                      <span
                        key={cat.category}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                      >
                        {cat.category} ({cat.marketShare}%)
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-zinc-400">---</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
