# Web UX/UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the desktop/web calendar UI according to `docs/superpowers/specs/2026-06-10-web-ux-ui-refresh-design.md` while preserving the current yearly-calendar information architecture.

**Architecture:** Add a small icon/priority layer used by date cells, legend, and event popups. Update `DayCell` to render one primary event plus a count, update the event sheet to fold `ai_bashi` into the new-moon card, then refresh controls, typography, and theme CSS. Keep changes local to `Front/src/features/calendar/components/` and `Front/src/core/theme/theme.css`.

**Tech Stack:** React 18, TypeScript, CSS modules, Vite, TanStack Query, Zustand.

---

## File Structure

- Create `Front/src/features/calendar/components/EventIcon.tsx`
  - Owns all stable SVG event icons.
  - Exports `EventIcon` and `getEventColorVar`.
- Create `Front/src/features/calendar/utils/eventDisplay.ts`
  - Owns event priority, primary-event selection, additional count, and `ai_bashi` folding rules.
- Create `Front/src/features/calendar/components/YearControl.tsx`
  - Replaces the native year select with `‹ year ▾ ›`.
- Create `Front/src/features/calendar/components/YearControl.module.css`
  - Styles the year control and dropdown.
- Modify `Front/src/features/calendar/components/DayCell.tsx`
  - Uses `selectPrimaryCalendarEvent`.
  - Renders primary icon and additional count.
  - Adds keyboard activation.
- Modify `Front/src/features/calendar/components/DayCell.module.css`
  - New top-left numeral, bottom-right icon, `+1` pill, Ramadan lower-line treatment.
- Modify `Front/src/features/calendar/components/EventDetailSheet.tsx`
  - Uses `EventIcon`.
  - Renders `ai_bashi` as a note under `new_moon` when both occur on the same date.
- Modify `Front/src/features/calendar/components/EventDetailSheet.module.css`
  - Adds the Ai Bashy note block and refreshed icon sizing.
- Modify `Front/src/features/calendar/components/EventLegend.tsx`
  - Uses `EventIcon`.
  - Shows Ramadan as a period marker, not a repeated icon.
- Modify `Front/src/features/calendar/components/EventLegend.module.css`
  - Adds consistent icon slots and a Ramadan period swatch.
- Modify `Front/src/features/calendar/components/CalendarScreen.tsx`
  - Uses `YearControl`.
- Modify `Front/src/features/calendar/components/CalendarScreen.module.css`
  - Removes old year select styles and adds support for cleaner header controls.
- Modify `Front/src/core/theme/theme.css`
  - Cleans dark/light backgrounds and removes rough light-theme texture.

## Verification Commands

Run after each substantial task:

```bash
cd Front
npm run build
```

Expected: TypeScript and Vite build complete without errors.

After all tasks, run the app and capture desktop visual checks:

```bash
cd Back
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

```bash
cd Front
npm run dev -- --host 127.0.0.1
```

Expected: frontend opens on `http://127.0.0.1:5173/` or the next available Vite port; backend serves `POST /api/calendar/events`.

## Task 1: Icon And Event Display Utilities

**Files:**
- Create: `Front/src/features/calendar/components/EventIcon.tsx`
- Create: `Front/src/features/calendar/utils/eventDisplay.ts`

- [ ] **Step 1: Create `EventIcon.tsx`**

Add this file:

