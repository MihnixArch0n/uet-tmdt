# Feature Specification: Purchasing Power, E-Commerce Readiness (EBI), Market Filtering & Region Comparison

**Feature Branch**: `001-ebi-filtering-comparison`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "Build the 'Purchasing Power, E-Commerce Readiness (EBI), Market Filtering, and Region Comparison' feature set for the Vietnam Market & Customer Demand Digital Map system."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Purchasing Power & EBI Map Visualization (Priority: P1)

Business analysts, e-commerce sellers, and operations planners switch the digital map's thematic visualization mode to inspect economic and e-commerce readiness indicators across Vietnam's administrative regions (34 provinces/cities macro level, and detailed districts and demo wards in Hanoi and Ho Chi Minh City). They can toggle between E-Commerce Index (EBI), Average Monthly Income per Capita, and Total Retail Sales of Goods and Services, read a dynamic legend with units and min/max thresholds, hover over regions for quick metric tooltips, and click a region to view its full economic breakdown and top potential online product categories.

**Why this priority**: Visualizing spatial disparities in purchasing power and e-commerce readiness is the foundational capability of the market analysis workflow; both filtering and side-by-side comparison build directly on top of these thematic metrics.

**Independent Test**: Can be fully tested by switching between the three thematic metric modes on the map, hovering and clicking on regions with available data as well as regions lacking data, and verifying that colors, legend thresholds, tooltips, and the region detail breakdown update accurately without page reloads.

**Acceptance Scenarios**:

1. **Given** the user is viewing the digital map, **When** they select "E-Commerce Index (EBI)", "Average Monthly Income per Capita", or "Total Retail Sales of Goods and Services" as the active thematic metric, **Then** all administrative regions on the map re-color according to a choropleth intensity scale and a dynamic legend updates to show the metric name, unit, value ranges, and min/max thresholds.
2. **Given** a thematic economic metric is active on the map, **When** the user hovers over an administrative region that has data for that metric, **Then** a concise tooltip displays the region name and its formatted value for the active metric.
3. **Given** a thematic economic metric is active on the map, **When** the user clicks an administrative region, **Then** the region is selected and its economic breakdown is displayed, including EBI score, average monthly income, total retail sales, and top potential online product categories (F&B, Fashion, Tech/Electronics, FMCG).
4. **Given** a region has missing or unavailable data for the currently selected metric (for example, a province-only metric viewed at a finer level without disaggregated data, or an unmapped ward), **When** the map renders that region, **Then** the region is shaded in a visually distinct neutral color (such as neutral gray) and both its tooltip and detail breakdown display an explicit "No data" indicator rather than zero.

---

### User Story 2 - Multi-Criteria Market Filter (Priority: P2)

Analysts and sellers open the Market Filter panel to combine multiple economic and product-category criteria simultaneously—such as minimum/maximum EBI score, minimum/maximum average monthly income, and one or more target online product categories (F&B, Fashion, Tech/Electronics, FMCG)—to isolate high-potential markets. Matching regions remain highlighted on the map while non-matching regions are dimmed, accompanied by a live match count and clickable result list.

**Why this priority**: Once users can see economic metrics on the map, they need to rapidly narrow down dozens of provinces or districts to a shortlist of qualified expansion targets based on specific business thresholds.

**Independent Test**: Can be fully tested by opening the Market Filter panel, applying single and combined criteria (EBI range, income range, product categories), clicking a region from the matched list to focus on it, testing a zero-match combination, and clicking "Reset Filters" to restore the unfiltered map.

**Acceptance Scenarios**:

1. **Given** the Market Filter panel is open, **When** the user sets an EBI score range (e.g., EBI > 70), an average monthly income range (e.g., income > 15,000,000 VND), and/or selects one or more product categories (F&B, Fashion, Tech/Electronics, FMCG), **Then** matching regions are immediately highlighted on the map and non-matching regions are visually dimmed/de-emphasized.
2. **Given** one or more filter criteria are active, **When** the matching set updates, **Then** the panel displays a live count of matching regions (e.g., "12 / 34 provinces match") and a scrollable quick list of matched regions.
3. **Given** a quick list of matched regions is displayed, **When** the user clicks a region in the list, **Then** the map focuses on and selects that region so the user can inspect its details.
4. **Given** filter criteria are applied that match zero regions, **When** the filter evaluates, **Then** the system displays a clear empty-state message explaining that no regions match and prompting the user to relax their criteria.
5. **Given** one or more filters are active, **When** the user clicks "Reset Filters", **Then** all filter inputs return to their default unbounded state, all regions return to normal thematic styling, and the match count reflects the full unfiltered dataset.

