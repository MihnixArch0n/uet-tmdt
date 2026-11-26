'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { EcommerceMetric } from '@/types/market';
import {
  CHOROPLETH_COLORS,
  computeChoroplethScale,
  loadEcommerceIndex,
} from '@/lib/ecommerceData';

export function MapLegend() {
  const showEcommerce = useMapStore((s) => s.layers.ecommerce);
  const showPois = useMapStore((s) => s.layers.pois);
  const activeEcommerceMetric = useMapStore((s) => s.activeEcommerceMetric);
  const { t } = useTranslation();

  const [records, setRecords] = useState<EcommerceMetric[]>([]);

  useEffect(() => {
    if (!showEcommerce) return;
    let mounted = true;
    loadEcommerceIndex()
      .then((index) => {
        if (mounted) setRecords(Object.values(index));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [showEcommerce]);

  const scale = useMemo(
    () => computeChoroplethScale(records, activeEcommerceMetric),
    [records, activeEcommerceMetric]
  );

  const metricTitle = showEcommerce
    ? t.ecommerceMetrics[activeEcommerceMetric]
    : t.legend.titleDemographics;

  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-zinc-200 dark:border-zinc-800 text-xs w-60 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {metricTitle}
        </span>
        {showEcommerce && (
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0">
            {scale.unit}
          </span>
        )}
      </div>

      {showEcommerce ? (
        <div className="space-y-1.5">
          <div
            className="h-2.5 w-full rounded-full"
            style={{
              background: `linear-gradient(to right, ${CHOROPLETH_COLORS.join(', ')})`,
            }}
          />
          {scale.hasData && scale.stops.length >= 3 ? (
            <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
              <span>{scale.stops[0].label}</span>
              <span>{scale.stops[2].label}</span>
              <span>{scale.stops[scale.stops.length - 1].label}</span>
            </div>
          ) : (
            <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
              <span>{t.legend.low}</span>
              <span>{t.legend.medium}</span>
              <span>{t.legend.high}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
            <span className="w-3 h-2.5 rounded-sm bg-zinc-400 dark:bg-zinc-600 inline-block shrink-0" />
            <span>{t.ecommerceMetrics.noData}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-100 via-yellow-200 to-rose-500" />
          <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
            <span>{t.legend.low}</span>
            <span>{t.legend.medium}</span>
            <span>{t.legend.high}</span>
          </div>
        </div>
      )}

      {showPois && (
        <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            {t.legend.warehouse}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            {t.legend.mall}
          </span>
        </div>
      )}
    </div>
  );
}