```tsx
import React from 'react';
import type { EventType } from '../types/calendar.types';

interface EventIconProps {
    type: EventType | 'multiple';
    className?: string;
}

export function getEventColorVar(type: EventType | 'multiple'): string {
    switch (type) {
        case 'nooruz':
            return 'var(--color-muchol)';
        case 'togool':
            return 'var(--color-togool)';
        case 'new_moon':
            return 'var(--color-new-moon)';
        case 'full_moon':
            return 'var(--color-full-moon)';
        case 'ramadan':
        case 'ai_bashi':
        case 'eid_al_fitr':
        case 'kurman_ait':
            return 'var(--color-islamic)';
        case 'kadyr_tun':
            return 'var(--color-kadyr)';
        case 'holiday':
            return 'var(--color-holiday)';
        case 'multiple':
            return 'var(--accent-gold)';
        default:
            return 'currentColor';
    }
}

export const EventIcon: React.FC<EventIconProps> = ({ type, className }) => {
    const common = {
        className,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.9,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true,
    };

    if (type === 'nooruz') {
        return (
            <svg {...common}>
                <path d="M12 20V9" />
                <path d="M12 11c-4 0-6-2-6-6 4 0 6 2 6 6z" />
                <path d="M12 13c4 0 6-2 6-6-4 0-6 2-6 6z" />
            </svg>
        );
    }

    if (type === 'togool') {
        return (
            <svg {...common} fill="currentColor" stroke="none">
                <path d="M12 3l2.2 6.1L21 12l-6.8 2.9L12 21l-2.2-6.1L3 12l6.8-2.9L12 3z" />
                <circle cx="18" cy="6" r="1.2" />
                <circle cx="6" cy="7" r="1" />
            </svg>
        );
    }

    if (type === 'new_moon') {
        return (
            <svg {...common}>
                <path d="M15.5 4.5A8 8 0 1 0 19 18a7 7 0 1 1-3.5-13.5z" />
            </svg>
        );
    }

    if (type === 'full_moon') {
        return (
            <svg {...common} fill="currentColor" stroke="none">
                <circle cx="12" cy="12" r="7" />
            </svg>
        );
    }

    if (type === 'eid_al_fitr') {
        return (
            <svg {...common}>
                <path d="M15.5 4.5A8 8 0 1 0 19 18a7 7 0 1 1-3.5-13.5z" />
                <path d="M18 6.2l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="currentColor" stroke="none" />
            </svg>
        );
    }

    if (type === 'kurman_ait') {
        return (
            <svg {...common}>
                <path d="M6 15c0-3 3-5 6-5s6 2 6 5-3 4-6 4-6-1-6-4z" />
                <path d="M16 10c2-2 4-1 4 1s-2 2-3 1" />
                <path d="M9 19v2M15 19v2" />
            </svg>
        );
    }

    if (type === 'kadyr_tun') {
        return (
            <svg {...common} fill="currentColor" stroke="none">
                <path d="M12 4l1.5 4.5H18l-3.6 2.6 1.4 4.4L12 12.8 8.2 15.5l1.4-4.4L6 8.5h4.5z" />
            </svg>
        );
    }

    if (type === 'holiday') {
        return (
            <svg {...common} fill="currentColor" stroke="none">
                <path d="M7 5h10l-2 4 2 4H7z" />
                <path d="M6 5h1v15H6z" />
            </svg>
        );
    }

    if (type === 'ramadan' || type === 'ai_bashi') {
        return (
            <svg {...common}>
                <path d="M15.5 4.5A8 8 0 1 0 19 18a7 7 0 1 1-3.5-13.5z" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <circle cx="12" cy="12" r="7" />
        </svg>
    );
};
```

- [ ] **Step 2: Create `eventDisplay.ts`**

Add this file:

```ts
import type { CalendarEvent, EventType } from '../types/calendar.types';

const EVENT_PRIORITY: Record<EventType, number> = {
    nooruz: 1,
    togool: 2,
    new_moon: 3,
    full_moon: 3,
    kadyr_tun: 4,
    ai_bashi: 4,
    eid_al_fitr: 4,
    kurman_ait: 4,
    ramadan: 4,
    holiday: 5,
};

export function getEventPriority(type: EventType): number {
    return EVENT_PRIORITY[type] ?? 99;
}

export function sortEventsByDisplayPriority(events: CalendarEvent[]): CalendarEvent[] {
    return [...events].sort((a, b) => {
        const priorityDiff = getEventPriority(a.type) - getEventPriority(b.type);
        if (priorityDiff !== 0) return priorityDiff;
        return a.time.localeCompare(b.time);
    });
}

export function selectPrimaryCalendarEvent(events: CalendarEvent[]): CalendarEvent | null {
    if (events.length === 0) return null;
    return sortEventsByDisplayPriority(events)[0];
}

export function getAdditionalEventCount(events: CalendarEvent[]): number {
    return Math.max(0, events.length - 1);
}

export function splitAiBashyNote(events: CalendarEvent[]): {
    visibleEvents: CalendarEvent[];
    aiBashyNote: CalendarEvent | null;
} {
    const hasNewMoon = events.some((event) => event.type === 'new_moon');
    const aiBashy = events.find((event) => event.type === 'ai_bashi') ?? null;

    if (!hasNewMoon || aiBashy === null) {
        return { visibleEvents: events, aiBashyNote: null };
    }

    return {
        visibleEvents: events.filter((event) => event.type !== 'ai_bashi'),
        aiBashyNote: aiBashy,
    };
}
```

