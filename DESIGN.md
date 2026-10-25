# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-10-11
- Primary product surfaces: yearly calendar, lunar-month calendar, event and location dialogs.
- Evidence reviewed: `PROJECT_MEMORY.md`, `docs/superpowers/specs/2026-06-10-web-ux-ui-refresh-design.md`, existing React components and CSS modules.

## Brand
- Personality: calm, culturally grounded, clear, and trustworthy.
- Trust signals: readable dates, understandable event names, bilingual content, and a stable yearly overview.
- Avoid: replacing the calendar with a dashboard or shrinking labels until they are hard to read.

## Product goals
- Goals: make Kyrgyz calendar dates and events easy to browse on desktop, tablet, and phone.
- Non-goals: change calendar calculations, event ordering, or the yearly overview into a current-month-only view.
- Success signals: the page fits a 320 px viewport without horizontal scrolling; calendar dates and controls remain readable and usable.

## Personas and jobs
- Primary personas: older people in Kyrgyzstan, researchers and enthusiasts, and Kyrgyz-speaking visitors.
- User jobs: browse the year, inspect lunar months, find event details, and select a location or display language.
- Key contexts of use: desktop browsers and touch phones with narrow viewports.

## Information architecture
- Primary navigation: none; the page is a single calendar view.
- Core screens: yearly calendar, lunar-month calendar, event detail sheet, location selector, and calendar information dialogs.
- Content hierarchy: year and controls, location and legend, yearly calendar, lunar calendar, footer.

## Design principles
- Preserve the current page order and year-at-a-glance experience.
- Adapt layout before reducing text; preserve readable type and touch targets.
- Tradeoffs: phone users scroll through the twelve monthly calendars in one column to keep every month visible in the yearly overview.

## Visual language
- Color: retain the existing dark and light themes and their calendar event colors.
- Typography: retain the established serif headings and readable sans-serif calendar numerals and descriptions.
- Spacing/layout rhythm: use existing CSS modules and responsive spacing; let grids fit their container.
- Shape/radius/elevation: retain existing surfaces and modal treatments.
- Motion: retain existing transitions; respect reduced-motion preferences when adding motion.
- Imagery/iconography: retain current SVG event icons and tunduk watermark.

## Components
- Existing components to reuse: `CalendarScreen`, `MonthCalendarGrid`, `LunarMonthCalendarView`, `YearControl`, `LocationSelector`, `EventLegend`, dialogs, and `SiteFooter`.
- New/changed components: reuse `CalendarDialog` for all five popup types and `useViewportMenu` for both dropdowns; component CSS handles the page layout.
- Variants and states: current themes, bilingual labels, loading/error states, and open dialogs remain supported.
- Token/component ownership: component styles remain in their existing CSS modules; global theme tokens stay in `theme.css`.

## Accessibility
- Target standard: responsive behavior should preserve current semantic controls and keyboard focus visibility.
- Keyboard/focus behavior: native modal dialogs trap focus, support Escape, restore focus on close, and keep a 44 px close button visible. Interactive legend items support Enter/Space. Retain visible focus states.
- Contrast/readability: preserve theme contrast and avoid reducing text below readable sizes to fit a screen.
- Screen-reader semantics: do not change existing labels or content hierarchy as part of the layout work.
- Reduced motion and sensory considerations: avoid adding animation or flashing effects.

## Responsive behavior
- Supported breakpoints/devices: continuous layout from 320 px through 1920 px and wider; representative phone/tablet presets and laptop windows are listed in `docs/responsive-layout.md`. Widths are CSS viewport pixels, independent of device names and display pixel density.
- Layout adaptations: yearly months use one column on phones, two columns when space allows, and more columns on wide screens; lunar months remain seven-day grids with flexible tracks; headers and controls wrap; dialogs fit within the visual viewport, including safe areas and reduced heights; only their bodies scroll, without shrinking illustrations or content. Lunar labels retain 11 px type and wrap when necessary. Dropdowns choose available space above or below their control and scroll within that space.
- Touch/hover differences: preserve at least 44 px control targets where applicable; hover is supplementary and not required to use the calendar.

## Interaction states
- Loading: keep the current month-card skeletons in the responsive grid.
- Empty: keep current empty date and calendar behavior.
- Error: keep the current localized error state within the available width.
- Success: show both calendar views and event markers without changing their meaning.
- Disabled: retain disabled control styling and avoid clipped labels.
- Offline/slow network, if applicable: preserve existing offline badge and cached-query behavior.

## Content voice
- Tone: plain, respectful, and culturally specific.
- Terminology: preserve approved Kyrgyz and Russian names in the current components.
- Microcopy rules: layout changes must not truncate essential labels or event descriptions.

## Implementation constraints
- Framework/styling system: React, TypeScript, Vite, and CSS Modules.
- Design-token constraints: extend existing CSS variables and module conventions; do not add a new styling framework.
- Performance constraints: prefer CSS layout rules over JavaScript viewport detection.
- Compatibility constraints: support current evergreen mobile and desktop browsers; account for mobile safe areas in fixed dialogs.
- Test/screenshot expectations: build the frontend and run `Front/scripts/check-responsive.cjs` against the running API/frontend. Audit rendered text ranges, viewport bounds, nested content, scroll reachability, keyboard focus, dropdowns, both languages/themes, landscape and intermediate widths. Emulation results do not claim physical-device or Safari verification.

## Open questions
- [ ] None for the approved responsive scope.
