import { create } from 'zustand';
import {
  LayerVisibilityState,
  FilterCriteria,
  RegionProperties,
  DemographicMetric,
  EcommerceMetric,
  SiteAnalysisResult
} from '@/types/market';
import { Language } from '@/lib/i18n/translations';

export type ThemeMode = 'light' | 'dark';

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface MapStore {
  hydratePreferences: () => void;

  // Theme & Language
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;

  // Map Viewport / Camera state
  viewState: ViewState;
  setViewState: (viewState: Partial<ViewState>) => void;
  flyToRegion: (center: [number, number], zoom?: number) => void;

  // Active Map Layers (Member 1)
  layers: LayerVisibilityState;
  toggleLayer: (layer: keyof LayerVisibilityState) => void;
  setLayer: (layer: keyof LayerVisibilityState, visible: boolean) => void;

  // Active / Selected Region (Inspected in Drawer by Member 3)
  selectedRegion: RegionProperties | null;
  selectedDemographics: DemographicMetric | null;
  selectedEcommerce: EcommerceMetric | null;
  setSelectedRegion: (
    region: RegionProperties | null,
    demo?: DemographicMetric | null,
    ecom?: EcommerceMetric | null
  ) => void;

  // Region Comparison Mode (Member 4)
  compareRegion: RegionProperties | null;
  setCompareRegion: (region: RegionProperties | null) => void;
  isCompareMode: boolean;
  setCompareMode: (enabled: boolean) => void;

  // Multi-criteria Market Filters (Member 4)
  filters: FilterCriteria;
  setFilters: (filters: Partial<FilterCriteria>) => void;
  resetFilters: () => void;

  // Site Selection & Radius Buffer Tool (Member 5)
  isSiteSelectionActive: boolean;
  setSiteSelectionActive: (active: boolean) => void;
  siteRadiusKm: number;
  setSiteRadiusKm: (radius: number) => void;
  lastSiteAnalysis: SiteAnalysisResult | null;
  setLastSiteAnalysis: (result: SiteAnalysisResult | null) => void;

  // AI Consultant Modal
  isAiModalOpen: boolean;
  setAiModalOpen: (open: boolean) => void;
}

// Default Viewport centered on Vietnam
const DEFAULT_VIEW_STATE: ViewState = {
  longitude: 106.0,
  latitude: 16.0,
  zoom: 5.5,
  pitch: 0,
  bearing: 0,
};

export const useMapStore = create<MapStore>((set) => ({
  theme: 'dark',
  language: 'en',
  hydratePreferences: () => {
    if (typeof window === 'undefined') return;

    const savedTheme = localStorage.getItem('app_theme');
    let nextTheme: ThemeMode = 'light';
    if (savedTheme === 'dark' || savedTheme === 'light') {
      nextTheme = savedTheme;
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      nextTheme = 'dark';
    }

    document.documentElement.classList.toggle('dark', nextTheme === 'dark');

    const savedLang = localStorage.getItem('app_lang');
    const nextLang: Language = savedLang === 'en' || savedLang === 'vi' ? savedLang : 'vi';

    set({ theme: nextTheme, language: nextLang });
  },
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_theme', nextTheme);
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { theme: nextTheme };
    });
  },

  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_lang', lang);
    }
    set({ language: lang });
  },

  viewState: DEFAULT_VIEW_STATE,
  setViewState: (newView) =>
    set((state) => ({ viewState: { ...state.viewState, ...newView } })),

  flyToRegion: (center, zoom = 11) =>
    set((state) => ({
      viewState: {
        ...state.viewState,
        longitude: center[0],
        latitude: center[1],
        zoom,
      },
    })),

  layers: {
    boundary: true,
    demographics: true,
    ecommerce: false,
    pois: true,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
  setLayer: (layer, visible) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: visible },
    })),

  selectedRegion: null,
  selectedDemographics: null,
  selectedEcommerce: null,
  setSelectedRegion: (region, demo = null, ecom = null) =>
    set({
      selectedRegion: region,
      selectedDemographics: demo,
      selectedEcommerce: ecom,
    }),

  compareRegion: null,
  setCompareRegion: (region) => set({ compareRegion: region }),
  isCompareMode: false,
  setCompareMode: (enabled) => set({ isCompareMode: enabled }),

  filters: {},
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: {} }),

  isSiteSelectionActive: false,
  setSiteSelectionActive: (active) => set({ isSiteSelectionActive: active }),
  siteRadiusKm: 3,
  setSiteRadiusKm: (radius) => set({ siteRadiusKm: radius }),
  lastSiteAnalysis: null,
  setLastSiteAnalysis: (result) => set({ lastSiteAnalysis: result }),

  isAiModalOpen: false,
  setAiModalOpen: (open) => set({ isAiModalOpen: open }),
}));
