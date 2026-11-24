'use client';

import React, { useRef } from 'react';
import Map, { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LayerControl } from './LayerControl';
import { MapLegend } from './MapLegend';
import { BoundaryLayer } from '../layers/BoundaryLayer';
import { PopulationLayer } from '../layers/PopulationLayer';
import { EcommerceLayer } from '../layers/EcommerceLayer';
import { PoiLayer } from '../layers/PoiLayer';
import { analyzeSiteBuffer } from '@/lib/spatial';

const MAP_STYLE_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const MAP_STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export default function BaseMap() {
  const mapRef = useRef<MapRef>(null);
  const { 
    viewState, 
    setViewState, 
    layers, 
    theme,
    isSiteSelectionActive, 
    siteRadiusKm, 
    setLastSiteAnalysis,
    setSiteSelectionActive 
  } = useMapStore();
  const { t } = useTranslation();

  const handleMapClick = (e: { lngLat: { lng: number; lat: number } }) => {
    if (isSiteSelectionActive) {
      const { lng, lat } = e.lngLat;
      const result = analyzeSiteBuffer([lng, lat], siteRadiusKm);
      setLastSiteAnalysis(result);
    }
  };

  const currentMapStyle = theme === 'dark' ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={currentMapStyle}
        style={{ width: '100%', height: '100%' }}
        onClick={handleMapClick}
      >
        {/* Layer 1: Administrative Boundaries (Member 2) */}
        {layers.boundary && <BoundaryLayer />}

        {/* Layer 2: Population & Demographics (Member 3) */}
        {layers.demographics && <PopulationLayer />}

        {/* Layer 3: Purchasing Power & EBI (Member 4) */}
        {layers.ecommerce && <EcommerceLayer />}

        {/* Layer 4: Logistics POIs & Retail Hubs (Member 5) */}
        {layers.pois && <PoiLayer />}
      </Map>

      {/* Floating Layer Control on Top-Right */}
      <div className="absolute top-4 right-4 z-10">
        <LayerControl />
      </div>

      {/* Map Legend on Bottom-Left */}
      <div className="absolute bottom-6 left-4 z-10">
        <MapLegend />
      </div>

      {/* Active Site Selection Banner */}
      {isSiteSelectionActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-3 animate-pulse">
          <span>{t.siteSelection.clickPrompt}</span>
          <button 
            onClick={() => setSiteSelectionActive(false)}
            className="bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded-full text-xs cursor-pointer"
          >
            {t.siteSelection.close}
          </button>
        </div>
      )}
    </div>
  );
}
