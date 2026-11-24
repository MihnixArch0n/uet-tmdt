'use client';

import React from 'react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Layers, Users, ShoppingBag, MapPin } from 'lucide-react';

export function LayerControl() {
  const { layers, toggleLayer } = useMapStore();
  const { t } = useTranslation();

  const layerItems = [
    {
      key: 'boundary' as const,
      label: t.layers.boundary,
      icon: Layers,
      color: 'text-blue-500',
    },
    {
      key: 'demographics' as const,
      label: t.layers.demographics,
      icon: Users,
      color: 'text-emerald-500',
    },
    {
      key: 'ecommerce' as const,
      label: t.layers.ecommerce,
      icon: ShoppingBag,
      color: 'text-amber-500',
    },
    {
      key: 'pois' as const,
      label: t.layers.pois,
      icon: MapPin,
      color: 'text-rose-500',
    },
  ];

  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-zinc-200 dark:border-zinc-800 w-64 text-sm transition-colors">
      <div className="flex items-center gap-2 font-semibold pb-2 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
        <Layers className="w-4 h-4 text-indigo-500" />
        <span>{t.layers.panelTitle}</span>
      </div>

      <div className="space-y-1.5 mt-2">
        {layerItems.map((item) => {
          const Icon = item.icon;
          const isChecked = layers[item.key];
          return (
            <label
              key={item.key}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                isChecked
                  ? 'bg-zinc-100 dark:bg-zinc-800/80'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleLayer(item.key)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <Icon className={`w-4 h-4 ${isChecked ? item.color : 'text-zinc-400'}`} />
                <span className="font-medium text-xs text-zinc-800 dark:text-zinc-200">
                  {item.label}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
