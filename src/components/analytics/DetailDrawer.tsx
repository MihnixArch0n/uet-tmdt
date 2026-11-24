'use client';

import React from 'react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { X, Sparkles, TrendingUp, Users } from 'lucide-react';
import { DemographicCharts } from './DemographicCharts';

export function DetailDrawer() {
  const { 
    selectedRegion, 
    selectedDemographics, 
    selectedEcommerce, 
    setSelectedRegion,
    setAiModalOpen 
  } = useMapStore();
  const { t, language } = useTranslation();

  if (!selectedRegion) return null;

  const displayLevel =
    selectedRegion.level === 'district'
      ? t.drawer.levelDistrict
      : selectedRegion.level === 'province'
      ? t.drawer.levelProvince
      : selectedRegion.level;

  return (
    <aside className="absolute top-4 bottom-4 left-4 w-96 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 z-20 flex flex-col overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">
            {displayLevel}
          </span>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {selectedRegion.name}
          </h2>
        </div>
        <button
          onClick={() => setSelectedRegion(null)}
          title={t.drawer.close}
          className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Metrics Content */}
      <div className="flex-1 overflow-y-auto pr-1 mt-3 space-y-4">
        {/* Primary metric KPI cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.drawer.population}</span>
            </div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {selectedDemographics?.population.toLocaleString() || '---'}
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
              {t.drawer.density}: {selectedDemographics?.density.toLocaleString()} {t.drawer.densityUnit}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.drawer.ebiScore}</span>
            </div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {selectedEcommerce?.ebiScore ? `${selectedEcommerce.ebiScore}/100` : '---'}
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
              {selectedEcommerce?.monthlyOnlineOrders} {language === 'vi' ? 'đơn/người/tháng' : 'orders/user/mo'}
            </div>
          </div>
        </div>

        {/* AI Strategic Consultation trigger button */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{t.drawer.askAi}</span>
        </button>

        {/* Recharts Analytics Components */}
        <DemographicCharts 
          demographics={selectedDemographics} 
          ecommerce={selectedEcommerce} 
        />
      </div>
    </aside>
  );
}
