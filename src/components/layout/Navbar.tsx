'use client';

import React from 'react';
import { SearchBar } from '../search/SearchBar';
import { MarketFilterPanel } from '../filters/MarketFilterPanel';
import { SiteSelectionTool } from '../decision/SiteSelectionTool';
import { Map, Sparkles, SunMedium, Moon, Globe } from 'lucide-react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function Navbar() {
  const { setAiModalOpen, theme, toggleTheme } = useMapStore();
  const { t, language, setLanguage } = useTranslation();

  return (
    <header className="h-16 px-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between z-30 relative shrink-0 shadow-sm transition-colors">
      {/* Brand logo & Project title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
          <Map className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>{t.nav.title}</span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 shrink-0">
              {t.nav.badge}
            </span>
          </h1>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
            {t.nav.subtitle}
          </p>
        </div>
      </div>

      {/* Central region search bar (Member 2) */}
      <div className="hidden md:block">
        <SearchBar />
      </div>

      {/* Right action controls */}
      <div className="flex items-center gap-2">
        {/* Site Selection radius buffer tool (Member 5) */}
        <SiteSelectionTool />

        {/* Multi-criteria filter panel (Member 4) */}
        <MarketFilterPanel />

        {/* AI Strategic consultant trigger (Member 1) */}
        <button
          onClick={() => setAiModalOpen(true)}
          title={t.nav.aiConsultant}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">{t.nav.aiConsultant}</span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

        {/* Language Switch Toggle (VI / EN) */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setLanguage('vi')}
            title="Tiếng Việt"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              language === 'vi'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>VI</span>
          </button>
          <button
            onClick={() => setLanguage('en')}
            title="English"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>EN</span>
          </button>
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
          aria-label={t.nav.toggleTheme}
        >
          {theme === 'dark' ? (
            <SunMedium className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform -rotate-12 hover:rotate-0" />
          )}
        </button>
      </div>
    </header>
  );
}
