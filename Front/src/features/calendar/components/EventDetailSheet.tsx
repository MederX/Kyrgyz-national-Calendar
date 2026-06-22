import React from 'react';
import type { CalendarEvent, Language, LunarMonth } from '../types/calendar.types';
import { EventIcon, getEventColorVar } from './EventIcon';
import { splitAiBashyNote } from '../utils/eventDisplay';
import { findLunarTransitionForNewMoon } from '../utils/lunarMonthGrid';
import styles from './EventDetailSheet.module.css';

interface Props {
    events: CalendarEvent[];
    date: string;
    onClose: () => void;
    language: Language;
    lunarMonths?: LunarMonth[];
}

export const EventDetailSheet: React.FC<Props> = ({
    events,
    date,
    onClose,
    language,
    lunarMonths = [],
}) => {
    const { visibleEvents, aiBashyNote } = splitAiBashyNote(events);

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.handle} />
                <div className={styles.header}>
                    <h3 className={styles.dateTitle}>{date}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {visibleEvents.length > 0 && (
                    <div className={styles.eventList}>
                        {visibleEvents.map((ev, i) => (
                        <div key={i} className={styles.eventCard}>
                            <div
                                className={styles.iconCircle}
                                data-event-type={ev.type}
                                style={{ '--popup-event-color': getEventColorVar(ev.type) } as React.CSSProperties}
                            >
                                <EventIcon
                                    type={ev.type}
                                    className={styles.eventIcon}
                                />
                            </div>
                            <div className={styles.eventInfo}>
                                <span className={styles.eventLabel}>
                                    {language === 'ky' ? ev.label_ky : ev.label_ru}
                                </span>
                                {ev.time && <span className={styles.eventTime}>{ev.time}</span>}
                                <span className={styles.eventDesc}>
                                    {language === 'ky' ? ev.description_ky : ev.description_ru}
                                </span>
                                {(language === 'ky' ? ev.tips_ky : ev.tips_ru) && (
                                    <div className={styles.tipsBox}>
                                        <span className={styles.tipsTitle}>
                                            {language === 'ky' ? 'Күндүн кеңеши:' : 'Совет дня:'}
                                        </span>
                                        <p className={styles.tipsText}>
                                            {language === 'ky' ? ev.tips_ky : ev.tips_ru}
                                        </p>
                                    </div>
                                )}
                                {ev.type === 'new_moon' && (() => {
                                    const transition = findLunarTransitionForNewMoon(lunarMonths, ev.date);

                                    if (!transition) {
                                        return null;
                                    }

                                    return (
                                        <div className={styles.lunarTransitionBox}>
                                            <span className={styles.lunarTransitionTitle}>
                                                {language === 'ky' ? 'Ай календары:' : 'Лунный календарь:'}
                                            </span>
                                            <p className={styles.lunarTransitionText}>
                                                {language === 'ky' ? (
                                                    <>
                                                        Бул күнү{' '}
                                                        <strong className={styles.lunarMonthEnding}>
                                                            {transition.endingMonthDisplayNameKy}
                                                        </strong>{' '}
                                                        аяктап{' '}
                                                        <strong className={styles.lunarMonthStarting}>
                                                            {transition.startingMonthName}
                                                        </strong>{' '}
                                                        аттуу ай башталат.
                                                        {transition.visibleUntilDisplayDate && (
                                                            <>
                                                                {' '}Ал асманда {transition.visibleUntilDisplayDate} чейин болот.
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        В этот день заканчивается месяц{' '}
                                                        <strong className={styles.lunarMonthEnding}>
                                                            {transition.endingMonthName}
                                                        </strong>{' '}
                                                        и начинается месяц{' '}
                                                        <strong className={styles.lunarMonthStarting}>
                                                            {transition.startingMonthName}
                                                        </strong>.
                                                        {transition.visibleUntilDisplayDate && (
                                                            <>
                                                                {' '}Он будет на небе до {transition.visibleUntilDisplayDate}.
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    );
                                })()}
                                {ev.type === 'new_moon' && aiBashyNote && (
                                    <div className={styles.aiBashyNote}>
                                        <span className={styles.aiBashyTitle}>
                                            {language === 'ky'
                                                ? aiBashyNote.label_ky
                                                : aiBashyNote.label_ru}
                                        </span>
                                        <p className={styles.aiBashyText}>
                                            {language === 'ky'
                                                ? aiBashyNote.description_ky
                                                : aiBashyNote.description_ru}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
