'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Source, useMap } from 'react-map-gl/maplibre';
import type { ExpressionSpecification, MapLayerMouseEvent } from 'maplibre-gl';
import { Box, Layers2, Users, Activity } from 'lucide-react';
import { DemographicMetric, EcommerceMetric, RegionProperties } from '@/types/market';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

type RenderMode = '2d' | '3d';
type MetricMode = 'density' | 'population';

interface HoverInfo {
  x: number;
  y: number;
  name: string;
  code: string;
  population: number;
  density: number;
  urbanizationRate: number;
}

const SOURCE_ID = 'population-source';
const LAYER_2D_ID = 'population-choropleth';
const LAYER_3D_ID = 'population-extrusion';
const LAYER_OUTLINE_ID = 'population-outline';

const DENSITY_COLOR_EXPR: ExpressionSpecification = [
  'case',
  ['==', ['get', 'hasDemographics'], true],
  [
    'interpolate',
    ['linear'],
    ['get', 'density'],
    0,
    '#f8fafc',
    250,
    '#ffedd5',
    500,
    '#fed7aa',
    1200,
    '#fb923c',
    2500,
    '#f97316',
    5000,
    '#ea580c',
    10000,
    '#c2410c',
  ],
  '#e2e8f0',
];

const POPULATION_COLOR_EXPR: ExpressionSpecification = [
  'case',
  ['==', ['get', 'hasDemographics'], true],
  [
    'interpolate',
    ['linear'],
    ['get', 'population'],
    0,
    '#f0fdf4',
    600000,
    '#bbf7d0',
    1500000,
    '#4ade80',
    3000000,
    '#16a34a',
    6000000,
    '#15803d',
    9500000,
    '#14532d',
  ],
  '#e2e8f0',
];

const DENSITY_HEIGHT_EXPR: ExpressionSpecification = [
  'case',
  ['==', ['get', 'meetsFilter'], true],
  [
    'interpolate',
    ['linear'],
    ['get', 'density'],
    0,
    2000,
    500,
    18000,
    1500,
    40000,
    3000,
    72000,
    5000,
    105000,
    15000,
    150000,
  ],
  1500,
];

const POPULATION_HEIGHT_EXPR: ExpressionSpecification = [
  'case',
  ['==', ['get', 'meetsFilter'], true],
  [
    'interpolate',
    ['linear'],
    ['get', 'population'],
    0,
    2000,
    1000000,
    22000,
    3000000,
    55000,
    6000000,
    92000,
    9500000,
    135000,
  ],
  1500,
];

