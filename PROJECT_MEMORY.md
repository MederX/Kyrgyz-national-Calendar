# Project Memory: Kyrgyz National Calendar

Last updated: 2026-06-17, Asia/Bishkek.

This file is a compact handoff for the next Codex/session. Start here before
reading the whole repository or long chat history.

## 1. Project Purpose

The project is a Kyrgyz traditional lunar-solar calendar for 1900-2050.

Primary audiences, in priority order:
1. Older generation in Kyrgyzstan.
2. Researchers and enthusiasts of the traditional Kyrgyz calendar.
3. Wider Kyrgyz-speaking audience.

The interface should first help a visitor understand where they are and what the
calendar is showing. UX/UI priority is desktop web first; mobile is a later
stage. Readability for older users is a hard requirement.

## 2. Tech Stack And Run Commands

Backend:
- Directory: `Back/`
- Framework: FastAPI
- Astronomy libraries: `skyfield`, `ephem`
- Main files: `Back/main.py`, `Back/calculator.py`, `Back/models.py`

Run backend locally:

```bash
cd Back
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

Frontend:
- Directory: `Front/`
- Framework: React + Vite + TypeScript
- Main calendar UI: `Front/src/features/calendar/components/CalendarScreen.tsx`

Run frontend locally:

```bash
cd Front
npm run dev
```

Local Vite proxy sends `/api` to `http://localhost:8000`.

## 3. Product Model

There are two visually separated calendars:
- `Күн календары` / `Солнечный календарь`: the main yearly calendar shown first.
- `Ай календары` / `Лунный календарь`: lunar-month view shown below.

Kyrgyz subtitle rules:
- Solar: `Кадимки жылдык календарь: Бирдин айы - Үчтүн айы`
- Lunar: `Ай жаңыргандан ай жаңырганга чейинки күндөр`

Russian subtitle rules:
- Solar: `Обычный годовой календарь: январь - декабрь`
- Lunar: date range in `DD-MM-YYYY - DD-MM-YYYY` format.

The lunar calendar should default to the current lunar period until the user
chooses another lunar month from the selector.

## 4. Lunar Year Backend Logic

The backend returns `lunar_months` in the calendar API response.

Important behavior:
- A requested year must return a full lunar-year package, not a Gregorian
  January-December slice.
- The package starts with `Бирдин айы`.
- The regular month order is always:
  `Бирдин айы`, `Жалган куран`, `Чын куран`, `Бугу`, `Кулжа`, `Теке`,
  `Баш оона`, `Аяк оона`, `Тогуздун айы`, `Жетинин айы`, `Бештин айы`,
  `Үчтүн айы`.
- `АРСАР АЙ` can appear as an additional 13th/buffer month and must not advance
  the regular month name index.
- `Арсар ай` is detected when the lunar month overlaps its expected seasonal
  Gregorian month by less than 10 days, with a 300-day cooldown.

Recent critical fix:
- Problem: `calculate_lunar_year_months()` returned empty arrays for 1900-1914.
- Root cause: the month timeline used a hard-coded `epoch_start` after the
  1900-01-01 new moon, so the first valid `Бирдин айы` anchor was skipped.
- Fix: `Back/calculator.py` now finds the initial `Бирдин айы` anchor from the
  new-moon list by maximum overlap with January 1900.
- Verified result: all years 1900-2050 return non-empty lunar years.
  Distribution after the fix: 96 years with 12 months, 55 years with 13 months.

Relevant tests:
- `Back/test_lunar_year_structure.py`
- `Back/test_ramadan_alignment.py`

Useful verification commands:

```bash
cd Back
.venv/bin/python -m unittest test_lunar_year_structure.py
.venv/bin/python -m unittest test_ramadan_alignment.py
.venv/bin/python -m py_compile calculator.py main.py models.py
```

## 5. Ramadan And Islamic Date Logic

User-approved model:
- `Ай башы` can coincide with `Ай жаңырган күн`.
- If `Ай башы` drifts away from `Ай жаңырган күн` by 1 or more days, shift the
  Ramadan month by that difference so `Ай башы = Ай жаңырган күн`.
- Apply the same adjusted logic to `Курман айт`, because it is tied to the
  Ramadan/Islamic calendar sequence.
- Geolocation/timezone matters and should be respected through `tz_name`.

UI model:
- `Ай башы` is not always a separate primary icon if it coincides with
  `Ай жаңырган күн`; show the new-moon icon and a `+1`/`+2` indicator for
  multiple events.
- Ramadan month is a period treatment across day cells, not an icon repeated on
  every day.
- Legend label is `Рамазан айы` / `Месяц Рамазан`.
- `Орозо айт` icon choice: crescent with a small star.
- `Курман айт` icon choice: user selected variant C from prior visual options.

## 6. Event Icons And Date Cells

User preference:
- Current general design is liked; do not redesign the whole site unless asked.
- Focus should stay on icon clarity, readable typography, cell sizing, and
  polished controls.

