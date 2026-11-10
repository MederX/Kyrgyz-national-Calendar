# Android Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved bilingual calendar interface on React + Capacitor Android using live API data and the existing website copy.

**Architecture:** Add a separate mobile entry and build to `Front/`; share the website's types, icons, state, themes, and explanatory components. Mobile-specific date/state helpers and screen components live under `Front/src/mobile/`. The website remains the normal Vite build.

**Tech Stack:** React 18, TypeScript, CSS Modules, TanStack Query, existing Zustand state, Capacitor 8 and official Android/App/Geolocation plugins.

**Spec:** `docs/superpowers/specs/2026-10-25-mobile-application-design.md`

## Global Constraints

- Android first, React + Capacitor; no iOS project or store publication.
- Supported calendar selection: 1900–2050; real current date uses the selected IANA timezone.
- Full product names and explanations match the website; new mobile navigation labels are kept separately.
- Today and the date being browsed are independent; adjacent lunar packages and year boundaries are handled.
- Separate mobile bundle, no PWA service worker in the native bundle, no live-preview server URL in Capacitor configuration.
- Controls at least 44 px, safe areas, independent sheet scrolling, both themes/languages, native back handling.
- Preserve the user's existing DESIGN.md edits. Work in the present feature checkout; no automatic commits, pushes, merges, or publication.

## Review Focus

- January belonging to the preceding lunar package, and December upcoming events in the following year: explicit model/query tests in Task 1.
- Damaged/unavailable persisted storage: preference validation tests in Task 1.
- Browsing a different year while Today still shows the current date: browser verification in Task 2.
- Switching language/theme with an open sheet and selecting an empty day: browser verification in Task 2.
- Packaged API URL configuration, disabled web service worker, and Android back/resume: native/build checks in Task 3.

### Task 1: Shared copy, mobile dates, queries and preferences

**Files:** Create `Front/src/features/calendar/utils/calendarCopy.ts`, `Front/src/mobile/calendarModel.ts`, `Front/src/mobile/calendarModel.test.mjs`, `Front/src/mobile/preferences.ts`, `Front/src/mobile/preferences.test.mjs`, `Front/src/mobile/useMobileCalendar.ts`; update website title/month/animal consumers only to share unchanged copy.

**Interfaces:** Date helpers use ISO date-only strings. `getDateInTimeZone(now, timeZone)`, `shiftCalendarMonth(isoDate, delta)`, `getDayEvents(responses, isoDate)`, `getLunarMonthForDate(responses, isoDate)`, `getUpcomingEvent(responses, afterDate)` and `getRequiredContext(data, isoDate, includeUpcoming)` consume existing API types. Preferences validate `{language, theme, location}`; storage failure falls back to existing defaults. Queries use the existing fetcher and cache keys.

- [x] Write and run failing model tests for timezone differences, leap day/year bounds, period folding/counts, lunar context and year-end events; run failing preference tests for corrupt/missing/blocked storage.
- [x] Implement the helpers, preference normalization and conditional adjacent-year queries; move the existing website copy unchanged into a shared module.
- [x] Run `node --test src/mobile/*.test.mjs src/features/calendar/utils/*.test.mjs src/features/calendar/components/*.test.mjs` from Front. Expected: all pass.

### Task 2: Production mobile screens and shared sheets

**Files:** Create `Front/src/mobile/{main.tsx,MobileApp.tsx,MobileApp.module.css,mobileCopy.ts,MobileIcon.tsx,MobileMonthGrid.tsx,TodayView.tsx,CalendarView.tsx,GuideView.tsx}` and `Front/mobile.html`; update `CalendarDialog.tsx`/CSS with an optional mobile presentation context, and LocationSelector with an optional coordinate provider. Reuse the website footer component unchanged for the mobile guide.

**Interfaces:** Screens consume Task 1 API models; the app owns tab, date, view-mode and one modal state. Existing Muchol/Arsar/Togool/EventDetail/Location components provide the actual copy. Native hooks are supplied in Task 3. Use the shared YearControl and new date grid for selectable empty days.

- [x] Build the frame, timezone-aware Today, month/lunar/year browsing and explanation screen; preserve all website wording and use shared icons/tokens.
- [x] Add current-day refresh on midnight/focus, persistent language/theme/location, independent Today versus browsing state, loading/error/retry/offline states and full dialog dismissal.
- [x] Browser checks: actual API, fixed 17.02.2026 regression, an empty day, different browsing year, both languages/themes, open sheets, location changes, all 12 months, 320/393/768 px and short landscape.
- [x] Existing unit checks and `npm run build` remain green. Capture actual mobile screenshots for comparison with the approved concept.

### Task 3: Android packaging and end-to-end verification

**Files:** Update Front package scripts and mode-aware Vite configuration; create `Front/capacitor.config.ts`, `Front/android/` using the official CLI, native lifecycle/geolocation adapter, mobile API build guard, browser audit script, and `docs/mobile-development.md`; update ignore rules for generated artifacts and local Android settings.

**Interfaces:** `npm run dev:mobile` previews the mobile entry; `npm run build:mobile` produces `dist-mobile/index.html`; Capacitor copies that bundle to Android. The native adapter supplies back/resume events and coordinates. `VITE_API_BASE_URL` must be an absolute reachable API URL for packaged builds.

- [x] Install matched Capacitor 8 packages, generate the native Android project, configure full display name and app-local bundle loading.
- [x] Verify the existing deployment's actual API path. If it is unavailable, request the correct API URL while completing the interface and local verification; never silently ship a known broken endpoint.
- [x] Add official App/Geolocation plugin integration, Android back/resume, and required location permissions. Keep development-only cleartext settings out of release defaults.
- [x] Run the browser audit, web build, mobile build and Capacitor sync. If toolchain installation is available, perform Gradle `assembleDebug` and report the actual APK path.
- [x] Perform one fresh whole-change review, fix important findings with regression checks, and document remaining device/build limitations accurately.

## Execution record

Durable task status, test evidence and implementation rulings are recorded in `.superpowers/sdd/2026-10-25-mobile-application/progress.md`. No further approval gate is required for the already approved implementation.
