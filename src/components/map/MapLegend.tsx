'use client';

import React from 'react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function MapLegend() {
  const { layers } = useMapStore();
  const { t } = useTranslation();

  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-zinc-200 dark:border-zinc-800 text-xs w-56 transition-colors">
      <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {layers.ecommerce ? t.legend.titleEbi : t.legend.titleDemographics}
      </div>

      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-100 via-yellow-200 to-rose-500" />
        <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
          <span>{t.legend.low}</span>
          <span>{t.legend.medium}</span>
          <span>{t.legend.high}</span>
        </div>
      </div>

      {layers.pois && (
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