- [ ] **Step 3: Run build**

Run:

```bash
cd Front
npm run build
```

Expected: build passes with no TypeScript errors.

## Task 2: Date Cell Layout And Multiple-Event Count

**Files:**
- Modify: `Front/src/features/calendar/components/DayCell.tsx`
- Modify: `Front/src/features/calendar/components/DayCell.module.css`
- Modify: `Front/src/features/calendar/components/EventMarker.tsx`
- Modify: `Front/src/features/calendar/components/EventMarker.module.css`

- [ ] **Step 1: Replace marker list in `DayCell.tsx`**

Use `selectPrimaryCalendarEvent`, `getAdditionalEventCount`, and `EventIcon`. The return body should follow this structure:

```tsx
const primaryEvent = selectPrimaryCalendarEvent(events);
const additionalEventCount = getAdditionalEventCount(events);
const hasEvents = primaryEvent !== null || isInRamadan;
const isHoliday = events.some(e => e.type === 'holiday');

const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasEvents) return;
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
    }
};
```

Render:

```tsx
<div
    className={`${styles.cell} ${styles.active} ${hasEvents ? styles.hasEvents : ''} ${isHoliday ? styles.holiday : ''} ${isInRamadan ? styles.ramadan : ''} ${ramadanContinuesLeft ? styles.ramadanContinuesLeft : ''} ${ramadanContinuesRight ? styles.ramadanContinuesRight : ''}`}
    onClick={hasEvents ? onClick : undefined}
    onKeyDown={handleKeyDown}
    role={hasEvents ? 'button' : undefined}
    tabIndex={hasEvents ? 0 : undefined}
    aria-label={hasEvents ? `Open events for day ${day}` : undefined}
>
    {isInRamadan && (
        <span
            className={`${styles.ramadanBand} ${ramadanContinuesLeft ? styles.ramadanBandContinuesLeft : ''} ${ramadanContinuesRight ? styles.ramadanBandContinuesRight : ''}`}
        />
    )}
    <span className={`${styles.dayNumber} ${isToday ? styles.today : ''}`}>{day}</span>
    {primaryEvent && (
        <span
            className={styles.primaryMarker}
            style={{ color: getEventColorVar(primaryEvent.type) }}
        >
            <EventIcon type={primaryEvent.type} className={styles.primaryMarkerIcon} />
        </span>
    )}
    {additionalEventCount > 0 && (
        <span className={styles.additionalCount}>+{additionalEventCount}</span>
    )}
</div>
```

- [ ] **Step 2: Update imports in `DayCell.tsx`**

Use:

```tsx
import React from 'react';
import type { CalendarEvent } from '../types/calendar.types';
import { EventIcon, getEventColorVar } from './EventIcon';
import { getAdditionalEventCount, selectPrimaryCalendarEvent } from '../utils/eventDisplay';
import styles from './DayCell.module.css';
```

- [ ] **Step 3: Replace cell CSS**

In `DayCell.module.css`, replace the center-stacked marker layout with the approved cell layout:

