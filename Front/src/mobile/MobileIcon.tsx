import type { CSSProperties } from 'react';

export type MobileIconName = 'tunduk' | 'sun' | 'moon' | 'calendar' | 'book' | 'pin' | 'chevron' | 'year';
export function MobileIcon({ name, className, style }: { name: MobileIconName; className?: string; style?: CSSProperties }) {
    return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {name === 'tunduk' && <g strokeWidth="1.1"><circle cx="12" cy="12" r="9" /><path d="M8 4Q12 11 16 4M6 6Q12 13 18 6M8 20Q12 13 16 20M6 18Q12 11 18 18M4 8Q11 12 4 16M6 6Q13 12 6 18M20 8Q13 12 20 16M18 6Q11 12 18 18" /></g>}
        {name === 'sun' && <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}
        {name === 'moon' && <path d="M16 3a9 9 0 1 0 5 14A8 8 0 0 1 16 3z" />}
        {name === 'calendar' && <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 4h1m5 0h1m-7 3h1" /></>}
        {name === 'book' && <path d="M12 5v16M12 5C9 3 6 3 3 4v15c3-1 6-1 9 2 3-3 6-3 9-2V4c-3-1-6-1-9 1zM6 8l3 1m-3 3 3 1m6-4 3-1m-3 5 3-1" />}
        {name === 'pin' && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0z" /><circle cx="12" cy="10" r="2.5" /></>}
        {name === 'chevron' && <path d="m9 6 6 6-6 6" />}
        {name === 'year' && <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 3v18M16 3v18M3 9h18M3 15h18" /></>}
    </svg>;
}