---

### User Story 3 - Two-Region Comparison Mode (Priority: P3)

Operations planners and expansion managers toggle "Compare Mode" to evaluate two candidate regions (Region A and Region B) side-by-side. They can populate Slot A and Slot B by clicking regions directly on the map or choosing from a region selector, inspect side-by-side metrics with absolute and percentage delta indicators showing which region leads, swap or clear slots, and exit Compare Mode without losing their current map viewport.

**Why this priority**: After visualizing and filtering candidate regions, decision-makers need a structured head-to-head comparison to choose between top finalists for a fulfillment center, retail store, or market launch.

**Independent Test**: Can be fully tested by toggling Compare Mode on, selecting two regions via map clicks and selectors, verifying delta calculations and leader highlights, attempting to select the same region twice, comparing regions from different administrative tiers, swapping A and B, clearing one slot, and exiting Compare Mode while confirming the map viewport remains unchanged.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard, **When** they toggle "Compare Mode" on, **Then** a side-by-side Comparison Panel opens with empty Slot A and Slot B ready for selection.
2. **Given** Compare Mode is active, **When** the user selects Region A and Region B (via map click or region selector), **Then** the Comparison Panel displays both regions' EBI score, average monthly income, total retail sales, and top potential online product categories, along with visual delta indicators (absolute difference and percentage difference) highlighting which region leads on each numeric metric.
3. **Given** Region A is already selected in Slot A, **When** the user attempts to select the exact same region for Slot B, **Then** the system prevents the duplicate selection and displays clear feedback informing the user that two distinct regions are required.
4. **Given** Region A and Region B are populated, **When** the user compares two regions from different administrative levels (e.g., a Province vs. a Ward), **Then** the Comparison Panel displays a clear notice or warning explaining the administrative scale difference.
5. **Given** Region A and Region B are populated, **When** the user clicks "Swap", **Then** Region A and Region B exchange slots and all delta indicators recalculate accordingly; **When** the user clears a slot, **Then** only that slot resets while the other remains populated.
6. **Given** Compare Mode is active, **When** the user exits Compare Mode, **Then** the Comparison Panel closes and the user's current map viewport (center and zoom level) is preserved.

---

### Edge Cases

- What happens when a region has partial data (e.g., EBI score is available, but Total Retail Sales is missing at the district or ward level)? The available metrics are displayed normally, while missing metrics show "No data" in both the detail breakdown and Comparison Panel, and delta indicators for that metric show "N/A" instead of computing a misleading difference against zero.
- What happens when a user switches the active thematic metric while Market Filters are active? The map updates its choropleth color scale and legend to the newly selected metric while preserving the active filter highlight/dimming state.
- What happens when a region is selected in Compare Mode and its value for a metric is zero versus missing? A valid zero value is formatted as "0" and included in delta calculations, whereas a missing/null value is treated as "No data" and excluded from delta calculations.
- What happens when the user's filter criteria exclude a region that is currently selected in Compare Mode? Compare Mode retains the selected regions in Slots A and B so the user does not lose their comparison context.
- What happens when comparing two regions where the baseline (Region A) has a metric value of zero? Percentage difference avoids division-by-zero errors by displaying "N/A" for the percentage while still showing the absolute difference.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to switch the map's thematic visualization among three economic/e-commerce metrics: E-Commerce Index (EBI), Average Monthly Income per Capita (VND/month), and Total Retail Sales of Goods and Services.
- **FR-002**: System MUST render administrative regions using a choropleth color scale corresponding to the active metric's values and display a dynamic legend showing the metric's title, unit, value ranges, and min/max thresholds.
- **FR-003**: System MUST display a concise tooltip on region hover showing the region's name and its formatted value for the currently active metric (or "No data" when unavailable).
- **FR-004**: System MUST display a region detail breakdown upon clicking a region, including its EBI score, average monthly income, total retail sales, and top potential online product categories (F&B, Fashion, Tech/Electronics, FMCG).
- **FR-005**: System MUST visually distinguish regions with missing or unavailable data for the active metric (e.g., neutral gray fill) and label them explicitly as "No data" rather than "0".
- **FR-006**: System MUST provide a Market Filter panel supporting simultaneous filtering by EBI score range (min–max), average monthly income range (min–max), and potential online product categories (multi-select across F&B, Fashion, Tech/Electronics, FMCG).
- **FR-007**: System MUST immediately highlight matching regions and dim/de-emphasize non-matching regions on the map whenever filter criteria change, without requiring a page reload.
- **FR-008**: System MUST display a live count of matching regions relative to the total regions in the active scope (e.g., "12 / 34 provinces match") and a clickable list of matched regions that focuses the map on the chosen region when clicked.
- **FR-009**: System MUST provide a single-click "Reset Filters" action that clears all filter criteria and restores the unfiltered map state, and MUST display a clear empty-state message with guidance to relax criteria when zero regions match.
- **FR-010**: System MUST allow users to toggle "Compare Mode" on and off from the dashboard and preserve the user's current map viewport when entering or exiting Compare Mode.
- **FR-011**: System MUST allow users in Compare Mode to assign two distinct regions (Region A and Region B) by clicking regions on the map or selecting them from a region selector, and MUST prevent selecting the same region for both slots with clear user feedback.
- **FR-012**: System MUST display a side-by-side Comparison Panel showing EBI score, average monthly income, total retail sales, and top potential online categories for both Region A and Region B, along with absolute difference, percentage difference, and a clear visual indicator of which region leads on each numeric metric.
- **FR-013**: System MUST allow users to swap Region A and Region B, clear an individual comparison slot, and display a clear scale-difference notice/warning if Region A and Region B belong to different administrative levels (e.g., Province vs. Ward).
- **FR-014**: All economic and e-commerce records MUST be linked to administrative regions via a standardized administrative region code covering all 34 provinces/cities at the macro level and detailed districts and demo wards in Hanoi and Ho Chi Minh City, structured for consumption by downstream analytical tools.