function parseCenter(rawCenter: unknown, fallback: [number, number]): [number, number] {
  if (Array.isArray(rawCenter) && rawCenter.length >= 2) {
    const lng = Number(rawCenter[0]);
    const lat = Number(rawCenter[1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
  }
  if (typeof rawCenter === 'string') {
    try {
      const parsed = JSON.parse(rawCenter);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        const lng = Number(parsed[0]);
        const lat = Number(parsed[1]);
        if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
      }
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * =============================================================================
 * LAYER 2: Population & Demographic Distribution (2D Choropleth & 3D Extrusion)
 * OWNED BY: MEMBER 3
 * Responsibilities:
 * 1. Join demographics.json with boundaries using administrative code
 * 2. Render interactive 2D Choropleth and 3D Extrusion by density / population
 * 3. Handle hover tooltip, filter dimming, and click-to-inspect Side Drawer
 * =============================================================================
 */
export function PopulationLayer() {
  const { current: mapRef } = useMap();
  const { language } = useTranslation();

  // Atomic Zustand selectors (strictly adhering to state-zustand.md)
  const selectedRegion = useMapStore((state) => state.selectedRegion);
  const setSelectedRegion = useMapStore((state) => state.setSelectedRegion);
  const minPopulation = useMapStore((state) => state.filters.minPopulation);
  const isSiteSelectionActive = useMapStore((state) => state.isSiteSelectionActive);
  const setViewState = useMapStore((state) => state.setViewState);

  const [boundaries, setBoundaries] = useState<GeoJSON.FeatureCollection | null>(null);
  const [demographics, setDemographics] = useState<DemographicMetric[]>([]);
  const [ecommerce, setEcommerce] = useState<EcommerceMetric[]>([]);
  const [renderMode, setRenderMode] = useState<RenderMode>('2d');
  const [metricMode, setMetricMode] = useState<MetricMode>('density');
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const hoveredFeatureIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadLayerData() {
      try {
        const [demoRes, ecomRes, boundaryRes] = await Promise.all([
          fetch('/data/demographics.json'),
          fetch('/data/ecommerce.json'),
          fetch('/data/boundaries/provinces_sample.geojson'),
        ]);

        const [demoData, ecomData, boundaryData] = await Promise.all([
          demoRes.ok ? (demoRes.json() as Promise<DemographicMetric[]>) : Promise.resolve([]),
          ecomRes.ok ? (ecomRes.json() as Promise<EcommerceMetric[]>) : Promise.resolve([]),
          boundaryRes.ok
            ? (boundaryRes.json() as Promise<GeoJSON.FeatureCollection>)
            : Promise.resolve(null),
        ]);

        if (!isCancelled) {
          setDemographics(demoData);
          setEcommerce(ecomData);
          setBoundaries(boundaryData);
        }
      } catch (err) {
        console.error('Failed to load Layer 2 population datasets:', err);
      }
    }

    loadLayerData();
    return () => {
      isCancelled = true;
    };
  }, []);

  const demoByCode = useMemo(() => {
    const map = new Map<string, DemographicMetric>();
    for (const item of demographics) {
      map.set(item.code, item);
    }
    return map;
  }, [demographics]);

  const ecomByCode = useMemo(() => {
    const map = new Map<string, EcommerceMetric>();
    for (const item of ecommerce) {
      map.set(item.code, item);
    }
    return map;
  }, [ecommerce]);

  // Join boundary geometries with demographic attributes by administrative code
  const joinedGeoJson = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!boundaries) return null;

    return {
      type: 'FeatureCollection',
      features: boundaries.features.map((feature, index) => {
        const code = String(feature.properties?.code ?? '');
        const metric = demoByCode.get(code);
        const population = metric?.population ?? 0;
        const density = metric?.density ?? 0;
        const urbanizationRate = metric?.urbanizationRate ?? 0;
        const meetsFilter = !minPopulation || population >= minPopulation;

        return {
          ...feature,
          id: index + 1,
          properties: {
            ...feature.properties,
            population,
            density,
            urbanizationRate,
            hasDemographics: Boolean(metric),
            meetsFilter,
          },
        };
      }),
    };
  }, [boundaries, demoByCode, minPopulation]);

  const activeLayerId = renderMode === '3d' ? LAYER_3D_ID : LAYER_2D_ID;
  const activeColorExpr = metricMode === 'density' ? DENSITY_COLOR_EXPR : POPULATION_COLOR_EXPR;
  const activeHeightExpr = metricMode === 'density' ? DENSITY_HEIGHT_EXPR : POPULATION_HEIGHT_EXPR;
  const selectedCode = selectedRegion?.code ?? '';

  const handleToggleRenderMode = (nextMode: RenderMode) => {
    setRenderMode(nextMode);
    const map = mapRef?.getMap();
    const targetPitch = nextMode === '3d' ? 48 : 0;
    const targetBearing = nextMode === '3d' ? -15 : 0;

    if (map) {
      map.easeTo({
        pitch: targetPitch,
        bearing: targetBearing,
        duration: 650,
      });
    }
    setViewState({ pitch: targetPitch, bearing: targetBearing });
  };

  // Attach MapLibre hover & click interactions with proper teardown
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map || !joinedGeoJson) return;

    const clearHoverState = () => {
      if (hoveredFeatureIdRef.current !== null && map.getSource(SOURCE_ID)) {
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredFeatureIdRef.current },
          { hover: false }
        );
        hoveredFeatureIdRef.current = null;
      }
      map.getCanvas().style.cursor = '';
      setHoverInfo(null);
    };

    const handleMouseMove = (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) {
        clearHoverState();
        return;
      }

      map.getCanvas().style.cursor = 'pointer';

      if (hoveredFeatureIdRef.current !== null && hoveredFeatureIdRef.current !== feature.id) {
        if (map.getSource(SOURCE_ID)) {
          map.setFeatureState(
            { source: SOURCE_ID, id: hoveredFeatureIdRef.current },
            { hover: false }
          );
        }
      }

      if (feature.id !== undefined && map.getSource(SOURCE_ID)) {
        hoveredFeatureIdRef.current = feature.id;
        map.setFeatureState({ source: SOURCE_ID, id: feature.id }, { hover: true });
      }

      const props = feature.properties ?? {};
      setHoverInfo({
        x: e.point.x,
        y: e.point.y,
        name: String(props.name ?? props.code ?? ''),
        code: String(props.code ?? ''),
        population: Number(props.population ?? 0),
        density: Number(props.density ?? 0),
        urbanizationRate: Number(props.urbanizationRate ?? 0),
      });
    };

    const handleMouseLeave = () => {
      clearHoverState();
    };

    const handleClick = (e: MapLayerMouseEvent) => {
      if (isSiteSelectionActive) return;

      const feature = e.features?.[0];
      if (!feature?.properties) return;

      const props = feature.properties;
      const code = String(props.code ?? '');
      if (!code) return;

      const levelRaw = String(props.level ?? 'province');
      const level: RegionProperties['level'] =
        levelRaw === 'country' ||
        levelRaw === 'province' ||
        levelRaw === 'district' ||
        levelRaw === 'ward'
          ? levelRaw
          : 'province';

      const region: RegionProperties = {
        code,
        name: String(props.name ?? code),
        level,
        parentCode: props.parentCode ? String(props.parentCode) : undefined,
        center: parseCenter(props.center, [e.lngLat.lng, e.lngLat.lat]),
      };

      const demo = demoByCode.get(code) ?? null;
      const ecom = ecomByCode.get(code) ?? null;

      setSelectedRegion(region, demo, ecom);
    };

    map.on('mousemove', activeLayerId, handleMouseMove);
    map.on('mouseleave', activeLayerId, handleMouseLeave);
    map.on('click', activeLayerId, handleClick);

    return () => {
      map.off('mousemove', activeLayerId, handleMouseMove);
      map.off('mouseleave', activeLayerId, handleMouseLeave);
      map.off('click', activeLayerId, handleClick);
      clearHoverState();
    };
  }, [
    mapRef,
    joinedGeoJson,
    activeLayerId,
    demoByCode,
    ecomByCode,
    isSiteSelectionActive,
    setSelectedRegion,
  ]);

  if (!joinedGeoJson) return null;

  const numberFormatter = new Intl.NumberFormat('vi-VN');

  return (
    <>
      <Source id={SOURCE_ID} type="geojson" data={joinedGeoJson}>
        {/* 2D Choropleth Fill Layer */}
        {renderMode === '2d' && (
          <Layer
            id={LAYER_2D_ID}
            type="fill"
            paint={{
              'fill-color': activeColorExpr,
              'fill-opacity': [
                'case',
                ['!=', ['get', 'meetsFilter'], true],
                0.14,
                ['boolean', ['feature-state', 'hover'], false],
                0.86,
                ['==', ['get', 'code'], selectedCode],
                0.84,
                0.68,
              ],
            }}
          />
        )}

        {/* 3D Extrusion Layer */}
        {renderMode === '3d' && (
          <Layer
            id={LAYER_3D_ID}
            type="fill-extrusion"
            paint={{
              'fill-extrusion-color': activeColorExpr,
              'fill-extrusion-height': activeHeightExpr,
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.85,
            }}
          />
        )}

        {/* Interactive Highlight Border */}
        <Layer
          id={LAYER_OUTLINE_ID}
          type="line"
          paint={{
            'line-color': [
              'case',
              ['==', ['get', 'code'], selectedCode],
              '#4f46e5',
              ['boolean', ['feature-state', 'hover'], false],
              '#0f172a',
              '#64748b',
            ],
            'line-width': [
              'case',
              ['==', ['get', 'code'], selectedCode],
              2.8,
              ['boolean', ['feature-state', 'hover'], false],
              2.2,
              1.1,
            ],
          }}
        />
      </Source>

      {/* Floating Population Layer Controls (2D/3D & Metric Switcher) */}
      <div className="absolute top-4 left-4 z-10 w-64 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-zinc-200 dark:border-zinc-800 text-xs transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {language === 'vi' ? 'Trực Quan Dân Số (Lớp 2)' : 'Population View (Layer 2)'}
            </span>
          </div>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50">
            {renderMode.toUpperCase()}
          </span>
        </div>

        {/* 2D Choropleth vs 3D Extrusion Toggle */}
        <div className="grid grid-cols-2 gap-1.5 mt-2.5">
          <button
            type="button"
            onClick={() => handleToggleRenderMode('2d')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              renderMode === '2d'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70'
            }`}
          >
            <Layers2 className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'vi' ? '2D Phẳng' : '2D Flat'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleRenderMode('3d')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              renderMode === '3d'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70'
            }`}
          >
            <Box className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'vi' ? '3D Khối' : '3D Extrude'}</span>
          </button>
        </div>

        {/* Metric Toggle: Density vs Total Population */}
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <button
            type="button"
            onClick={() => setMetricMode('density')}
            className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
              metricMode === 'density'
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>{language === 'vi' ? 'Mật độ' : 'Density'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('population')}
            className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
              metricMode === 'population'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>{language === 'vi' ? 'Quy mô dân số' : 'Population'}</span>
          </button>
        </div>

        {/* Active Color Ramp Scale */}
        <div className="mt-2.5 pt-2 border-t border-zinc-200/70 dark:border-zinc-800">
          <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mb-1">
            <span>
              {metricMode === 'density'
                ? language === 'vi'
                  ? 'Thang mật độ (người/km²)'
                  : 'Density scale (ppl/km²)'
                : language === 'vi'
                ? 'Thang dân số (triệu người)'
                : 'Population scale (M)'}
            </span>
          </div>
          <div
            className={`h-2 w-full rounded-full ${
              metricMode === 'density'
                ? 'bg-gradient-to-r from-[#f8fafc] via-[#fed7aa] via-45% via-[#f97316] to-[#c2410c]'
                : 'bg-gradient-to-r from-[#f0fdf4] via-[#4ade80] via-50% to-[#14532d]'
            }`}
          />
          <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
            {metricMode === 'density' ? (
              <>
                <span>0</span>
                <span>500</span>
                <span>2.5k</span>
                <span>10k+</span>
              </>
            ) : (
              <>
                <span>0</span>
                <span>1.5M</span>
                <span>6M</span>
                <span>9.5M+</span>
              </>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5">
            {language === 'vi'
              ? 'Nhấp vào vùng trên bản đồ để mở bảng nhân khẩu.'
              : 'Click any region to open demographic insights.'}
          </p>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoverInfo && (
        <div
          style={{
            left: Math.min(hoverInfo.x + 14, typeof window !== 'undefined' ? window.innerWidth - 240 : hoverInfo.x + 14),
            top: Math.max(hoverInfo.y - 12, 12),
          }}
          className="pointer-events-none absolute z-20 w-56 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-zinc-200 dark:border-zinc-700 text-xs"
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {hoverInfo.name}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">{hoverInfo.code}</span>
          </div>
          <div className="mt-1.5 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">
                {language === 'vi' ? 'Dân số:' : 'Population:'}
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {hoverInfo.population > 0 ? numberFormatter.format(hoverInfo.population) : '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">
                {language === 'vi' ? 'Mật độ:' : 'Density:'}
              </span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {hoverInfo.density > 0
                  ? `${numberFormatter.format(hoverInfo.density)} ${language === 'vi' ? 'ng/km²' : 'ppl/km²'}`
                  : '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">
                {language === 'vi' ? 'Đô thị hóa:' : 'Urbanization:'}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {hoverInfo.urbanizationRate > 0 ? `${hoverInfo.urbanizationRate}%` : '---'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
