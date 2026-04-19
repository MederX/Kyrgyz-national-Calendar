import React from 'react';
import type { CalendarEvent, Language, EventType } from '../types/calendar.types';
import styles from './EventDetailSheet.module.css';

interface Props {
    events: CalendarEvent[];
    date: string;
    onClose: () => void;
    language: Language;
}

const ICON_COLORS: Record<string, string> = {
    new_moon: 'var(--color-new-moon)',
    full_moon: 'var(--color-full-moon)',
    togool: 'var(--color-togool)',
    nooruz: '#10B981',
    holiday: '#ef4444',
    eid_al_fitr: 'var(--color-eid)',
    ramadan: 'var(--color-ramadan)',
    kadyr_tun: 'var(--accent-gold)',
    ai_bashi: 'var(--color-ramadan)',
    kurman_ait: 'var(--color-eid)',
};

const ICON_SYMBOLS: Record<string, React.ReactNode> = {
    new_moon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '18px', height: '18px' }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M 8 4 Q 12 11 16 4 M 6 6 Q 12 13 18 6 M 8 20 Q 12 13 16 20 M 6 18 Q 12 11 18 18" />
            <path d="M 4 8 Q 11 12 4 16 M 6 6 Q 13 12 6 18 M 20 8 Q 13 12 20 16 M 18 6 Q 11 12 18 18" />
        </svg>
    ),
    full_moon: '🌕',
    togool: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
            <path d="M12 2L15 10L23 12L15 14L12 22L9 14L1 12L9 10Z" fill="currentColor" stroke="none" />
            <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none" />
        </svg>
    ),
    nooruz: '🌸',
    holiday: '🚩',
    eid_al_fitr: '☪',
    ramadan: '☾',
    kadyr_tun: '✨',
    ai_bashi: '🌙',
    kurman_ait: '🐑',
};

export const EventDetailSheet: React.FC<Props> = ({
    events,
    date,
    onClose,
    language,
}) => {
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

                <div className={styles.eventList}>
                    {events.map((ev, i) => (
                        <div key={i} className={styles.eventCard}>
                            <div
                                className={styles.iconCircle}
                                style={{ backgroundColor: ICON_COLORS[ev.type] }}
                            >
                                <span className={styles.iconEmoji}>
                                    {ICON_SYMBOLS[ev.type]}
                                </span>
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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