```css
.cell {
    min-height: 58px;
    border-radius: 8px;
    background: transparent;
    transition: background 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
    position: relative;
    padding: 0;
    border: 1px solid transparent;
}

.active {
    color: var(--text-primary);
}

.hasEvents {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.025);
    border-color: var(--bg-border);
}

.hasEvents:hover,
.hasEvents:focus-visible {
    background: var(--bg-elevated);
    transform: scale(1.03);
    z-index: 2;
    outline: 2px solid rgba(233, 196, 106, 0.55);
    outline-offset: 2px;
}

.dayNumber {
    position: absolute;
    top: 8px;
    left: 9px;
    font-family: var(--font-family);
    font-size: 19px;
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
    z-index: 2;
}

.dayNumber.today {
    color: var(--accent-gold);
}

.primaryMarker {
    position: absolute;
    right: 7px;
    bottom: 7px;
    width: 23px;
    height: 23px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.08);
    z-index: 2;
}

.primaryMarkerIcon {
    width: 16px;
    height: 16px;
}

.additionalCount {
    position: absolute;
    right: 35px;
    bottom: 7px;
    min-width: 25px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: rgba(233, 196, 106, 0.16);
    border: 1px solid rgba(233, 196, 106, 0.32);
    color: var(--accent-gold);
    font-family: var(--font-family);
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    z-index: 2;
}

.ramadanBand {
    position: absolute;
    left: 4px;
    right: 4px;
    bottom: 4px;
    height: 4px;
    border-radius: 999px;
    background: rgba(46, 196, 182, 0.42);
    box-shadow: none;
}

.ramadanBandContinuesLeft {
    left: -2px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.ramadanBandContinuesRight {
    right: -2px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.ramadan {
    background: rgba(46, 196, 182, 0.07);
    border-color: rgba(46, 196, 182, 0.18);
}
```

- [ ] **Step 4: Keep `EventMarker.tsx` temporarily compatible**

Leave `EventMarker.tsx` in place if other imports still reference it. If no imports remain after this task, it can stay unused until final cleanup.

- [ ] **Step 5: Run build**

Run:

```bash
cd Front
npm run build
```

Expected: build passes. If TypeScript reports an unused import, remove it from the affected file.

## Task 3: Event Detail Sheet With Ai Bashy Note

**Files:**
- Modify: `Front/src/features/calendar/components/EventDetailSheet.tsx`
- Modify: `Front/src/features/calendar/components/EventDetailSheet.module.css`

- [ ] **Step 1: Use icon component and Ai Bashy splitter**

Update imports:

```tsx
import React from 'react';
import type { CalendarEvent, Language } from '../types/calendar.types';
import { EventIcon, getEventColorVar } from './EventIcon';
import { splitAiBashyNote } from '../utils/eventDisplay';
import styles from './EventDetailSheet.module.css';
```

- [ ] **Step 2: Split visible events in component**

Inside the component before `return`:

```tsx
const { visibleEvents, aiBashyNote } = splitAiBashyNote(events);
```

Map over `visibleEvents` instead of `events`.

- [ ] **Step 3: Replace old icon maps**

Delete `ICON_COLORS` and `ICON_SYMBOLS`. Replace icon rendering with:

```tsx
<div
    className={styles.iconCircle}
    style={{ backgroundColor: getEventColorVar(ev.type) }}
>
    <EventIcon type={ev.type} className={styles.eventIcon} />
</div>
```

- [ ] **Step 4: Add Ai Bashy note under new moon card**

Inside each event card, after tips block, add:

```tsx
{ev.type === 'new_moon' && aiBashyNote && (
    <div className={styles.aiBashyNote}>
        <span className={styles.aiBashyTitle}>
            {language === 'ky' ? aiBashyNote.label_ky : aiBashyNote.label_ru}
        </span>
        <p className={styles.aiBashyText}>
            {language === 'ky'
                ? aiBashyNote.description_ky
                : aiBashyNote.description_ru}
        </p>
    </div>
)}
```

- [ ] **Step 5: Update sheet CSS**

Add:

```css
.eventIcon {
    width: 27px;
    height: 27px;
    color: #08131C;
}

.aiBashyNote {
    margin-top: 12px;
    padding: 12px 13px;
    border-radius: var(--radius-md);
    background: rgba(46, 196, 182, 0.10);
    border-left: 4px solid var(--color-islamic);
}

.aiBashyTitle {
    display: block;
    color: var(--color-islamic);
    font-size: 13px;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 5px;
}

.aiBashyText {
    margin: 0;
    color: var(--text-primary);
    font-size: 14px;
    line-height: 1.5;
}
```

