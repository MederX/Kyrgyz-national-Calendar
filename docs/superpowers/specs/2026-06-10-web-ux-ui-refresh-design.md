# Web UX/UI Refresh Design

## Status
- Status: Draft for user review
- Last refreshed: 2026-06-10
- Scope: desktop/web version of the existing yearly calendar screen
- Out of scope for this phase: mobile layout, new "today", "nearest events", or "current month" blocks

## Product Purpose
This project is a web calendar for the Kyrgyz national lunar-solar calendar. Its purpose is to make culturally significant, astronomical, religious, and state calendar events understandable in a modern web interface.

The primary audience priority is:
1. Older people in Kyrgyzstan.
2. Researchers and enthusiasts of the traditional calendar.
3. Broad Kyrgyz-speaking users.

Design implication: readability, calm structure, obvious controls, and clear explanations are more important than decorative novelty.

## Evidence Reviewed
- `README.md` describes the FastAPI backend and React/Vite frontend, including moon phases, Togool, Ramadan, Eid al-Fitr, Muchol start, and state holidays.
- `project_explanation_for_business_analyst.md` describes the business task: a yearly calendar with cultural and religious events.
- `Front/src/features/calendar/components/CalendarScreen.tsx` contains the yearly screen, year selector, language/theme controls, location selector, legend, year grid, and event detail sheet.
- `Front/src/features/calendar/components/DayCell.tsx` renders dates and event markers.
- `Front/src/features/calendar/components/EventLegend.tsx` renders event categories and Togool/Muchol info modals.
- `Front/src/features/calendar/components/EventDetailSheet.tsx` renders date detail popups.
- `Front/src/features/calendar/components/LocationSelector.tsx` supports city selection and geolocation.

## Approved Direction
Keep the current information architecture: the year remains the main object of the page. Do not replace it with a dashboard, "today" block, or current-month-first experience in this phase.

The refresh should focus on:
- icon meaning and clarity,
- date cell structure,
- readable date numerals,
- cleaner dark/light backgrounds,
- improved year selection control,
- clearer handling of overlapping events,
- better popup presentation for combined events.

## Page Structure
The first web screen keeps the current "year immediately visible" direction:
- header/title,
- selected year and animal year,
- controls for year, theme, language,
- location selector,
- Ramadan summary if present,
- legend,
- yearly month grid.

Do not introduce a new overview module in this phase.

## Date Cell System
Approved cell structure:
- Date number is positioned top-left.
- Primary event icon is positioned bottom-right.
- Date numbers use a modern sans-serif style rather than serif.
- Target date numeral style: about `19px`, `font-weight: 700`.
- Target date cell height: about `58px` on web.

For multiple events on one day:
- Show only the highest-priority event icon.
- Show `+1`, `+2`, etc. for additional events.
- The popup lists or explains the full set of events.

Priority order:
1. Muchol.
2. Togool.
3. Moon phases.
4. Ramadan special dates.
5. State holidays.

## Icon System
Use custom SVG icons rather than emoji for the main event markers. Emoji may be avoided because rendering can vary and may produce square fallback glyphs.

Approved icon directions:
- Muchol: sprout / beginning symbol.
- Togool: custom star / Urkor-inspired symbol from the SVG direction.
- New moon: crescent symbol.
- Full moon: filled circle symbol.
- Ramadan period: no repeated icon in each date; use a period background marker.
- Orozo Ait: crescent plus small star, variant A from `orozo-star-and-ai-bashy-note-v1`.
- Kurman Ait: simple sheep icon, variant C from the second Kurman Ait alternatives.
- State holiday: stable SVG flag or clear state holiday marker, to be finalized in implementation preview.
- Multiple events: `+1`, `+2` pill next to the primary icon.

## Ramadan And Islamic Date Rules
Represent these as three separate UI concepts:

### Ai Bashy
Ai Bashy is a notable date, but if it coincides with a new moon date, it should not replace the new moon icon.

