'use client';

import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Building2, Sparkles, TrendingUp, UserCheck, Users, Wallet, X } from 'lucide-react';
import { DemographicCharts } from './DemographicCharts';

/**
 * =============================================================================
 * SIDE DRAWER: Region Demographic & Market Inspector (Right 420px)
 * OWNED BY: MEMBER 3
 * =============================================================================
 */
export function DetailDrawer() {
  // Atomic selectors to avoid unnecessary re-renders on map pan/zoom
  const selectedRegion = useMapStore((state) => state.selectedRegion);
  const selectedDemographics = useMapStore((state) => state.selectedDemographics);
  const selectedEcommerce = useMapStore((state) => state.selectedEcommerce);
  const setSelectedRegion = useMapStore((state) => state.setSelectedRegion);
  const setAiModalOpen = useMapStore((state) => state.setAiModalOpen);

  const { t, language } = useTranslation();

  if (!selectedRegion) return null;

  const numberFormatter = new Intl.NumberFormat('vi-VN');

  const displayLevel =
    selectedRegion.level === 'district'
      ? t.drawer.levelDistrict
      : selectedRegion.level === 'province'
      ? t.drawer.levelProvince
      : selectedRegion.level === 'ward'
      ? language === 'vi'
        ? 'Phường / Xã'
        : 'Ward / Commune'
      : language === 'vi'
      ? 'Quốc gia'
      : 'Country';

  const coreShoppersPct = selectedDemographics
    ? Number(
        (
          selectedDemographics.ageGroups.genZ + selectedDemographics.ageGroups.workingAge
        ).toFixed(1)
      )
    : null;

  const coreShoppersCount =
    selectedDemographics && coreShoppersPct !== null
      ? Math.round((selectedDemographics.population * coreShoppersPct) / 100)
      : null;

  const formatMillionsVnd = (amount?: number) => {
    if (!amount) return '---';
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M VND`;
    }
    return `${Math.round(amount / 1_000)}k VND`;
  };

  return (
    <aside className="absolute top-4 bottom-4 right-4 w-[420px] max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 z-30 flex flex-col overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">
              {displayLevel}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              {selectedRegion.code}
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1.5 truncate">
            {selectedRegion.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setSelectedRegion(null)}
          title={t.drawer.close}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Metrics & Recharts Content */}
      <div className="flex-1 overflow-y-auto pr-1 mt-3 space-y-4">
        {/* 2x2 Primary KPI Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Population & Density */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.drawer.population}</span>
            </div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {selectedDemographics
                ? numberFormatter.format(selectedDemographics.population)
                : '---'}
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t.drawer.density}:{' '}
              {selectedDemographics
                ? `${numberFormatter.format(selectedDemographics.density)} ${t.drawer.densityUnit}`
                : '---'}
            </div>
          </div>

          {/* EBI Score & Orders */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.drawer.ebiScore}</span>
            </div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {selectedEcommerce?.ebiScore ? `${selectedEcommerce.ebiScore}/100` : '---'}
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {selectedEcommerce?.monthlyOnlineOrders
                ? `${selectedEcommerce.monthlyOnlineOrders} ${
                    language === 'vi' ? 'đơn/người/tháng' : 'orders/user/mo'
                  }`
                : language === 'vi'
                ? 'Chưa có dữ liệu EBI'
                : 'No EBI data'}
            </div>
          </div>

          {/* Core E-Commerce Shoppers (18-45: Gen Z + Working Age) */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'vi' ? 'Nhóm 18–45 tuổi' : 'Core Age 18–45'}</span>
            </div>
            <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
              {coreShoppersPct !== null ? `${coreShoppersPct}%` : '---'}
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {coreShoppersCount !== null
                ? `~${numberFormatter.format(coreShoppersCount)} ${
                    language === 'vi' ? 'người' : 'ppl'
                  }`
                : '---'}
            </div>
          </div>

          {/* Urbanization Rate */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
              <Building2 className="w-3.5 h-3.5 text-sky-500" />
              <span>{language === 'vi' ? 'Tỷ lệ đô thị hóa' : 'Urbanization'}</span>
            </div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {selectedDemographics ? `${selectedDemographics.urbanizationRate}%` : '---'}
            </div>
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-sky-500 rounded-full transition-all"
                style={{ width: `${Math.min(selectedDemographics?.urbanizationRate ?? 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Purchasing Power Summary Strip */}
        {selectedEcommerce && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40 text-xs">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span>
                {t.drawer.avgIncome}:{' '}
                <strong className="font-semibold">
                  {formatMillionsVnd(selectedEcommerce.avgMonthlyIncome)}
                </strong>
              </span>
            </div>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
              AOV: {formatMillionsVnd(selectedEcommerce.avgOrderValue)}
            </span>
          </div>
        )}

        {/* AI Strategic Consultation trigger button */}
        <button
          type="button"
          onClick={() => setAiModalOpen(true)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{t.drawer.askAi}</span>
        </button>

        {/* Recharts Demographic & Market Visualizations */}
        <DemographicCharts
          demographics={selectedDemographics}
          ecommerce={selectedEcommerce}
        />
      </div>
    </aside>
  );
}