Increase popup readability:

```css
.eventLabel {
    font-size: 17px;
    font-weight: 800;
}

.eventTime {
    font-size: 14px;
    font-weight: 800;
}

.eventDesc {
    font-size: 14px;
    line-height: 1.5;
}
```

- [ ] **Step 6: Run build**

Run:

```bash
cd Front
npm run build
```

Expected: build passes.

## Task 4: Legend Icon Refresh

**Files:**
- Modify: `Front/src/features/calendar/components/EventLegend.tsx`
- Modify: `Front/src/features/calendar/components/EventLegend.module.css`

- [ ] **Step 1: Replace inline emoji/SVG icon helpers**

Import:

```tsx
import { EventIcon, getEventColorVar } from './EventIcon';
```

Use this helper inside `EventLegend.tsx`:

```tsx
const renderLegendIcon = (type: any) => {
    if (type === 'ramadan_period') {
        return <span className={styles.periodSwatch} />;
    }

    return (
        <span
            className={styles.iconSlot}
            style={{ color: getEventColorVar(type) }}
        >
            <EventIcon type={type} className={styles.legendIcon} />
        </span>
    );
};
```

- [ ] **Step 2: Update legend items**

Use event types:

```tsx
{ type: 'new_moon', label_ky: 'Ай жаңырган күн', label_ru: 'Новолуние' }
{ type: 'full_moon', label_ky: 'Ай толгон күн', label_ru: 'Полнолуние' }
{ type: 'togool', label_ky: 'Тогол ⓘ', label_ru: 'Тогол ⓘ', isInteractive: true, onClick: () => setShowTogoolInfo(true) }
{ type: 'ramadan_period', label_ky: 'Рамазан күндөрү', label_ru: 'Дни Рамазана' }
{ type: 'eid_al_fitr', label_ky: 'Орозо айт', label_ru: 'Орозо айт' }
{ type: 'kadyr_tun', label_ky: 'Кадыр түн', label_ru: 'Ночь Предопределения' }
{ type: 'kurman_ait', label_ky: 'Курман айт', label_ru: 'Курман айт' }
{ type: 'nooruz', label_ky: 'Мүчөл башы ⓘ', label_ru: 'Начало Года (Мүчөл) ⓘ', isInteractive: true, onClick: () => setShowMucholInfo(true) }
{ type: 'holiday', label_ky: 'Мамлекеттик майрамдар', label_ru: 'Гос. праздники' }
```

Do not show Ai Bashy as a separate legend icon in this phase; its behavior is explained through the new-moon popup note.

- [ ] **Step 3: Add legend CSS**

Add:

```css
.iconSlot {
    width: 20px;
    height: 20px;
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
}

.legendIcon {
    width: 18px;
    height: 18px;
}

.periodSwatch {
    width: 28px;
    height: 14px;
    border-radius: 999px;
    background: rgba(46, 196, 182, 0.07);
    box-shadow: inset 0 -4px 0 rgba(46, 196, 182, 0.42);
    border: 1px solid rgba(46, 196, 182, 0.18);
    flex: 0 0 auto;
}
```

- [ ] **Step 4: Run build**

Run:

```bash
cd Front
npm run build
```

Expected: build passes.

## Task 5: Year Control

**Files:**
- Create: `Front/src/features/calendar/components/YearControl.tsx`
- Create: `Front/src/features/calendar/components/YearControl.module.css`
- Modify: `Front/src/features/calendar/components/CalendarScreen.tsx`
- Modify: `Front/src/features/calendar/components/CalendarScreen.module.css`

- [ ] **Step 1: Create `YearControl.tsx`**

