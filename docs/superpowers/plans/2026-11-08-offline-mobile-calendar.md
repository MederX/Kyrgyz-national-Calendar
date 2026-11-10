# Autonomous Android Calendar Implementation Plan

> Execute in the current workspace with `superpowers:executing-plans`; preserve
> existing uncommitted work and do not create commits without a user request.

**Goal:** deliver an APK which calculates the calendar on a fresh offline install.

**Architecture:** share the existing Python calculation/event assembly between
FastAPI and an embedded Android runtime. A Capacitor plugin calls the local
engine on a serialized worker; the React UI consumes the existing response shape.

**Tech stack:** React/Capacitor, Java, Chaquopy, Python/Skyfield/PyEphem/NumPy.

**Spec:** `docs/superpowers/specs/2026-11-08-offline-mobile-calendar-design.md`.

## Constraints and review focus

Preserve the website contract, existing calendar rules, 1900–2050, arbitrary
coordinates, IANA timezone conversion, languages/themes and logo D. Exercise
cold state, missing bundled data, year boundaries, native failures and cancelled
requests. Do not silently fall back to HTTP or reduce the supported calendar.

### 1. Shared local engine

- [x] Capture reference JSON before refactoring.
- [x] Extract event assembly to `Back/calendar_service.py`, leaving FastAPI as
      the adapter. Make `Back/calculator.py` load local data explicitly.
- [x] Add engine tests blocking network access and comparing reference JSON;
      run existing lunar-year and Ramadan regressions.

### 2. Embedded Android calculation

- [x] Package selected shared Python files, DE421 and dependencies via Gradle.
- [x] Add `calendar_mobile.py` and `CalendarEnginePlugin.java`; validate input,
      run off the UI thread and return a JSON string through Capacitor.
- [x] Register the plugin and add a cold-runtime Android smoke test.
- [x] Build and check Android-wheel compatibility; preserve reference output.

### 3. Offline mobile UI and build policy

- [x] Route `useMobileCalendar` through the native engine. Keep any HTTP adapter
      restricted to browser development, excluded from the packaged APK.
- [x] Disable mobile reverse geocoding and connectivity warnings.
- [x] Remove API URL/HTTP requirements from mobile build/config/preflights;
      mark packaged data source as embedded and forbid preview server URLs.
- [x] Verify transport errors, cancellation and cold offline UI behavior.

### 4. Package and deliver

- [x] Run frontend/engine tests, build/sync Android and assemble the offline APK.
- [x] Exercise native runtime on a device/emulator where available; distinguish
      native validation from browser/host tests.
- [x] Verify bundled data/dependencies, signature, alignment and download copy.
- [x] Update canonical docs and provide the new APK with actual validation limits.

## Validation record — 2026-11-08

- Frontend: 13 test files pass. Shared service: 5 tests pass; 10 lunar/Ramadan
  regressions pass with Android dependency versions. Five complete pre-refactor
  response fixtures match exactly, including 1900/2016/2026/2050 and New York.
- Android 35 x86_64: 2 instrumentation tests pass in airplane mode without
  INTERNET permission, including cold calculations for 1900/2026/2050.
- Compiled UI: fresh storage, offline state, unvisited years, lunar navigation,
  explanations and preferences pass against the native bridge contract shim.
  This browser check is separate from the actual Android engine test.
- Final APK: app-only Gradle build succeeds; signature and 16 KB alignment pass.
  Both ABIs, Python modules, DE421, timezone dependencies and the 153-entry UTC
  startup table are bundled; no HTTP calendar adapter/API URL is packaged.
- Full native UI check remains limited by the software emulator's WebView
  renderer crash before JavaScript execution. The old API-dependent APK has the
  same failure on Android 35; Android 34 also fails before application JavaScript
  runs. Do not report this as a successful full Android UI test.