When Ai Bashy and new moon occur on the same day:
- The calendar cell shows the new moon icon.
- The cell also shows `+1`.
- The event detail popup shows the main new moon information.
- Ai Bashy is shown as a note after the new moon information, not as a competing primary card.

Approved popup behavior:
- Main event: `Ай жаңырган күн`.
- Then a visually distinct note: `Ай башы`.
- The note briefly explains that this day is marked as preparation for Ramadan and that Ramadan begins after it.

### Ramadan Period
Ramadan is shown as a calm period treatment across date cells, not as an icon on every date.

Approved direction:
- Use the calmer period style similar to option C: a subtle cell background with a lower accent line.
- Avoid heavy full-cell fill that makes the grid noisy.

### Orozo Ait
Orozo Ait is a separate final date with a unique icon.

Approved direction:
- Crescent plus a small star.
- Use the simple variant A: a crescent with one small star near the top-right.

## Typography
Approved direction:
- Keep the expressive serif for the main title if it continues to support the cultural tone.
- Use modern sans-serif numerals in calendar cells.
- Month labels should remain clear, uppercase or semi-uppercase is acceptable if tracking does not harm readability.
- Avoid small, low-contrast text for controls and legend items because older users are a primary audience.

Date numeral target:
- `font-family`: system sans-serif stack.
- `font-size`: about `19px`.
- `font-weight`: `700`.
- `line-height`: `1`.

## Theme And Background
Approved direction: clean modern background.

Dark theme:
- Keep the deep night feeling.
- Reduce noisy texture.
- Keep watermark extremely subtle.

Light theme:
- Remove the rough/matte paper feeling.
- Use a cleaner, calmer surface.
- Preserve enough warmth to avoid a sterile UI.
- Prioritize readable contrast over paper texture.

## Year Control
Replace the current plain select feeling with a clearer web control:

Approved direction:
- `‹ 2026 ▾ ›`
- Left arrow moves to previous year.
- Right arrow moves to next year.
- Clicking the year opens a dropdown list.
- Dropdown rows may include animal year labels.

The control must remain large enough and obvious enough for older users.

## Event Detail Popup
Keep the current bottom-sheet/modal concept, but align it with the refreshed icon and typography system.

Requirements:
- Event icon is stable SVG.
- Date title remains clear.
- Event title, time, description, and tips remain readable.
- Ai Bashy note appears under new moon content when relevant.
- Additional events indicated by `+1` or `+2` in the cell are discoverable in the popup.

## Legend
The legend remains part of the web screen for this phase.

Requirements:
- Use the same SVG icon system as cells and popups.
- Interactive terms such as Togool and Muchol remain clickable.
- The legend must explain the period marker for Ramadan separately from date-event icons.
- Avoid relying only on color; pair color with icon or label.

## Accessibility And Older-User Readability
The implementation should improve:
- larger click targets for year/theme/language/location controls,
- visible focus states,
- keyboard activation for clickable date cells and legend info items,
- sufficient contrast in both themes,
- reduced visual noise around date numbers,
- readable popup text size and line height.

## Visual Decisions Still To Verify In Implementation Preview
- Exact final SVG path for the state holiday marker.
- Exact final SVG path for Togool in small cell size.
- Whether the Muchol sprout remains readable at `15-17px` inside the date badge.
- Exact spacing between the primary event icon and `+1` counter in a cell.
- Exact light theme palette after removing rough texture.

## Implementation Acceptance Criteria
- Web page structure remains close to the current design.
- Date cells no longer look visually uneven when dates have icons.
- Multiple-event days show primary icon plus count.
- New moon plus Ai Bashy day shows new moon icon plus `+1`.
- Ai Bashy appears as a note in the new moon popup.
- Ramadan period uses subtle lower-line treatment.
- Orozo Ait uses crescent plus small star.
- Kurman Ait uses simple sheep SVG.
- Date numerals use modern sans-serif around `19px/700`.
- Year selector is replaced by `‹ year ▾ ›`.
- Dark and light backgrounds are cleaner and less noisy.
