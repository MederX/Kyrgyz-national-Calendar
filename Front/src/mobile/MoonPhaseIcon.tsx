import { useId } from 'react';
import type { Language } from '../features/calendar/types/calendar.types';
import { getIlluminatedMoonPath, getMoonAppearance } from './moonPhase';
import styles from './MobileApp.module.css';

export function MoonPhaseIcon({ now, latitude, language }: { now: Date; latitude: number; language: Language }) {
    const id = useId();
    const gradientId = `${id}-moon-surface`, clipId = `${id}-moon-lit`;
    const { fraction, phase, waxing, litSide } = getMoonAppearance(now, latitude);
    const phaseName = fraction < 0.01
        ? language === 'ky' ? 'Ай жаңырган күн' : 'Новолуние'
        : fraction > 0.99
            ? language === 'ky' ? 'Ай толгон күн' : 'Полнолуние'
            : waxing
                ? language === 'ky' ? 'Өсүп жаткан Ай' : 'Растущая Луна'
                : language === 'ky' ? 'Кемип жаткан Ай' : 'Убывающая Луна';
    const label = `${phaseName} · ${Math.round(fraction * 100)}%`;
    const path = getIlluminatedMoonPath(fraction, litSide);

    return <span className={styles.lunarOrb}>
        <svg className={styles.moonDisk} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label={label} data-moon-phase={phase} data-moon-illumination={fraction} data-lit-side={litSide}>
            <title>{label}</title>
            <defs>
                <radialGradient id={gradientId} cx="35%" cy="30%" r="80%">
                    <stop offset="0" stopColor="#fff9e8" />
                    <stop offset="0.7" stopColor="#dedfcc" />
                    <stop offset="1" stopColor="#acbab5" />
                </radialGradient>
                <clipPath id={clipId}><path d={path} /></clipPath>
            </defs>
            <circle cx="24" cy="24" r="21" fill="#172b37" />
            <path d={path} fill={`url(#${gradientId})`} data-moon-lit />
            <g clipPath={`url(#${clipId})`} fill="#7e9392" opacity="0.2">
                <circle cx="17" cy="15" r="5" />
                <circle cx="29" cy="29" r="6" />
                <circle cx="16" cy="32" r="3" />
                <circle cx="33" cy="17" r="2.5" />
            </g>
            <circle cx="24" cy="24" r="21" fill="none" stroke="#879996" strokeWidth="0.6" />
        </svg>
    </span>;
}
