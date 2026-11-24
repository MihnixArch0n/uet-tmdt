'use client';

import React, { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';

/**
 * =============================================================================
 * LAYER 4: Logistics Infrastructure & Retail POIs
 * OWNED BY: MEMBER 5
 * Responsibilities:
 * 1. Render Point markers for warehouses, post offices, and retail malls from pois.geojson
 * 2. Color-code markers based on facility type (warehouses: red, retail: blue)
 * 3. Support clustering at lower zoom levels and popup inspection on click
 * =============================================================================
 */
export function PoiLayer() {
  const [pois, setPois] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/data/pois.geojson')
      .then((res) => res.json())
      .then((data) => setPois(data))
      .catch((err) => console.error('Failed to load POIs:', err));
  }, []);

  if (!pois) return null;

  return (
    <Source id="pois-source" type="geojson" data={pois}>
      <Layer
        id="pois-circle"
        type="circle"
        paint={{
          'circle-radius': 6,
          'circle-color': [
            'match',
            ['get', 'category'],
            'warehouse', '#ef4444',
            'post_office', '#f97316',
            'logistics_hub', '#dc2626',
            'mall', '#3b82f6',
            '#8b5cf6'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }}
      />
    </Source>
  );
}
