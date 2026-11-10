# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-11-08
- Mobile autonomy (user requirement, 2026-11-08): the installed Android APK must work on its first launch without internet, a computer or any HTTP server. Bundle the calculation engine, ephemeris and timezone data; preserve 1900–2050 and location-aware calculations. The website remains API-based. Canonical architecture: `docs/superpowers/specs/2026-11-08-offline-mobile-calendar-design.md`.
- Primary product surfaces: website yearly calendar, lunar-month calendar, event and location dialogs; approved mobile visual concept with Today, Calendar, and calendar explanations.
- Evidence reviewed: `PROJECT_MEMORY.md`, `docs/superpowers/specs/2026-06-10-web-ux-ui-refresh-design.md`, `docs/superpowers/specs/2026-10-25-mobile-application-design.md`, existing React components and CSS modules, and the user-approved mobile visual concept.

## Brand
- Personality: calm, culturally grounded, clear, and trustworthy.
- Trust signals: readable dates, understandable event names, bilingual content, and a stable yearly overview.
- Avoid: replacing the calendar with a dashboard or shrinking labels until they are hard to read.
- Mobile logo (approved 2026-11-08): variant D, “Calendar and cycle”, from `docs/calendar-logo-options.html`. Use `Front/src/mobile/CalendarLogo.tsx` in the mobile header, Today watermark and Guide identity; the Android launcher and splash use the same calendar outline and half-lit disc, with gold/ivory on dark teal. The mobile browser entry uses `calendar-cycle-icon.svg`. The remaining gallery directions stay available for comparison; the website logo/favicon remain unchanged.

## Product goals
- Goals: make Kyrgyz calendar dates and events easy to browse on desktop, tablet, and phone.
- Non-goals: change calendar calculations, event ordering, or replace the website yearly overview with a current-month-only view. Mobile month browsing keeps the full year overview reachable.
- Success signals: the page fits a 320 px viewport without horizontal scrolling; calendar dates and controls remain readable and usable.

## Personas and jobs
- Primary personas: older people in Kyrgyzstan, researchers and enthusiasts, and Kyrgyz-speaking visitors.
- User jobs: browse the year, inspect lunar months, find event details, and select a location or display language.
- Key contexts of use: desktop browsers and touch phones with narrow viewports.

## Information architecture
- The single-page layout and page-order rules below apply to the website. The approved mobile visual concept uses Today, Calendar, and calendar explanations with bottom navigation. Platform choice and the first implementation scope are documented in `docs/superpowers/specs/2026-10-25-mobile-application-design.md`.
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
- Mobile typography (approved prototype variant 2): Cormorant headings, Lora copy, System UI controls. Mobile-only font aliases in `Front/src/mobile/mobileTypography.css` reproduce the prototype's Cyrillic subsets and Georgia fallback for Latin glyphs/numerals; keep the full glyph sets used by the website unchanged. Keep date numerals at 104 px, date month at 20 px, event titles at 16 px, descriptions at 14 px and detailed copy at 16 px / 1.75 even below 380 px. Compare actual rendered fonts and computed styles at equal screen widths when changing typography.
- Mobile guide section titles use Lora 700 at 18 px for visibility in daylight. Mobile sheets use `--bg-primary`; terminology sheets show the existing event icon above the title, with the close control on the right. The emblem is enabled only for the mobile sheet presentation.
- Mobile Calendar uses matching 20 px month headings in single-month and yearly views, including clickable month labels. Show the selected animal year below the year control in every calendar mode. The mobile location label includes the selected city's current GMT offset, calculated from its IANA timezone with daylight-saving support.
- Spacing/layout rhythm: use existing CSS modules and responsive spacing; let grids fit their container.
- Shape/radius/elevation: retain existing surfaces and modal treatments.
- Motion: retain existing transitions; respect reduced-motion preferences when adding motion.
- Imagery/iconography: retain current SVG event icons and the website's tunduk watermark. The mobile watermark uses the approved calendar/cycle logo.

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
- Mobile tablet layout: at least 768 px wide and 600 px tall, expand the app up to 1360 px, use a horizontal header and centered bottom navigation, and split Today and Guide into two areas. Calendar uses adjacent month/events panels from 960 px; the yearly view uses two month columns from 768 px and three from 1200 px. Preserve mini sizing up to a 900 px short viewport side; smoothly enlarge typography, cards, icons and controls through a 1028 px short side, keeping the scale consistent across rotation. Month headings grow from 24 to 32 px in both month modes, event descriptions from 16 to 20 px, and page titles from 42 to 54 px. Tablet sheets become centered reading dialogs growing from 760 to 900 px wide with 18–22 px body copy. Short phone landscape viewports retain the compact layout.
- Touch/hover differences: preserve at least 44 px control targets where applicable; hover is supplementary and not required to use the calendar.

## Interaction states
- Loading: keep the current month-card skeletons in the responsive grid.
- Empty: keep current empty date and calendar behavior.
- Error: keep the current localized error state within the available width.
- Success: show both calendar views and event markers without changing their meaning.
- Disabled: retain disabled control styling and avoid clipped labels.
- Offline behavior: mobile calculations must execute even when the OS reports no connectivity; do not show a connectivity warning for a functioning local calendar. Fresh/unvisited dates work without a warm cache. The website retains its existing network behavior.

## Content voice
- Tone: plain, respectful, and culturally specific.
- Terminology: preserve approved Kyrgyz and Russian names in the current components.
- Microcopy rules: layout changes must not truncate essential labels or event descriptions.
- Mobile application copy (user direction, 2026-10-25): keep the approved mobile visual direction, and use the website as the source for product names, terminology, event labels, descriptions, and explanations in both languages. This applies to prototypes and the eventual application.
- Product title: use `Кыргыз Элинин Улуттук ай күн календары` / `Кыргызский национальный календарь` from `Front/src/features/calendar/utils/calendarCopy.ts`, shared with `CalendarScreen.tsx`. Do not introduce `Тамыр календары` as an alternative product name. Wrap the full title when space is limited.
- Reuse explanatory content from `MucholInfoModal.tsx`, `ArsarInfoModal.tsx`, `TogoolInfoModal.tsx`, and `EventDetailSheet.tsx`, and event copy from `Back/main.py`. Do not replace these texts with newly written summaries or translations without user agreement. Mobile-specific navigation labels remain proposals where no website equivalent exists.

## Implementation constraints
- The user selected React + Capacitor 8 for Android. Mobile source is `Front/src/mobile/`, the native project is `Front/android/`, and mobile assets are built independently into `Front/dist-mobile/`. The website framework and browser checks below continue to apply to the existing website and shared components.
- Framework/styling system: React, TypeScript, Vite, and CSS Modules.
- Design-token constraints: extend existing CSS variables and module conventions; do not add a new styling framework.
- Performance constraints: prefer CSS layout rules over JavaScript viewport detection.
- Compatibility constraints: support current evergreen mobile and desktop browsers; account for mobile safe areas in fixed dialogs.
- Test/screenshot expectations: build the frontend and run `Front/scripts/check-responsive.cjs` against the running API/frontend. Audit rendered text ranges, viewport bounds, nested content, scroll reachability, keyboard focus, dropdowns, both languages/themes, landscape and intermediate widths. Emulation results do not claim physical-device or Safari verification.

## Open questions
- [ ] None for the approved responsive scope.
