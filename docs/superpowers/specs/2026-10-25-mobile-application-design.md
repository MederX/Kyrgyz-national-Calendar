# Mobile calendar application

Status: UI approved 2026-10-25. User selected Android first on React + Capacitor. Data architecture superseded on 2026-11-08: the APK must calculate locally from the first offline launch; see `2026-11-08-offline-mobile-calendar-design.md`. Earlier API-dependent implementation notes below are historical.

## Intent and approved decisions

Build a functioning mobile calendar from the visual concept reviewed in this
conversation. The user approved the visual direction, requested a language
switch, and required mobile copy to stay as close as possible to the website.
The user then requested implementation.

Primary users remain older people in Kyrgyzstan, calendar researchers and
enthusiasts, and Kyrgyz-speaking visitors. Readable dates, full text, and simple
navigation take priority over density.

Approved visual reference: the latest `mobile-app-concept-v5.html` in
`.superpowers/brainstorm/14521-1792938987/content/`. That file is a disposable
prototype with demonstration data; it is not application code or a live data
source. Its phone outlines, device status bars, demo date, and presentation
captions do not belong in the application.

## Approaches and outstanding choice

1. **React + Capacitor, Android first (recommended by the implementer).** Build
   the mobile interface with the existing React/TypeScript code and CSS tokens,
   reuse website dialogs and API types, and package local assets in an Android
   application. This offers the most direct reuse of the approved copy. Native
   packaging, permissions, and device behavior still require Android checks.
2. **React + Capacitor, Android and iOS.** Share the same interface and data
   layer, but maintain and validate two native projects. iOS builds require the
   corresponding Apple toolchain and signing arrangements.
3. **React Native / Expo.** Build a separate mobile renderer and share suitable
   types, plain text resources, and calculation-independent utilities. Website
   HTML/CSS dialogs need a native presentation, increasing migration work.

**Selected: React + Capacitor, Android first.** The user confirmed this approach
and specification. The existing website remains a supported product.