Date cell rules already discussed/applied:
- Significant date cells place the main event icon in the bottom-right corner by
  default.
- If several events intersect, the main icon shifts left and `+1`/`+2` appears
  to its right.
- Cells were widened to prevent `+1`/`+2` from overflowing and covering icons.
- The icon/count layout must remain stable and readable.

Priority when multiple events collide:
1. `Мүчөл`
2. `Тогол`
3. Moon phases
4. Ramadan special dates
5. State holidays

Icons that were rejected or changed:
- `Мүчөл` icon that looked like coronavirus was rejected.
- Earlier `Ай жаңырган күн` and `Ай толгон күн` icons were considered unclear.
- Ramadan/Ai Bashy/Orozo Ait icons needed stronger separation.
- Ram icon was preferred for `Курман айт` over abstract symbols.

## 7. Typography, Background, Theme

Requirements:
- Readability for older users is a core UX requirement.
- Information panels and popups should use the larger, clearer typography option
  B chosen by the user.
- Apply the same readable sizing to `Мүчөл башы` and `Тогол` popups.

Theme/background decisions:
- The day theme background was changed after several options; the user rejected
  option D and selected option B.
- Day-theme popup icons were too dark and were adjusted to be friendlier/closer
  to night-theme icon colors.
- `Ай толгон күн` icon in day-theme popup needed a more visible outer disc.
- The fixed circular ornament should be based on the tunduk from the Kyrgyzstan
  flag, not a generic ornament.

Information panel issue already addressed:
- In `Астрономия | Ислам дини | Мамлекет & Салт`, category icons were too small
  and headings were smaller than item descriptions; they were normalized.

## 8. Legend And Term Popups

Legend block `Астрономия` includes:
- Moon phases.
- `Тогол` with detailed info.
- `Мүчөл башы` with detailed info.
- `Арсар ай` with detailed info.
- Lunar-day marker: Russian day labels use `1-ЛД`, `2-ЛД`, etc.; legend text is
  simply `лунный день`, not `ЛД — лунный день`.

`Арсар ай` detailed info:
- Kyrgyz text says it comes once every `2 - 3 жылда`.
- Russian text says approximately once every `2-3 года`.
- User-approved Kyrgyz wording for summary:
  `Арсар ай мезгил менен ай аталыштарын кайра теңдөө үчүн колдонулган кошумча ай`

Terminology:
- In display names, use simply `АРСАР АЙ`, not
  `АРСАР АЙ (Кош Тогуздун айы)`.

## 9. Animal Year Header

The old header included animal emoji by year. User wants it back as text plus
emoji, not SVG icons.

Format:
- Kyrgyz: `2026 · Жылкы жылы 🐎`
- Russian: `2026 · Год лошади 🐎`

Corrections:
- Kyrgyz calendar animal should be `Жолборс`, not `Барс`.
- Use `Балык`, not `Улуу`.
- Keep emojis with the names.

## 10. Month Names Dictionary

Russian to Kyrgyz month-name mapping used in discussion:

| Russian | Kyrgyz |
| --- | --- |
| январь | Бирдин айы |
| февраль | Жалган куран |
| март | Чын куран |
| апрель | Бугу |
| май | Кулжа |
| июнь | Теке |
| июль | Баш оона |
| август | Аяк оона |
| сентябрь | Тогуздун айы |
| октябрь | Жетинин айы |
| ноябрь | Бештин айы |
| декабрь | Үчтүн айы |

## 11. Preview And Design Artifacts

Useful generated/static artifacts:
- `docs/lunar-month-calendar-2026-preview.html`
- `docs/animal-year-visual-options.html`
- `docs/info-panel-typography-options.html`
- `docs/light-background-options.html`
- `docs/ramadan-legend-icon-options.html`
- `docs/tunduk-watermark-options.html`
- `docs/superpowers/plans/2026-06-10-web-ux-ui-refresh.md`
- `docs/superpowers/specs/2026-06-10-web-ux-ui-refresh-design.md`

The preview file is useful for visual testing and communication, but production
behavior lives in `Back/` and `Front/src/features/calendar/`.

## 12. Current Git/Workspace Note

At the time this memory file was created, `git status --short` showed only:
- `M problems.txt`
- `M samples/clean_backend_calendar.py`

Those were not modified while creating this memory. Treat them as user/context
changes unless the user asks to edit them.

## 13. Good Next-Session Start Procedure

1. Read this file first.
2. Check current status:

```bash
git status --short
```

3. If touching backend calendar logic, run:

```bash
cd Back
.venv/bin/python -m unittest test_lunar_year_structure.py
.venv/bin/python -m unittest test_ramadan_alignment.py
```

4. If touching frontend calendar UI, run:

```bash
cd Front
node --test src/features/calendar/utils/lunarYearStructure.test.mjs
node --test src/features/calendar/utils/lunarMonthGrid.test.mjs
npm run build
```

5. For UX/UI work, do not jump straight to code for ambiguous visuals. The user
prefers: propose variants, visualize, choose, then implement.

