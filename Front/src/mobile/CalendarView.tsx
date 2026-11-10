import type { CalendarEvent, CalendarResponse, Language } from '../features/calendar/types/calendar.types';
import { YearControl } from '../features/calendar/components/YearControl';
import { ANIMAL_NAMES_KY, ANIMAL_NAMES_RU, ANIMAL_YEAR_NAMES_RU, MONTH_NAMES_KY, MONTH_NAMES_RU, getKyMonthGenitive, KY_DAY_NAMES } from '../features/calendar/utils/calendarCopy';
import { MobileIcon } from './MobileIcon';
import { MobileMonthGrid } from './MobileMonthGrid';
import { EventRows } from './EventRows';
import { mobileCopy } from './mobileCopy';
import { clampDate, getDayEvents, getLunarMonthForDate, moveDateByDays, parseDate, shiftCalendarMonth } from './calendarModel';
import styles from './MobileApp.module.css';

export type CalendarMode = 'solar' | 'lunar' | 'year';
export function CalendarView({ date, today, responses, language, mode, onMode, onSelect, onOpenEvent }: { date: string; today: string; responses: CalendarResponse[]; language: Language; mode: CalendarMode; onMode: (mode: CalendarMode) => void; onSelect: (date: string) => void; onOpenEvent: (event: CalendarEvent) => void }) {
    const t = mobileCopy[language], parsed = parseDate(date), year = parsed.getUTCFullYear(), monthIndex = parsed.getUTCMonth();
    const names = language === 'ky' ? MONTH_NAMES_KY : MONTH_NAMES_RU;
    const animal = (year - 4) % 12;
    const animalYearLabel = language === 'ky' ? `${ANIMAL_NAMES_KY[animal]} жылы` : ANIMAL_YEAR_NAMES_RU[animal];
    const lunar = getLunarMonthForDate(responses, date);
    const events = getDayEvents(responses, date);
    const previous = mode === 'lunar' && lunar ? clampDate(moveDateByDays(lunar.start_date, -1)) : shiftCalendarMonth(date, -1);
    const next = mode === 'lunar' && lunar ? clampDate(moveDateByDays(lunar.end_date, 1)) : shiftCalendarMonth(date, 1);
    const selectYear = (newYear: number) => {
        const lastDay = new Date(Date.UTC(newYear, monthIndex + 1, 0)).getUTCDate();
        onSelect(`${newYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(Math.min(lastDay, parsed.getUTCDate())).padStart(2, '0')}`);
    };
    const dateLabel = language === 'ky' ? `${getKyMonthGenitive(monthIndex)} ${KY_DAY_NAMES[parsed.getUTCDate()]}` : new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(parsed);
    return <section className={styles.calendarScreen} data-screen="calendar">
        <div className={styles.calendarTopbar}>
        <div className={styles.sectionHeading}><h1 className={styles.pageTitle}>{t.calendar}</h1><button className={styles.iconButton} aria-label={mode === 'year' ? t.month : t.year} onClick={() => onMode(mode === 'year' ? 'solar' : 'year')}><MobileIcon name={mode === 'year' ? 'calendar' : 'year'} /></button></div>
        <div className={styles.yearControl}><YearControl value={year} onChange={selectYear} language={language} getAnimalLabel={year => (language === 'ky' ? ANIMAL_NAMES_KY : ANIMAL_NAMES_RU)[(year - 4) % 12]} /><p className={styles.animalYear} data-animal-year>{animalYearLabel}</p></div>
        <div className={styles.segment}><button aria-pressed={mode !== 'lunar'} onClick={() => onMode('solar')}>{t.solar}</button><button aria-pressed={mode === 'lunar'} onClick={() => onMode('lunar')}>{t.lunar}</button></div>
        </div>
        {mode === 'year' ? <div className={styles.yearGrid} data-year-overview>{Array.from({ length: 12 }, (_, index) => {
            const month = `${year}-${String(index + 1).padStart(2, '0')}-01`;
            return <section className={styles.yearMonth} key={month}><h2><button onClick={() => { onSelect(month); onMode('solar'); }}>{names[index]}</button></h2><MobileMonthGrid date={month} selectedDate={date} today={today} responses={responses} language={language} onSelect={iso => { onSelect(iso); onMode('solar'); }} /></section>;
        })}</div> : <div className={styles.calendarWorkspace}>
            <section className={styles.monthPanel} aria-label={mode === 'lunar' ? t.lunar : t.solar}>
            <div className={styles.monthHeading}><button className={styles.iconButton} disabled={previous === date} aria-label={t.previous} onClick={() => onSelect(previous)}><MobileIcon name="chevron" style={{ transform: 'rotate(180deg)' }} /></button>
                <div><h2>{mode === 'lunar' ? lunar?.name ?? t.lunar : names[monthIndex]}</h2><p>{mode === 'lunar' && lunar ? `${lunar.start_date.split('-').reverse().join('-')} - ${lunar.end_date.split('-').reverse().join('-')}` : String(year)}</p></div>
                <button className={styles.iconButton} disabled={next === date} aria-label={t.next} onClick={() => onSelect(next)}><MobileIcon name="chevron" /></button>
            </div>
            {mode === 'lunar' && !lunar ? <p className={styles.empty}>{t.noLunar}</p> : <MobileMonthGrid date={date} selectedDate={date} today={today} responses={responses} language={language} onSelect={onSelect} lunar={mode === 'lunar' ? lunar : null} />}
            </section>
            <section className={styles.selectedDayPanel} aria-label={dateLabel}>
            <div className={styles.sectionHeading}><h2>{dateLabel}</h2><span className={styles.count}>{t.eventsCount(events.length)}</span></div>
            <EventRows events={events} language={language} onOpen={onOpenEvent} />
            </section>
        </div>}
    </section>;
}