### Key Entities

- **Administrative Region**: A geographic unit in Vietnam's administrative hierarchy (Province/City, District, or Ward/Commune) identified by a standardized administrative region code (`code`), name, and administrative level.
- **Economic & E-Commerce Profile**: The purchasing power and e-commerce readiness dataset linked to an administrative region via `code`, containing EBI score (0–100), average monthly income per capita (VND/month), total retail sales of goods and services (where available at macro level), and ranked/tagged top potential online product categories (F&B, Fashion, Tech/Electronics, FMCG).
- **Market Filter Criteria**: The active set of user-defined constraints consisting of optional min/max EBI bounds, optional min/max monthly income bounds, and selected product category tags.
- **Region Comparison Pair**: A pair of distinct administrative region references (Slot A and Slot B) with computed metric deltas (absolute and percentage) and an administrative-level parity check.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between any of the three thematic economic metrics and observe updated map colors, legend ranges, and tooltips within 500 milliseconds without page reloads.
- **SC-002**: 100% of Vietnam's 34 provinces/cities and all included Hanoi and Ho Chi Minh City demo districts/wards accurately align their economic metrics with their map boundaries via standardized region codes, with zero mismatched or silently zeroed missing-data regions.
- **SC-003**: Users can apply or reset multi-criteria market filters (EBI, income, and product categories) and see updated map highlights, match counts, and matched region lists in under 500 milliseconds.
- **SC-004**: Users can enter Compare Mode, select two distinct regions, inspect metric deltas and leader indicators, and exit Compare Mode back to their exact prior map viewport in under 30 seconds on first attempt.

## Assumptions

- **Base Map & Navigation**: Base map rendering, 4-tier administrative boundary drill-down navigation, and place-name search are handled by existing/parallel platform capabilities and are out of scope for this feature.
- **Demographics & AI Features**: Demographic/population choropleths, age-pyramid charts, POI markers, radius site scoring, and AI strategy chat generation are out of scope, though this feature's structured economic data remains accessible for downstream consumption by those features.
- **Category Filter Matching**: When multiple product categories are selected in the Market Filter, regions matching *any* of the selected categories (inclusive OR) are included by default so users can broaden their target pool across multiple verticals.
- **Metric Availability by Level**: Total Retail Sales of Goods and Services is primarily reported at the province/city level; district and ward views may display "No data" for retail sales while providing EBI (estimated/propagated) and Average Monthly Income per Capita for Hanoi and Ho Chi Minh City focus areas.
- **Data Freshness & Static Scope**: Economic and e-commerce metrics are pre-compiled reference datasets representing current market snapshots; live external data ingestion or user-uploaded datasets are not required.
