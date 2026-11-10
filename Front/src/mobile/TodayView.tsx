import type { CalendarEvent, CalendarResponse, Language } from '../features/calendar/types/calendar.types';
import { ANIMAL_NAMES_KY, ANIMAL_YEAR_NAMES_RU, ANIMAL_EMOJIS, MONTH_NAMES_KY, MONTH_NAMES_RU } from '../features/calendar/utils/calendarCopy';
import { formatLunarDayLabel, formatDisplayDate } from '../features/calendar/utils/lunarMonthGrid';
import { EventIcon, getEventColorVar } from '../features/calendar/components/EventIcon';
import { EventRows } from './EventRows';
import { CalendarLogo } from './CalendarLogo';
import { MoonPhaseIcon } from './MoonPhaseIcon';
import { mobileCopy } from './mobileCopy';
import { getDayEvents, getLunarDay, getLunarMonthForDate, getUpcomingEvent, parseDate } from './calendarModel';
import { getWeekdayName } from './mobileFormatting';
import styles from './MobileApp.module.css';

export function TodayView({ date, now, latitude, responses, language, onOpenEvent, onCalendar }: { date: string; now: Date; latitude: number; responses: CalendarResponse[]; language: Language; onOpenEvent: (event: CalendarEvent) => void; onCalendar: (date: string, mode: 'solar' | 'lunar') => void }) {
    const t = mobileCopy[language];
    const parsed = parseDate(date), year = parsed.getUTCFullYear(), monthIndex = parsed.getUTCMonth(), animal = (year - 4) % 12;
    const lunar = getLunarMonthForDate(responses, date), events = getDayEvents(responses, date), upcoming = getUpcomingEvent(responses, date);
    return <section className={styles.todayLayout} aria-label={t.todayTitle} data-screen="today">
        <div className={styles.todaySummary}>
        <div className={styles.dayHero}><CalendarLogo className={styles.watermark} /><p className={styles.eyebrow}>{t.todayTitle}</p>
            <div className={styles.dateLockup}><span className={styles.dayNumber}>{parsed.getUTCDate()}</span><div className={styles.dateInfo}>
                <h1 className={styles.dateMonth}>{(language === 'ky' ? MONTH_NAMES_KY : MONTH_NAMES_RU)[monthIndex]} {year}</h1>
                <p className={styles.weekday}>{getWeekdayName(date, language)}</p>
                <p className={styles.yearPill}>{language === 'ky' ? `${ANIMAL_NAMES_KY[animal]} жылы` : ANIMAL_YEAR_NAMES_RU[animal]} {ANIMAL_EMOJIS[animal]}</p>
            </div></div>
        </div>
        {lunar ? <button className={styles.lunarCard} onClick={() => onCalendar(date, 'lunar')}><MoonPhaseIcon now={now} latitude={latitude} language={language} /><span>
            <span className={styles.eyebrow}>{lunar.name}</span><strong className={styles.lunarDay}>{formatLunarDayLabel(getLunarDay(lunar, date), language)}</strong>
            <span className={styles.lunarSubtitle}>{language === 'ky' ? 'Ай жаңыргандан ай жаңырганга чейинки күндөр' : 'Дни от новолуния до новолуния'}</span>
        </span></button> : <p className={styles.empty}>{t.noLunar}</p>}
        </div>
        <section className={styles.todayEvents} aria-label={t.events}>
            <div className={styles.sectionHeading}><h2>{t.events}</h2><span className={styles.count}>{t.eventsCount(events.length)}</span></div>
            <EventRows events={events} language={language} onOpen={onOpenEvent} />
        </section>
        {upcoming && <section className={styles.upcoming} aria-label={t.upcoming}><p className={styles.eyebrow}>{t.upcoming}</p><button onClick={() => onCalendar(upcoming.date, 'solar')} className={styles.upcomingButton}>
            <span className={styles.upcomingIcon} style={{ color: getEventColorVar(upcoming.type) }}><EventIcon type={upcoming.type} /></span><strong>{language === 'ky' ? upcoming.label_ky : upcoming.label_ru}</strong><time dateTime={upcoming.date}>{formatDisplayDate(upcoming.date)}</time>
        </button></section>}
    </section>;
}
