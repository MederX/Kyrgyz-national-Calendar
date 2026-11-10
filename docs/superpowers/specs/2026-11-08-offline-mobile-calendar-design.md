# Autonomous Android calendar

User requirement, 2026-11-08: install the APK and use the calendar immediately,
including the first launch without internet, a computer, USB forwarding or a
remote server. This replaces the earlier mobile API-dependent architecture.

Preserve the existing 1900–2050 range, solar/lunar views, events and periods,
Arsar/Muchol rules, location selection, both languages/themes, readable tablet
layouts and approved logo D. The website keeps its current UI and HTTP contract.

## Approach

Embed the existing Python calculation engine and DE421 ephemeris in Android,
using a Capacitor native bridge and Chaquopy. Calculate locally on a background
executor; no local or remote HTTP server is started. Bundle timezone data and
all Python dependencies at build time. Keep event assembly in one shared pure
Python module so the website and Android cannot silently acquire different
calendar rules. Resolve ephemeris files explicitly from the bundled directory;
missing data must fail clearly rather than trigger a download.

Alternatives considered: bundled city/year snapshots would constrain arbitrary
GPS coordinates; rewriting the astronomical engine in JavaScript would require
a separate accuracy audit. Neither is needed to preserve existing calculations.
The native Python dependency increases APK size and requires a supported ABI.
Initially package arm64-v8a and x86_64 with Python 3.12; verify the Android-wheel
versions against current reference calculations before accepting their output.

The mobile UI must not fetch reverse geocoding or show a connectivity warning
for an otherwise functional offline calendar. Manual cities remain available;
GPS falls back to coordinates and the device timezone. External informational
links may open a browser but cannot be required for calendar operation.

## Acceptance

- Fresh installed state calculates current and unvisited dates with networking
  disabled; no warm cache or earlier server response is required.
- Verify 1900/2050, 2016 Arsar transitions, 2026 coincident events, distant
  timezones and changed coordinates against existing reference calculations.
- Preserve the website JSON response contract and existing regression tests.
- APK contains the engine, DE421 and timezone data; build metadata identifies
  embedded calculation and has no API URL or live-reload server.
- Verify APK signing, launcher resources and native runtime behavior; report
  separately anything not exercised on an Android device/emulator.

Dependency references: [Chaquopy Android integration](https://chaquo.com/chaquopy/doc/current/android.html),
[bundled ephem wheels](https://chaquo.com/pypi-13.1/ephem/),
[bundled NumPy wheels](https://chaquo.com/pypi-13.1/numpy/).
