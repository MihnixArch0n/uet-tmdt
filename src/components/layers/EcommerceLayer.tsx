'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Layer, Popup, Source, useMap } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { EcommerceMetric, RegionProperties } from '@/types/market';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import {
  computeChoroplethScale,
  formatMetricValue,
  getMetricValue,
  loadEcommerceIndex,
  NO_DATA_COLOR_DARK,
  NO_DATA_COLOR_LIGHT,
} from '@/lib/ecommerceData';

interface HoveredRegion {
  longitude: number;
  latitude: number;
  name: string;
  valueText: string;
}

/**
 * LAYER 3: Purchasing Power & E-Commerce Readiness (EBI)
 * Renders data-driven MapLibre choropleth fills, filter highlight masks,
 * hover tooltips with explicit "No data" handling, and click routing.
 */
export function EcommerceLayer() {
  const [recordsByCode, setRecordsByCode] = useState<Record<string, EcommerceMetric>>({});
  const [boundaryGeo, setBoundaryGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [hovered, setHovered] = useState<HoveredRegion | null>(null);

  const activeEcommerceMetric = useMapStore((s) => s.activeEcommerceMetric);
  const matchedRegionCodes = useMapStore((s) => s.matchedRegionCodes);
  const isCompareMode = useMapStore((s) => s.isCompareMode);
  const compareRegions = useMapStore((s) => s.compareRegions);
  const theme = useMapStore((s) => s.theme);
  const setSelectedRegion = useMapStore((s) => s.setSelectedRegion);
  const assignCompareRegion = useMapStore((s) => s.assignCompareRegion);

  const { language } = useTranslation();
  const { current: mapRef } = useMap();

  useEffect(() => {
    let mounted = true;
    loadEcommerceIndex()
      .then((index) => {
        if (mounted) setRecordsByCode(index);
      })
      .catch((err) => console.error('Failed to load ecommerce metrics:', err));

    fetch('/data/boundaries/provinces_sample.geojson')
      .then((res) => res.json())
      .then((data: GeoJSON.FeatureCollection) => {
        if (mounted) setBoundaryGeo(data);
      })
      .catch((err) => console.error('Failed to load boundary GeoJSON for Layer 3:', err));

    return () => {
      mounted = false;
    };
  }, []);

  const scale = useMemo(() => {
    return computeChoroplethScale(Object.values(recordsByCode), activeEcommerceMetric);
  }, [recordsByCode, activeEcommerceMetric]);

  const enrichedGeoJson = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!boundaryGeo) return null;
    const matchedSet = matchedRegionCodes ? new Set(matchedRegionCodes) : null;
    const [slotACode, slotBCode] = compareRegions;

    return {
      ...boundaryGeo,
      features: boundaryGeo.features.map((feature) => {
        const props = (feature.properties ?? {}) as Partial<RegionProperties>;
        const code = props.code ?? '';
        const metric = recordsByCode[code];
        const activeValue = getMetricValue(metric, activeEcommerceMetric);
        const isMatched = matchedSet ? matchedSet.has(code) : true;
        const compareSlot = code === slotACode ? 'A' : code === slotBCode ? 'B' : '';

        return {
          ...feature,
          properties: {
            ...props,
            activeValue,
            hasData: activeValue !== null,
            isMatched,
            compareSlot,
          },
        };
      }),
    };
  }, [boundaryGeo, recordsByCode, activeEcommerceMetric, matchedRegionCodes, compareRegions]);

  useEffect(() => {
    if (!mapRef) return;
    const map = mapRef.getMap();
    const layerId = 'ecommerce-choropleth-fill';

    const handleMouseMove = (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) {
        setHovered(null);
        return;
      }
      map.getCanvas().style.cursor = 'pointer';
      const props = (feature.properties ?? {}) as Partial<RegionProperties> & {
        activeValue?: number | null;
      };
      const code = props.code ?? '';
      const record = recordsByCode[code];
      const val = getMetricValue(record, activeEcommerceMetric);
      setHovered({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        name: props.name ?? code,
        valueText: formatMetricValue(val, activeEcommerceMetric, language),
      });
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
      setHovered(null);
    };

    const handleClick = (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const props = (feature.properties ?? {}) as Partial<RegionProperties>;
      if (!props.code || !props.name) return;

      let parsedCenter: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      if (Array.isArray(props.center)) {
        parsedCenter = props.center as [number, number];
      } else if (typeof props.center === 'string') {
        try {
          parsedCenter = JSON.parse(props.center) as [number, number];
        } catch {
          // keep lngLat fallback
        }
      }

      const region: RegionProperties = {
        code: props.code,
        name: props.name,
        level: props.level ?? 'province',
        parentCode: props.parentCode,
        center: parsedCenter,
      };

      if (isCompareMode) {
        assignCompareRegion(region);
      } else {
        const ecomMetric = recordsByCode[region.code] ?? null;
        setSelectedRegion(region, null, ecomMetric);
      }
    };

    map.on('mousemove', layerId, handleMouseMove);
    map.on('mouseleave', layerId, handleMouseLeave);
    map.on('click', layerId, handleClick);

    return () => {
      map.off('mousemove', layerId, handleMouseMove);
      map.off('mouseleave', layerId, handleMouseLeave);
      map.off('click', layerId, handleClick);
    };
  }, [mapRef, recordsByCode, activeEcommerceMetric, language, isCompareMode, assignCompareRegion, setSelectedRegion]);

  if (!enrichedGeoJson) return null;

  const noDataColor = theme === 'dark' ? NO_DATA_COLOR_DARK : NO_DATA_COLOR_LIGHT;

  const fillColorExpression: unknown =
    scale.hasData && scale.stops.length >= 2
      ? [
          'case',
          ['!', ['get', 'hasData']],
          noDataColor,
          [
            'interpolate',
            ['linear'],
            ['get', 'activeValue'],
            ...scale.stops.flatMap((stop) => [stop.value, stop.color]),
          ],
        ]
      : noDataColor;

  const fillOpacityExpression: unknown = matchedRegionCodes
    ? ['case', ['get', 'isMatched'], 0.82, 0.15]
    : 0.72;

  return (
    <>
      <Source id="ecommerce-source" type="geojson" data={enrichedGeoJson}>
        <Layer
          id="ecommerce-choropleth-fill"
          type="fill"
          paint={{
            'fill-color': fillColorExpression as never,
            'fill-opacity': fillOpacityExpression as never,
          }}
        />
        <Layer
          id="ecommerce-choropleth-outline"
          type="line"
          paint={{
            'line-color': [
              'case',
              ['==', ['get', 'compareSlot'], 'A'],
              '#4f46e5',
              ['==', ['get', 'compareSlot'], 'B'],
              '#d97706',
              ['get', 'isMatched'],
              '#1e293b',
              '#94a3b8',
            ] as never,
            'line-width': [
              'case',
              ['!=', ['get', 'compareSlot'], ''],
              3,
              matchedRegionCodes ? ['case', ['get', 'isMatched'], 2, 0.5] : 1,
            ] as never,
          }}
        />
      </Source>

      {hovered && (
        <Popup
          longitude={hovered.longitude}
          latitude={hovered.latitude}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          offset={10}
          className="z-30"
        >
          <div className="px-2 py-1 text-xs">
            <div className="font-semibold text-zinc-900">{hovered.name}</div>
            <div className="text-zinc-600">{hovered.valueText}</div>
          </div>
        </Popup>
      )}
    </>
  );
}
