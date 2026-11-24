'use client';

import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const { flyToRegion } = useMapStore();
  const { t } = useTranslation();

  // Sample quick locations
  const sampleLocations = [
    { name: 'Hà Nội', center: [105.8342, 21.0278] as [number, number], zoom: 10 },
    { name: 'TP. Hồ Chí Minh', center: [106.6297, 10.8231] as [number, number], zoom: 10 },
    { name: 'Đà Nẵng', center: [108.2022, 16.0544] as [number, number], zoom: 11 },
  ];

  const filteredLocations = query.trim()
    ? sampleLocations.filter((loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase().trim())
      )
    : sampleLocations;

  const handleSelect = (center: [number, number], zoom: number) => {
    flyToRegion(center, zoom);
    setQuery('');
  };

  return (
    <div className="relative w-80">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search.placeholder}
          className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
        />
      </div>

      {/* Search results dropdown */}
      {query && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50 text-sm">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleSelect(loc.center, loc.zoom)}
                className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>{loc.name}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-zinc-400 text-xs text-center">
              {t.search.noResults}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
