import React from 'react';
import type { EventType } from '../types/calendar.types';
import styles from './EventMarker.module.css';

interface Props {
    type: EventType;
}

const COLOR_MAP: Record<string, string> = {
    new_moon: 'var(--color-new-moon)',
    full_moon: 'var(--color-full-moon)',
    togool: 'var(--color-togool)',
    eid_al_fitr: 'var(--color-eid)',
    ramadan: 'var(--color-ramadan)',
    kadyr_tun: 'var(--accent-gold)',
    ai_bashi: 'var(--color-ramadan)',
    kurman_ait: 'var(--color-eid)',
};

export const EventMarker: React.FC<Props> = ({ type }) => {
    if (type === 'nooruz') {
        return <span style={{ fontSize: '15px', lineHeight: 1 }}>🌸</span>;
    }
    if (type === 'eid_al_fitr') {
        return <span style={{ fontSize: '15px', lineHeight: 1 }}>☪</span>;
    }
    if (type === 'kurman_ait') {
        return <span style={{ fontSize: '15px', lineHeight: 1 }}>🐑</span>;
    }
    if (type === 'kadyr_tun') {
        return <span style={{ fontSize: '15px', lineHeight: 1 }}>✨</span>;
    }
    if (type === 'ai_bashi') {
        return <span style={{ fontSize: '15px', lineHeight: 1 }}>🌙</span>;
    }
    if (type === 'ramadan') {
        return <span style={{ fontSize: '15px', lineHeight: 1 }}>☾</span>;
    }
    if (type === 'holiday') {
        return <span className={styles.dot} style={{ backgroundColor: '#ef4444' }} />;
    }
    if (type === 'new_moon') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '16px', height: '16px', color: 'var(--color-new-moon)' }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M 8 4 Q 12 11 16 4 M 6 6 Q 12 13 18 6 M 8 20 Q 12 13 16 20 M 6 18 Q 12 11 18 18" />
                <path d="M 4 8 Q 11 12 4 16 M 6 6 Q 13 12 6 18 M 20 8 Q 13 12 20 16 M 18 6 Q 11 12 18 18" />
            </svg>
        );
    }
    if (type === 'togool') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', color: 'var(--color-togool)' }}>
                <path d="M12 2L15 10L23 12L15 14L12 22L9 14L1 12L9 10Z" fill="var(--color-togool)" stroke="none" />
                <circle cx="18" cy="6" r="1.5" fill="var(--color-togool)" stroke="none" />
                <circle cx="6" cy="6" r="1.5" fill="var(--color-togool)" stroke="none" />
            </svg>
        );
    }
    if (type === 'full_moon') {
        return <span style={{ fontSize: '15px', lineHeight: 1 }}>🌕</span>;
    }

    return (
        <span
            className={styles.dot}
            style={{ backgroundColor: COLOR_MAP[type] || 'transparent' }}
        />
    );
};
