# UI, Styling & Component Guidelines

This rulebook standardizes design system conventions, layout hierarchy, and charting patterns.

## Tech Stack
- **CSS Engine:** Tailwind CSS v4 (`@import "tailwindcss";`, `@theme inline`)
- **Component Primitives:** shadcn/ui (`@base-ui/react`, `class-variance-authority`, `cn`)
- **Icons:** `lucide-react`
- **Charts:** `recharts` (v3+)

---

## 1. Tailwind CSS v4 & Styling Rules
1. **Modern Tailwind Syntax:**
   - Do not create or expect `tailwind.config.js`. Theme tokens are defined in `src/app/globals.css` via `@theme inline`.
   - Utility class composition uses the `cn(...)` helper from `@/lib/utils`.
2. **Theme Support (Dark & Light):**
   - The root document element toggles between `.dark` and standard light mode.
   - Always pair dark and light utility classes:
     ```tsx
     className="bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800"
     ```
3. **Glassmorphism for Floating Overlays:**
   - Floating panels above the map must use semi-transparency and backdrop blur:
     `bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md shadow-lg rounded-xl`

---

## 2. Layout & Viewport Hierarchy

The viewport is strictly locked to `100vh` with no window scrollbars:

```
┌─────────────────────────────────────────────────────────────────┐
│ Navbar (h-16): Logo, Search, Layer Toggles, Lang, Theme, AI Btn │
├─────────────────────────────────────────────────────────────────┤
│ Map Canvas (h-[calc(100vh-4rem)], relative, overflow-hidden)    │
│  ├── [MapLibre WebGL Viewport]                                  │
│  ├── [Top-Right: LayerControl & Filter Panels]                  │
│  ├── [Bottom-Left: MapLegend & Scale]                           │
│  ├── [Bottom-Right: SiteSelection Tool Floating Bar]            │
│  └── [Slide-over Drawer: DetailDrawer (Right 420px)]            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Recharts Implementation Rules

Recharts graphs live inside `DetailDrawer.tsx` and analytics cards:

1. **Responsive Container:**
   Always wrap charts in `<ResponsiveContainer width="100%" height={220}>` to prevent layout overflow.
2. **Themed Tooltips:**
   Style tooltips to match current theme tokens with explicit text colors:
   ```tsx
   <Tooltip
     contentStyle={{
       backgroundColor: 'var(--popover)',
       borderColor: 'var(--border)',
       borderRadius: '8px',
       color: 'var(--popover-foreground)',
       fontSize: '12px',
     }}
   />
   ```
3. **Number Formatting in Charts:**
   - Format monetary values into millions or billions (e.g., `15.5M VND`).
   - Format population counts with commas (`Intl.NumberFormat('vi-VN')`).

---

## 4. Component Structure & Naming Conventions
- `src/components/layout/`: Global shells (`Navbar.tsx`).
- `src/components/map/`: Core map canvas (`BaseMap.tsx`), controls (`LayerControl.tsx`), and legends (`MapLegend.tsx`).
- `src/components/layers/`: Visual data layers (`BoundaryLayer.tsx`, `PopulationLayer.tsx`, `EcommerceLayer.tsx`, `PoiLayer.tsx`).
- `src/components/analytics/`: Charting and statistical inspectors (`DemographicCharts.tsx`, `DetailDrawer.tsx`).
- `src/components/decision/`: Decision support tools (`SiteSelectionTool.tsx`, `AiConsultantDialog.tsx`).
- `src/components/search/`: Location autocomplete (`SearchBar.tsx`).
