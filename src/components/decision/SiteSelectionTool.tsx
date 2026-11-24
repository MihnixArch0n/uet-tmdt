'use client';

import React from 'react';
import { Target, X, CheckCircle2 } from 'lucide-react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function SiteSelectionTool() {
  const { 
    isSiteSelectionActive, 
    setSiteSelectionActive, 
    siteRadiusKm, 
    setSiteRadiusKm,
    lastSiteAnalysis,
    setLastSiteAnalysis 
  } = useMapStore();
  const { t, language } = useTranslation();

  return (
    <div className="relative">
      <button
        onClick={() => setSiteSelectionActive(!isSiteSelectionActive)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
          isSiteSelectionActive
            ? 'bg-amber-500 text-white border-amber-600 shadow-md'
            : 'bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-sm'
        }`}
      >
        <Target className={`w-4 h-4 ${isSiteSelectionActive ? 'text-white' : 'text-amber-500'}`} />
        <span className="hidden sm:inline">{t.siteSelection.buttonLabel}</span>
      </button>

      {/* Analysis result overlay panel after clicking map point */}
      {lastSiteAnalysis && (
        <div className="absolute top-full right-0 sm:left-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 z-50 text-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
              <Target className="w-4 h-4 text-amber-500 shrink-0" />
              {t.siteSelection.evaluationTitle.replace('{radius}', String(lastSiteAnalysis.radiusKm))}
            </span>
            <button
              onClick={() => setLastSiteAnalysis(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
            <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
              {t.siteSelection.suitabilityScore}
            </span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {lastSiteAnalysis.suitabilityScore}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg">
              <span className="text-zinc-400">{t.siteSelection.estPopulation}</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                ~{lastSiteAnalysis.estimatedPopulation.toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg">
              <span className="text-zinc-400">{t.siteSelection.competitorPois}</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                {lastSiteAnalysis.logisticsHubCount} {language === 'vi' ? 'điểm' : 'facilities'}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {language === 'vi' ? 'Đánh giá sơ bộ:' : 'Quick Findings:'}
            </span>
            {lastSiteAnalysis.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>

          {/* Buffer radius adjuster */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>{t.siteSelection.radiusLabel}:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{siteRadiusKm} km</span>
            </div>
            <div className="flex gap-2">
              {[1, 3, 5, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setSiteRadiusKm(r)}
                  className={`flex-1 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    siteRadiusKm === r
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
