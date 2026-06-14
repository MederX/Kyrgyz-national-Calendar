import React from 'react';
import type { CalendarEvent } from '../types/calendar.types';
import { EventIcon, getEventColorVar } from './EventIcon';
import {
    getAdditionalEventCount,
    selectPrimaryCalendarEvent,
} from '../utils/eventDisplay';
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

    const primaryEvent = selectPrimaryCalendarEvent(events);
    const additionalEventCount = getAdditionalEventCount(events);
    const hasEvents = primaryEvent !== null || isInRamadan;
    const isInteractive = hasEvents || isToday;
    const isHoliday = events.some(e => e.type === 'holiday');

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!isInteractive) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <div
            className={`${styles.cell} ${styles.active} ${isInteractive ? styles.hasEvents : ''} ${isHoliday ? styles.holiday : ''} ${isInRamadan ? styles.ramadan : ''} ${ramadanContinuesLeft ? styles.ramadanContinuesLeft : ''} ${ramadanContinuesRight ? styles.ramadanContinuesRight : ''}`}
            onClick={isInteractive ? onClick : undefined}
            onKeyDown={handleKeyDown}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-label={isInteractive ? `Open day details for day ${day}` : undefined}
        >
            {isInRamadan && (
                <span
                    className={`${styles.ramadanBand} ${ramadanContinuesLeft ? styles.ramadanBandContinuesLeft : ''} ${ramadanContinuesRight ? styles.ramadanBandContinuesRight : ''}`}
                />
            )}
            <span className={`${styles.dayNumber} ${isToday ? styles.today : ''}`}>{day}</span>
            {primaryEvent && (
                <span
                    className={`${styles.primaryMarker} ${additionalEventCount > 0 ? styles.primaryMarkerWithCount : ''}`}
                    style={{ color: getEventColorVar(primaryEvent.type) }}
                >
                    <EventIcon
                        type={primaryEvent.type}
                        className={styles.primaryMarkerIcon}
                    />
                </span>
            )}
            {additionalEventCount > 0 && (
                <span className={styles.additionalCount}>
                    +{additionalEventCount}
                </span>
            )}
        </div>
    );
};
