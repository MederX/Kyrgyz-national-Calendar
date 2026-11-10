import type { CalendarEvent, Language } from '../features/calendar/types/calendar.types';
import { EventIcon, getEventColorVar } from '../features/calendar/components/EventIcon';
import { MobileIcon } from './MobileIcon';
import { mobileCopy } from './mobileCopy';
import styles from './MobileApp.module.css';

export function EventRows({ events, language, onOpen }: { events: CalendarEvent[]; language: Language; onOpen: (event: CalendarEvent) => void }) {
    if (!events.length) return <p className={styles.empty} data-empty-day>{mobileCopy[language].empty}</p>;
    return <div className={styles.eventList}>{events.map(event => <button key={`${event.date}/${event.type}/${event.time}`} className={styles.eventRow} onClick={() => onOpen(event)} data-event={event.type}>
        <span className={styles.eventIcon} style={{ color: getEventColorVar(event.type) }}><EventIcon type={event.type} /></span>
        <span className={styles.eventCopy}><span className={styles.eventTitle}>{language === 'ky' ? event.label_ky : event.label_ru}</span>
            <span className={styles.eventDescription}>{language === 'ky' ? event.description_ky : event.description_ru}</span>
        </span>
        {event.time && <time className={styles.eventTime}>{event.time}</time>}<MobileIcon name="chevron" className={styles.chevron} />
    </button>)}</div>;
}
