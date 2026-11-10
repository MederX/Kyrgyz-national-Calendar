import type { CalendarResponse, Language, LunarMonth } from '../features/calendar/types/calendar.types';
import { DAY_HEADERS, formatLunarDayLabel } from '../features/calendar/utils/lunarMonthGrid';
import { getEventColorVar } from '../features/calendar/components/EventIcon';
import { getDayEvents, getMonthCells, getLunarDay, moveDateByDays, parseDate } from './calendarModel';
import { formatMobileDate } from './mobileFormatting';
import styles from './MobileApp.module.css';

export function MobileMonthGrid({ date, selectedDate, today, responses, language, onSelect, lunar }: { date: string; selectedDate: string; today: string; responses: CalendarResponse[]; language: Language; onSelect: (date: string) => void; lunar?: LunarMonth | null }) {
    const cells = lunar ? [...Array<string | null>((parseDate(lunar.start_date).getUTCDay() + 6) % 7).fill(null), ...Array.from({ length: lunar.days }, (_, index) => moveDateByDays(lunar.start_date, index))] : getMonthCells(date);
    return <div className={styles.calendarGrid} data-calendar-grid>
        {DAY_HEADERS[language].map(day => <span className={styles.dayHeader} key={day}>{day}</span>)}
        {cells.map((iso, index) => {
            if (!iso) return <span key={`empty-${index}`} />;
            const events = getDayEvents(responses, iso), holiday = events.some(event => event.type === 'holiday'), ramadan = events.some(event => event.type === 'ramadan');
            const label = formatMobileDate(iso, language);
            return <button key={iso} type="button" data-date={iso} disabled={iso < '1900-01-01' || iso > '2050-12-31'} className={`${styles.calendarDay} ${selectedDate === iso ? styles.selectedDay : ''} ${holiday ? styles.holiday : ''} ${ramadan ? styles.ramadanDay : ''} ${lunar ? styles.lunarCell : ''}`} aria-label={label} aria-pressed={selectedDate === iso} aria-current={today === iso ? 'date' : undefined} onClick={() => onSelect(iso)}>
                <span>{lunar ? formatLunarDayLabel(getLunarDay(lunar, iso), language) : parseDate(iso).getUTCDate()}</span>
                {lunar && <small>{iso.slice(8)}.{iso.slice(5, 7)}</small>}
                {events.length > 0 && <span className={styles.eventDots} aria-hidden="true">{events.slice(0, 3).map(event => <i key={event.type} style={{ backgroundColor: getEventColorVar(event.type) }} />)}</span>}
            </button>;
        })}
    </div>;
}
