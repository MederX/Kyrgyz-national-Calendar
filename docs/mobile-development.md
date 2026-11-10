# Autonomous Android application

Current delivery scope: a demo APK for business stakeholders. For another build
after small corrections, start with [the demo rebuild runbook](apk-demo-rebuild.md).
It records the existing toolchain, commands, proportional checks and lessons
from the first offline build; initial setup does not need repeating.

The installed APK calculates the calendar on the device. The first launch,
new dates and changed locations do not require internet, a remote/local HTTP
server, USB forwarding or previously cached responses.

The React + Capacitor interface calls the bundled Python engine through
`CalendarEnginePlugin`. Android packages Skyfield, NumPy, PyEphem, timezone
data and DE421 at build time. `Back/calendar_service.py` contains the shared
event assembly; FastAPI remains the website adapter with the same JSON contract.
The mobile runtime does not start FastAPI or any other HTTP server.

## Supported behavior

- Existing 1900–2050 range, solar/lunar calendars, all event explanations,
  Muchol/Arsar rules, animal years and current Moon appearance.
- Kyrgyz/Russian, both themes, persistent preferences and tablet layouts.
- Local city list and native GPS. GPS uses coordinates and the device timezone;
  the mobile app does not fetch reverse geocoding from an online service.
- Python calculations run on a background worker. First calculation initializes
  the astronomy tables; the interface remains responsive while loading. Immutable
  UTC year-start instants are prepared during the build to avoid repeating the
  entire 1900–2052 initialization on the phone. GPS-dependent events still
  calculate locally for the selected coordinates.

The APK currently includes **arm64-v8a and x86_64**, and requires Android 7.0+
(API 24). The Python 3.12 runtime does not support 32-bit-only phones. Store
publication and production signing are separate from an installable debug APK.

## Build prerequisites

Use Node.js 24+, JDK 21, Android SDK platform/build tools 36 and Python 3.12.
`CALENDAR_BUILD_PYTHON` can specify the build interpreter if `python3.12` is not
on PATH. Configure `JAVA_HOME` and `ANDROID_HOME` for your machine.

Install the backend calculation dependencies in `Back/.venv` (or set
`CALENDAR_CALCULATOR_PYTHON` to an interpreter with those dependencies); this
interpreter prepares the immutable UTC year-start data during compilation. The
task regenerates that data on each build, including after dependency upgrades.

`Back/de421.bsp` must exist when building: Gradle copies it and the selected
shared Python modules into generated Android sources. The ephemeris is bundled
in the APK, so it is not downloaded on the phone. Generated files, SDK paths,
outputs and signing keys remain ignored by Git. Dependencies may be downloaded
on the **build machine**; the installed application does not need that access.

The temporary toolchain for this workspace is described in
`/tmp/calendar-android-tools/environment.json`; temporary paths can disappear
and are not project configuration.

## Build and install

Install dependencies once when setting up the checkout (or restore them when
the lockfile changes). From `Front/`:

```bash
npm ci
```

For subsequent builds, reuse those dependencies and the Gradle/SDK caches:

```bash
npm run android:sync
cd android
./gradlew --offline --no-daemon :app:assembleDebug
```

If a newly added dependency is absent from the cache, fetch it with a networked
build. Environment settings and verification commands are in the runbook above.

Output:

```text
Front/android/app/build/outputs/apk/debug/app-debug.apk
```

Transfer the APK to an Android phone and install it normally. Alternatively:

```bash
adb install -r Front/android/app/build/outputs/apk/debug/app-debug.apk
```

No API URL and no `adb reverse` are needed. `mobile-build.json` declares the
embedded data source and supported range. Debug/release preflights refuse
server-dependent assets, live-reload URLs and mixed network content. The merged
application manifest removes the INTERNET permission.

The development application identifier remains `org.example.kyrgyzcalendar`.
The debug build is signed for testing. Establish an owned identifier and a
production signing configuration before store distribution.

## Browser preview and website

For browser-only UI development, start the local Python adapter and Vite:

```bash
cd Back
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

```bash
cd Front
npm run dev:mobile
```

Open **http://127.0.0.1:5178/**. The browser development adapter uses the local
API because a desktop browser does not host Android's Python runtime. Vite
eliminates that development branch and its HTTP client from packaged builds.
The regular website keeps its existing build, API and interface.

## Mobile logo

The user selected prototype D, “Calendar and cycle”, on 2026-11-08. The inline
mark is `Front/src/mobile/CalendarLogo.tsx`; the mobile favicon source is
`Front/src/mobile/assets/calendar-cycle-icon.svg`. Android launcher/splash assets
use the corresponding calendar outline, half-lit disc, gold/ivory and dark teal.
The website keeps its existing branding.

## Verification

```bash
cd Front
npm test
npm run build:mobile
```

```bash
cd Back
.venv/bin/python -m unittest test_calendar_service test_lunar_year_structure test_ramadan_alignment
```

`test_calendar_service` exercises a cold calculation in an empty working
directory with socket access blocked, web-adapter equivalence and missing mobile
data. Reference comparisons include 1900/2016/2026/2050 and New York.

Build the Android cold-runtime test with:

```bash
cd Front/android
./gradlew :app:assembleDebug :app:assembleDebugAndroidTest
```

Install both APKs on a fresh emulator/device, disable networking, then run
`org.example.kyrgyzcalendar.test/androidx.test.runner.AndroidJUnitRunner`.
`OfflineCalendarTest` verifies no INTERNET permission and calculations for
unvisited years. Native runtime/device results must be reported separately from
host Python tests and browser layout checks.

The browser audit `Front/scripts/check-mobile.cjs` remains a development UI
check using the local adapter. Its error/retry scenarios exercise that adapter;
it is not proof of Android offline operation.

Design: [autonomous architecture](superpowers/specs/2026-11-08-offline-mobile-calendar-design.md),
[existing mobile UI](superpowers/specs/2026-10-25-mobile-application-design.md).
