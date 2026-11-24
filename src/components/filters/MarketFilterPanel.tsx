'use client';

import React, { useState } from 'react';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function MarketFilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setFilters, resetFilters } = useMapStore();
  const { t } = useTranslation();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-200 shadow-sm transition-all cursor-pointer"
      >
        <Filter className="w-4 h-4 text-indigo-500" />
        <span className="hidden sm:inline">{t.filters.buttonLabel}</span>
        {(filters.minEbi || filters.minPopulation) && (
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 z-50 text-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
              {t.filters.title}
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              {t.filters.reset}
            </button>
          </div>

          {/* EBI index threshold filter */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300">
              <span>{t.filters.minEbi}:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {filters.minEbi || 50}
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={filters.minEbi || 50}
              onChange={(e) => setFilters({ minEbi: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Population size threshold filter */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300">
              <span>{t.filters.minPopulation}:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {((filters.minPopulation || 1000000) / 1000000).toFixed(1)}M
              </span>
            </div>
            <input
              type="range"
              min={500000}
              max={10000000}
              step={500000}
              value={filters.minPopulation || 1000000}
              onChange={(e) => setFilters({ minPopulation: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
