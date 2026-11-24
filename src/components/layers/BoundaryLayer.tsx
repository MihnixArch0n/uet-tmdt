'use client';

import React, { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useMapStore } from '@/store/useMapStore';

/**
 * =============================================================================
 * LAYER 1: Administrative Boundaries (Country -> Province -> District -> Ward)
 * OWNED BY: MEMBER 2
 * Responsibilities:
 * 1. Collect, clean, and compress GeoJSON data into public/data/boundaries/
 * 2. Configure line styling, hover highlights, and zoom-dependent visibility
 * 3. Handle click events to invoke setSelectedRegion(region)
 * =============================================================================
 */
export function BoundaryLayer() {
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
  const { setSelectedRegion } = useMapStore();

  useEffect(() => {
    // Load sample boundary GeoJSON
    fetch('/data/boundaries/provinces_sample.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error('Failed to load boundary GeoJSON:', err));
  }, []);

  if (!geoData) return null;

  return (
    <Source id="boundary-source" type="geojson" data={geoData}>
      {/* Province boundary stroke */}
      <Layer
        id="boundary-line"
        type="line"
        paint={{
          'line-color': '#2563eb',
          'line-width': 1.5,
          'line-dasharray': [2, 1],
        }}
      />

      {/* Polygon fill layer for click interactions */}
      <Layer
        id="boundary-fill"
        type="fill"
        paint={{
          'fill-color': '#3b82f6',
          'fill-opacity': 0.1,
        }}
      />
    </Source>
  );
}
