import type { CSSProperties } from 'react';

/** Approved mobile mark: prototype D, “Calendar and cycle”. */
export function CalendarLogo({ className, style }: { className?: string; style?: CSSProperties }) {
    return <svg className={className} style={style} viewBox="10 10 80 80" fill="none" aria-hidden="true" data-mobile-logo="calendar-cycle">
        <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="20" y="25" width="60" height="57" rx="11" />
            <path d="M34 17V32M66 17V32M21 42H79" />
        </g>
        <circle cx="50" cy="62" r="13" fill="currentColor" />
        <path d="M50 49A13 13 0 0 1 50 75Z" fill="#10262c" />
    </svg>;
}