```tsx
import React, { useMemo, useState } from 'react';
import type { Language } from '../types/calendar.types';
import styles from './YearControl.module.css';

interface Props {
    value: number;
    onChange: (year: number) => void;
    language: Language;
    getAnimalLabel: (year: number) => string;
}

const START_YEAR = 1900;
const END_YEAR = 2050;

export const YearControl: React.FC<Props> = ({
    value,
    onChange,
    language,
    getAnimalLabel,
}) => {
    const [open, setOpen] = useState(false);
    const years = useMemo(
        () => Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i),
        []
    );

    const setYear = (year: number) => {
        onChange(Math.min(END_YEAR, Math.max(START_YEAR, year)));
        setOpen(false);
    };

    return (
        <div className={styles.wrapper}>
            <button
                className={styles.stepButton}
                onClick={() => setYear(value - 1)}
                aria-label={language === 'ky' ? 'Мурунку жыл' : 'Предыдущий год'}
            >
                ‹
            </button>
            <button
                className={styles.yearButton}
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <span>{value}</span>
                <span className={styles.chevron}>▾</span>
            </button>
            <button
                className={styles.stepButton}
                onClick={() => setYear(value + 1)}
                aria-label={language === 'ky' ? 'Кийинки жыл' : 'Следующий год'}
            >
                ›
            </button>
            {open && (
                <div className={styles.dropdown} role="listbox">
                    {years.map((year) => (
                        <button
                            key={year}
                            className={`${styles.option} ${year === value ? styles.optionActive : ''}`}
                            onClick={() => setYear(year)}
                            role="option"
                            aria-selected={year === value}
                        >
                            <span>{year}</span>
                            <span>{getAnimalLabel(year)}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
```

- [ ] **Step 2: Create `YearControl.module.css`**

```css
.wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.stepButton,
.yearButton {
    min-height: 44px;
    border-radius: 8px;
    border: 1px solid var(--bg-border);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, border-color 0.15s ease;
}

.stepButton {
    width: 44px;
    font-size: 24px;
    font-weight: 800;
}

.yearButton {
    gap: 10px;
    padding: 0 14px;
    color: var(--accent-gold);
    font-size: 24px;
    font-weight: 800;
}

.chevron {
    color: var(--text-secondary);
    font-size: 14px;
}

.stepButton:hover,
.yearButton:hover,
.stepButton:focus-visible,
.yearButton:focus-visible {
    background: var(--bg-elevated);
    border-color: rgba(233, 196, 106, 0.35);
    outline: 2px solid rgba(233, 196, 106, 0.35);
    outline-offset: 2px;
}

.dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 220px;
    max-height: 320px;
    overflow-y: auto;
    z-index: 20;
    border: 1px solid var(--bg-border);
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
    padding: 6px;
}

.option {
    width: 100%;
    min-height: 38px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 10px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 700;
}

.option:hover,
.option:focus-visible,
.optionActive {
    background: rgba(233, 196, 106, 0.12);
    color: var(--accent-gold);
    outline: none;
}
```

- [ ] **Step 3: Replace native select in `CalendarScreen.tsx`**

Import:

```tsx
import { YearControl } from './YearControl';
```

Add helper:

```tsx
const getAnimalLabelForYear = (year: number) => {
    const index = (year - 4) % 12;
    return language === 'ky' ? ANIMAL_NAMES_KY[index] : ANIMAL_NAMES_RU[index];
};
```

Replace the `<select className={styles.yearSelect}>...</select>` block with:

```tsx
<YearControl
    value={selectedYear}
    onChange={setSelectedYear}
    language={language}
    getAnimalLabel={getAnimalLabelForYear}
/>
```

- [ ] **Step 4: Remove obsolete year select CSS**

In `CalendarScreen.module.css`, remove `.yearSelect` from combined selectors and delete the `.yearSelect` block. Keep `.langToggle` and `.themeToggle`.

- [ ] **Step 5: Run build**

Run:

```bash
cd Front
npm run build
```

Expected: build passes.

## Task 6: Theme, Background, And Typography Cleanup

**Files:**
- Modify: `Front/src/core/theme/theme.css`
- Modify: `Front/src/features/calendar/components/CalendarScreen.module.css`
- Modify: `Front/src/features/calendar/components/MonthCalendarGrid.module.css`

