# GIS & MapLibre GL Technical Guidelines

This rulebook governs all geospatial, mapping, and spatial computation code in the project.

## Core Libraries & Versions
- **Map Engine:** `maplibre-gl` (v6+) + `react-map-gl` (v8+)
- **Spatial Calculations:** `@turf/turf` (v7+)
- **Vector Basemap:** CartoDB Positron GL Style (`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`) or OpenFreeMap (no API key required).

---

## 1. SSR & Hydration Safety Rules
MapLibre GL requires the browser `window` and WebGL contexts. It **must never** execute on the server.
1. **Dynamic Import with SSR Disabled:**
   Always load MapLibre components dynamically in Next.js:
   ```tsx
   import dynamic from 'next/dynamic';

   const BaseMap = dynamic(() => import('@/components/map/BaseMap'), {
     ssr: false,
     loading: () => <MapLoadingSkeleton />,
   });
   ```
2. **Client-Side Guard:**
   Always use `'use client';` at the top of any GIS component file.
3. **Map Instance Readiness:**
   Never query layers or sources before the map has fired its `onLoad` or `load` event. Guard any `map.getSource(...)` or `map.getLayer(...)` with an `isLoaded` or `mapRef.current` null check.

---

## 2. Coordinate Conventions & Bounds
- **Standard Order:** All coordinates MUST follow the RFC 7946 GeoJSON standard: `[longitude, latitude]` (`[lng, lat]`).
- **Vietnam Coordinates Reference:**
  - National Viewport Center: `[106.5, 16.0]`, Zoom: `5.5`
  - Northern Focus (Hanoi): `[105.85, 21.03]`, Zoom: `11`
  - Southern Focus (Ho Chi Minh City): `[106.66, 10.76]`, Zoom: `11`
- **Bounds Checking:** When calculating bounding boxes with Turf (`turf.bbox`), pass coordinates in `[minX, minY, maxX, maxY]` order to `map.fitBounds(bbox, { padding: 40, duration: 1200 })`.

---

## 3. Map Layers & Styling Standards

### A. Administrative Boundaries (Layer 1)
- Render boundaries using `<Source id="admin-boundaries" type="geojson" data={...}>`.
- Outline lines should use `line-color: '#64748b'`, `line-width: 1.5`, and hover highlights with dynamic feature-state or filter expressions.
- Support smooth level transitions (`country` $\rightarrow$ `province` $\rightarrow$ `district` $\rightarrow$ `ward`).

### B. Choropleth & 3D Extrusion (Layers 2 & 3)
- **2D Choropleth Color Ramping:** Use MapLibre `interpolate` expressions for smooth data gradients:
  ```json
  [
    "interpolate",
    ["linear"],
    ["get", "density"],
    0, "#f8fafc",
    500, "#fed7aa",
    2000, "#f97316",
    10000, "#c2410c"
  ]
  ```
- **3D Extrusion:**
  - Use layer type `fill-extrusion`.
  - Set `fill-extrusion-height` to scale proportionally with metric values (e.g., population or EBI score):
    ```json
    ["interpolate", ["linear"], ["get", "population"], 100000, 500, 2000000, 15000]
    ```
  - Set `fill-extrusion-opacity: 0.85` to maintain basemap road network readability.

### C. POI Clustering & Symbols (Layer 4)
- Enable native clustering in GeoJSON sources:
  ```tsx
  <Source
    id="poi-source"
    type="geojson"
    data={poisData}
    cluster={true}
    clusterMaxZoom={14}
    clusterRadius={50}
  >
    {/* Clustered circles */}
    <Layer
      id="clusters"
      type="circle"
      filter={['has', 'point_count']}
      paint={{
        'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 50, '#f28cb1'],
        'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 32],
      }}
    />
    {/* Clustered counts */}
    <Layer
      id="cluster-count"
      type="symbol"
      filter={['has', 'point_count']}
      layout={{
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      }}
    />
    {/* Unclustered individual POIs */}
    <Layer
      id="unclustered-point"
      type="circle"
      filter={['!', ['has', 'point_count']]}
      paint={{
        'circle-color': '#4f46e5',
        'circle-radius': 6,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff',
      }}
    />
  </Source>
  ```

---

## 4. Spatial Analysis with Turf.js

1. **Buffer Analysis (Site Selection):**
   ```ts
   import * as turf from '@turf/turf';

   export function createBufferZone(center: [number, number], radiusKm: number) {
     const point = turf.point(center);
     return turf.circle(point, radiusKm, { units: 'kilometers', steps: 64 });
   }
   ```
2. **Point-in-Polygon & Spatial Filtering:**
   - Use `turf.booleanPointInPolygon` or `turf.pointsWithinPolygon` to filter POIs or demographics within the candidate buffer zone.
   - Run spatial calculations synchronously or inside Web Workers if feature counts exceed 5,000 points.

---

## 5. Performance Guidelines
- **Avoid Repeated Re-renders:** Store GeoJSON data externally or memoize data payloads with `useMemo`.
- **Feature State over Full Source Replacement:** For hover and click states, use `map.setFeatureState(...)` rather than reloading the entire GeoJSON payload.
- **Tear-down Cleanliness:** Always remove custom event listeners (`mousemove`, `mouseleave`, `click`) when components unmount.
