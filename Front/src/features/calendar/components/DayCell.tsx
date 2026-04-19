import React from 'react';
import type { CalendarEvent } from '../types/calendar.types';
import { EventMarker } from './EventMarker';
import styles from './DayCell.module.css';

interface Props {
    day: number | null;
    events: CalendarEvent[];
    isToday: boolean;
    isInRamadan?: boolean;
    ramadanContinuesLeft?: boolean;
    ramadanContinuesRight?: boolean;
    onClick: () => void;
}

export const DayCell: React.FC<Props> = ({
    day,
    events,
    isToday,
    isInRamadan = false,
    ramadanContinuesLeft = false,
    ramadanContinuesRight = false,
    onClick,
}) => {
    if (day === null) {
        return <div className={styles.cell} />;
    }

    const hasEvents = events.length > 0 || isInRamadan;
    const isHoliday = events.some(e => e.type === 'holiday');

    return (
        <div
            className={`${styles.cell} ${styles.active} ${hasEvents ? styles.hasEvents : ''} ${isHoliday ? styles.holiday : ''} ${isInRamadan ? styles.ramadan : ''} ${ramadanContinuesLeft ? styles.ramadanContinuesLeft : ''} ${ramadanContinuesRight ? styles.ramadanContinuesRight : ''}`}
            onClick={hasEvents ? onClick : undefined}
            role={hasEvents ? 'button' : undefined}
            tabIndex={hasEvents ? 0 : undefined}
        >
            {isInRamadan && (
                <span
                    className={`${styles.ramadanBand} ${ramadanContinuesLeft ? styles.ramadanBandContinuesLeft : ''} ${ramadanContinuesRight ? styles.ramadanBandContinuesRight : ''}`}
                />
            )}
            <span className={`${styles.dayNumber} ${isToday ? styles.today : ''}`}>{day}</span>
            {events.length > 0 && (
                <div className={styles.markers}>
                    {events.slice(0, 3).map((e, i) => (
                        <EventMarker key={i} type={e.type} />
                    ))}
                </div>
            )}
        </div>
    );
};