- [ ] **Step 1: Add new color token**

In `theme.css`, add:

```css
--color-muchol: #57D68D;
--color-kadyr: #D8B4FE;
```

Add light theme equivalents:

```css
--color-muchol: #2F8E55;
--color-kadyr: #7C4FB0;
```

- [ ] **Step 2: Clean background surfaces**

Set dark root:

```css
--bg-primary: #0A141B;
--bg-surface: #112028;
--bg-elevated: #182A33;
```

Set light root:

```css
--bg-primary: #FAF7EF;
--bg-surface: #F1EADF;
--bg-elevated: #E8DED0;
```

- [ ] **Step 3: Reduce rough texture**

In `CalendarScreen.module.css`, change `.container::before` opacity to:

```css
opacity: 0.03;
```

For light theme:

```css
[data-theme='light'] .container::before {
    opacity: 0.06;
    mix-blend-mode: multiply;
}
```

- [ ] **Step 4: Soften watermark**

Set `.bgWatermark` opacity:

```css
opacity: 0.035;
```

Use light theme opacity:

```css
[data-theme='light'] .bgWatermark {
    opacity: 0.03;
}
```

- [ ] **Step 5: Keep month weekday labels readable**

In `MonthCalendarGrid.module.css`, keep weekday labels sans-serif and readable:

```css
.header {
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    padding: 10px 0 12px;
    letter-spacing: 0.04em;
}
```

- [ ] **Step 6: Run build**

Run:

```bash
cd Front
npm run build
```

Expected: build passes.

## Task 7: Visual Verification

**Files:**
- No source files required.
- Generate temporary screenshots under `/tmp`.

- [ ] **Step 1: Start backend**

Run:

```bash
cd Back
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

Expected: backend listens on `http://127.0.0.1:8000`.

- [ ] **Step 2: Start frontend**

Run:

```bash
cd Front
npm run dev -- --host 127.0.0.1
```

Expected: Vite reports a local URL, normally `http://127.0.0.1:5173/`.

- [ ] **Step 3: Capture desktop dark screenshot**

Run with the active Vite port:

```bash
chromium --headless --no-sandbox --disable-gpu --window-size=1440,1600 --virtual-time-budget=10000 --screenshot=/tmp/kyrgyz-calendar-web-dark.png http://127.0.0.1:5173/
```

Expected: screenshot shows loaded calendar, not skeleton cards.

- [ ] **Step 4: Capture desktop light screenshot**

Open the app, toggle light theme manually, then capture:

```bash
chromium --headless --no-sandbox --disable-gpu --window-size=1440,1600 --virtual-time-budget=10000 --screenshot=/tmp/kyrgyz-calendar-web-light.png http://127.0.0.1:5173/
```

Expected: light theme is clean and not rough/matte.

- [ ] **Step 5: Manual visual acceptance checks**

Verify:

- Date numbers are sans-serif, approximately `19px`, and easy to read.
- Event cells are visually even.
- A date with multiple events shows primary icon plus `+1` or `+2`.
- A new moon plus Ai Bashy date shows new moon icon plus `+1`.
- The new moon popup shows Ai Bashy as a note.
- Ramadan days use a subtle lower-line period marker.
- Orozo Ait uses crescent plus small star.
- Kurman Ait uses the simple sheep SVG.
- Year control appears as `‹ year ▾ ›`.
- Legend uses SVG icons and explains Ramadan as a period marker.

## Self-Review

- Spec coverage: covered icon system, date cell, event count, Ai Bashy popup note, Ramadan period, Orozo Ait, Kurman Ait, year control, typography, theme/background, legend, accessibility.
- Placeholder scan: no unresolved implementation blanks are intentionally left in the plan.
- Type consistency: all event types match `EventType` from `calendar.types.ts`; Muchol uses existing backend event type `nooruz`.

## Execution Handoff

Recommended execution mode: **Inline Execution** for this repo, because the changes touch overlapping React components and CSS modules. Review after Task 2 and Task 5 before completing the theme pass.