References: [Capacitor installation](https://capacitorjs.com/docs/getting-started)
and [environment setup](https://capacitorjs.com/docs/getting-started/environment-setup).

## Scope of the first usable version

- Three main destinations: Today, Calendar, and calendar explanations.
- Current calculated data through the embedded engine, retaining the existing
  response contract and avoiding the prototype's February 2026 fixture.
- Current date, location, animal year, lunar month/day, current events, and the
  next relevant calendar event.
- Solar month browsing, year selection in the existing 1900–2050 range, lunar
  month browsing, and event details.
- The complete existing year overview remains reachable from calendar
  navigation; adopting a month screen does not discard that capability.
- Full existing explanations for Muchol, Arsar, and Togool.
- Kyrgyz/Russian language selection, light/dark themes, and location selection.
- Visible local-calculation loading/error/retry; no connectivity requirement.

Push notifications, widgets, accounts, personal appointments, store publication,
and changing astronomical rules are outside this first interface deliverable.
They have not been requested or designed. Full first-launch offline data
availability is now required by the autonomous architecture specification.

## Screens and interactions

### Shared application frame

Show the full website product title, allowing line wrapping. Include the current
location, a language switch, and a theme button. Use the existing theme colors,
event icons, serif titles, and tunduk motif. The bottom navigation stays visible
while screen content scrolls; safe areas are included in its spacing.

The website's language button indicates the target language: `РУС` in Kyrgyz
mode and `КЫР` in Russian mode. Switching language updates every visible label
and any open explanation without changing the selected date or month. Language,
theme, and location preferences survive reopening the application.

### Today

Default to the actual current date in the selected IANA timezone. Show a large
day number, full month/year, weekday, and animal-year label. Show the matching
lunar month and day using existing lunar-month payloads and formatting rules.
The moon symbol displays the current illuminated portion using SunCalc 2.1.1,
computed from the live `now` value (updated every 30 seconds and on resume).
Use a conventional upright phase diagram, mirrored in the southern hemisphere,
with a localized accessible phase label. Do not infer illumination from the
calendar day's ordinal number or display a fixed decorative disk.
Tapping the lunar-day card opens Calendar in lunar mode with today's date
selected, regardless of the previously browsed year or calendar mode.

List that date's events in the existing display priority. New moon and
`ai_bashi` have separate cards even when they coincide, so the number of cards
matches the event count. Include a Ramadan period when the day
falls within it. Each mobile event card opens the full details of that selected
event only, identified by date, type, and time. Other events on the same day
stay in their own cards. Ai bashy opens its own explanation and is not duplicated
inside the new-moon popup. This applies to both Today and Calendar; the website keeps its
existing daily event dialog.

The next-event area uses live data, handles a date with no events, and checks the
adjacent year when necessary. It must not imply there are no upcoming events
merely because the current calendar response ends on December 31.

### Calendar

Default to the current month, with previous/next navigation and year selection.
Allow selecting every real date, including days without special events. Show the
selected date and its events beneath the grid on phones, or beside it on wide
tablets. Preserve the selection when the
language or theme changes.

Allow switching between solar and lunar calendar views. Lunar month navigation
uses the API's month sequence, including `АРСАР АЙ`, and supports intervals
crossing Gregorian month/year boundaries. Do not infer a lunar month merely
from the Gregorian month name.

### Calendar explanations and details

Show the existing Muchol, Arsar, and Togool terms with their full website
explanations. Reuse existing event labels, descriptions, tips, and lunar
transition text. The detail surface scrolls independently, keeps closing
available, supports platform back/dismissal behavior, and restores the selected
screen and date when closed.

### Tablet layout

For viewports at least 768 px wide and 600 px tall, use the available width up
to 1360 px rather than the 620 px phone column. Keep the established colors,
fonts, content and three-section bottom navigation, with a horizontal header
and larger tablet text and touch surfaces.

- Today: date/lunar-day summary and upcoming event on the left, today's events
  on the right.
- Calendar: month and selected-day events side by side from 960 px; the yearly
  overview shows two months per row from 768 px and three from 1200 px. Month
  headings remain equal in both modes (24–32 px on tablets, 20 px on phones).
- Guide: terminology cards on the left, project information and inline sections
  on the right. Preserve each section's expansion behavior.
- Detail dialogs: center a reading surface 760–900 px wide with 18–22 px body
  text, retaining the visible close button and independent body scrolling.

Keep mini typography and controls up to a 900 px short viewport side. Between
900 and 1028 px, smoothly increase their size to suit a large tablet: event
descriptions 16–20 px, event titles 18–22 px, page headings 42–54 px, calendar
numbers 18–22 px and primary icon buttons 44–52 px. Scale cards and icons along
with their content. Use the short side so the larger scale survives rotation;
retain compact sizing in split-screen windows. Keep the existing font families.

Below these thresholds, retain the phone composition, including short
landscape viewports and narrow split-screen windows. Validate 1032 × 1376 and
1376 × 1032 CSS-pixel viewports, intermediate tablets and existing phone sizes
in both languages and themes. Browser emulation does not establish physical
iPad/Safari validation.

## Copy contract

The authoritative product title is:

- Kyrgyz: `Кыргыз Элинин Улуттук ай күн календары`
- Russian: `Кыргызский национальный календарь`

Sources are shared `calendarCopy.ts` and the current website's `CalendarScreen.tsx`, `EventLegend.tsx`,
`LunarMonthCalendarView.tsx`, `MucholInfoModal.tsx`, `ArsarInfoModal.tsx`,
`TogoolInfoModal.tsx`, `EventDetailSheet.tsx`, `SiteFooter.tsx`, and event metadata
in `Back/main.py`.

Preserve source wording rather than introducing a new product name, shortening
explanations, paraphrasing, or independently translating website text. New
mobile-only navigation, loading, and empty-state labels are separate interface
copy, and should be identified for review where no website equivalent exists.

For a React implementation, reuse the actual content components; do not copy
rendered HTML or generated snapshots from the prototype into production. If
shared text resources are necessary, move the original wording without editing
its meaning and have the website and mobile surfaces consume those resources.

## Data and state requirements

- Reuse the existing API request/response types and IANA timezone handling.
- Keep the Today date independent from the date being browsed in Calendar.
- Handle January dates belonging to the preceding lunar-year package, and the
  final new moon that starts the next package. Fetch adjacent-year context when
  necessary, within the supported range.
- Use date-only values for calendar selection; avoid device-timezone conversion
  shifting an API date to the preceding or following day.
- Keep language and theme independent from astronomical query keys.
- Make a failed request distinguishable from an empty day.
- A packaged app needs an explicit reachable API base URL; the Vite development
  proxy and a relative `/api` URL alone are insufficient inside the native app.
- Do not assume the website URL serves the API without verification. Runtime
  configuration must not contain secrets.

## Accessibility and layout acceptance

The actual application fills its viewport, with no decorative phone frame.
The same interface works continuously from 320 CSS px upward, including
landscape and short available heights. Main controls have at least 44 px touch
targets. Full titles and text wrap; reading does not depend on hover or color
alone. Respect text scaling, visible focus, and reduced-motion settings.

## Validation and completion evidence

- Unit checks for timezone/date boundaries, year limits, lunar-package lookup,
  independent event details/counts, next-event selection, and preference restoration.
- Rendered checks for both languages and themes, real API data, month/year
  navigation, empty days, location changes, and dialog scrolling.
- Existing frontend checks and production website build still pass.
- For a Capacitor deliverable: independently build mobile web assets and sync
  them into the selected native project, with no hard-coded live-preview URL.
- Distinguish browser verification, Android build verification, emulator/device
  testing, and store publication. An APK is only reported as built when an
  actual Gradle build produces the artifact.

## Environment and open items

The current checkout has Node.js 24 and installed frontend dependencies. Java,
`adb`, and `sdkmanager` were not found in the inspected environment. Native
build setup depends on the user's target selection and available build tools.

- Selected target: Android, using React + Capacitor.
- Confirm a reachable API deployment for packaged builds; local development
  uses the existing FastAPI server.
- Native application identifier is `org.example.kyrgyzcalendar` for development;
  select an owned release identifier before publication.
- Mobile-only labels need a final copy review against the user's site-first rule.
